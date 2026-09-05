import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import postgres from 'postgres'
import { z } from 'zod'
import type { JsonValue } from '@mcp-b/webmcp-types'
import type { Page } from '@playwright/test'

const developmentEmailSchema = z
  .object({
    createdAt: z.iso.datetime(),
    idempotencyKey: z.string(),
    subject: z.string(),
    text: z.string(),
    to: z.string(),
  })
  .loose()

const webMcpResultSchema = z
  .object({
    content: z.array(
      z.object({
        text: z.string(),
        type: z.literal('text'),
      }),
    ),
    isError: z.boolean(),
  })
  .loose()

const mailboxDirectory = join(process.cwd(), '.next', 'development-emails')
const clientIpByProject = new Map([
  ['chromium', '192.0.2.10'],
  ['mobile-chromium', '192.0.2.20'],
])

function clientIpFor(projectName: string) {
  const clientIp = clientIpByProject.get(projectName)
  if (clientIp === undefined) throw new Error(`No E2E client IP for ${projectName}`)
  return clientIp
}

function databaseUrl() {
  const value = process.env.DATABASE_URL
  if (value === undefined || value === '')
    throw new Error('DATABASE_URL is required for the admin E2E test')
  return value
}

async function findClaimedAdministrator() {
  const sql = postgres(databaseUrl(), { max: 1 })
  try {
    const [administrator] = await sql<{ email: string; id: string }[]>`
      select claim.admin_user_id as id, person.email
      from admin_bootstrap_claim claim
      join "user" person on person.id = claim.admin_user_id
      where claim.singleton = true
    `
    return administrator ?? null
  } finally {
    await sql.end()
  }
}

async function findEmail(
  recipient: string,
  subject: string,
  excludedIdempotencyKey?: string,
) {
  const filenames = await readdir(mailboxDirectory).catch(() => [])
  const matches: Array<z.infer<typeof developmentEmailSchema>> = []
  for (const filename of filenames) {
    const source = await readFile(join(mailboxDirectory, filename), 'utf8')
    const message = developmentEmailSchema.safeParse(JSON.parse(source))
    if (
      message.success &&
      message.data.to === recipient &&
      message.data.subject === subject &&
      message.data.idempotencyKey !== excludedIdempotencyKey
    ) {
      matches.push(message.data)
    }
  }

  const latest = matches.toSorted((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  )[0]
  const link = latest === undefined ? null : /https?:\/\/\S+/u.exec(latest.text)?.[0]
  return latest === undefined || link === null || link === undefined
    ? null
    : { idempotencyKey: latest.idempotencyKey, link }
}

async function waitForEmail(
  recipient: string,
  subject: string,
  excludedIdempotencyKey?: string,
) {
  await expect
    .poll(() => findEmail(recipient, subject, excludedIdempotencyKey), {
      timeout: 15_000,
    })
    .not.toBeNull()

  const email = await findEmail(recipient, subject, excludedIdempotencyKey)
  if (email === null) throw new Error(`No ${subject} email arrived for the admin`)
  return email
}

async function signIn(page: Page, email: string, password: string) {
  await page.goto('/sign-in')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/account$/u)
}

async function createFirstAdministrator(page: Page) {
  const identity = crypto.randomUUID()
  const email = `admin-${identity}@example.test`
  const password = `Admin-${identity}!`

  await page.goto('/sign-up')
  await page.getByLabel('Display name').fill('Template Administrator')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(password)
  await page.getByRole('button', { name: 'Create account' }).click()
  const verification = await waitForEmail(email, 'Verify your email')
  await page.goto(verification.link)
  await expect(page).toHaveURL(/\/sign-in$/u)
  await signIn(page, email, password)

  await expect.poll(findClaimedAdministrator).not.toBeNull()
  const administrator = await findClaimedAdministrator()
  if (administrator === null)
    throw new Error('The first verified login did not claim administrator access')
  return administrator
}

async function recoverExistingAdministrator(
  page: Page,
  administrator: { readonly email: string; readonly id: string },
) {
  const password = `Recovered-${crypto.randomUUID()}!`
  const previousReset = await findEmail(administrator.email, 'Reset your password')

  await page.goto('/forgot-password')
  await page.getByLabel('Email').fill(administrator.email)
  await page.getByRole('button', { name: 'Send reset link' }).click()
  const reset = await waitForEmail(
    administrator.email,
    'Reset your password',
    previousReset?.idempotencyKey,
  )
  await page.goto(reset.link)
  await page.getByLabel('New password').fill(password)
  await page.getByRole('button', { name: 'Save new password' }).click()
  await expect(page.getByText('Your password has been reset.')).toBeVisible()
  await signIn(page, administrator.email, password)
  return administrator
}

async function ensureAdministratorSession(page: Page) {
  const administrator = await findClaimedAdministrator()
  return administrator === null
    ? createFirstAdministrator(page)
    : recoverExistingAdministrator(page, administrator)
}

function listWebMcpToolNames(page: Page) {
  return page.evaluate(async () => {
    const context = document.modelContext
    if (context === undefined) return []
    return (await context.getTools()).map((tool) => tool.name)
  })
}

async function executeWebMcpTool(page: Page, name: string, input: JsonValue) {
  const serializedResult = await page.evaluate(
    ({ inputJson, toolName }) => {
      // oxlint-disable-next-line typescript/no-deprecated -- The polyfill's isolated testing seam is the supported E2E invocation surface.
      const testing = navigator.modelContextTesting
      if (testing === undefined) throw new Error('WebMCP testing shim is unavailable')
      return testing.executeTool(toolName, inputJson)
    },
    { inputJson: JSON.stringify(input), toolName: name },
  )
  if (serializedResult === null) throw new Error(`WebMCP tool ${name} returned null`)
  return webMcpResultSchema.parse(JSON.parse(serializedResult))
}

test('an administrator completes task-oriented workflows with safe agent parity', async ({
  page,
  request,
}, testInfo) => {
  await page.setExtraHTTPHeaders({
    'x-forwarded-for': clientIpFor(testInfo.project.name),
  })
  const administrator = await ensureAdministratorSession(page)

  await page.goto('/admin')
  await expect(
    page.getByRole('heading', { name: 'What needs attention?' }),
  ).toBeVisible()
  await expect(page.locator('canvas')).toHaveCount(4)
  await expect.poll(() => listWebMcpToolNames(page)).toContain('get_admin_home_summary')
  const homeSummary = await executeWebMcpTool(page, 'get_admin_home_summary', {})
  expect(homeSummary.isError).toBe(false)
  expect(homeSummary.content[0]?.text).toContain('administratorCount')

  await page.getByRole('link', { name: /Support a person/u }).click()
  await expect(page).toHaveURL(/\/admin\/users$/u)
  await expect(
    page.locator('#admin-content').getByText(administrator.email),
  ).toBeVisible()
  await expect.poll(() => listWebMcpToolNames(page)).toContain('list_admin_users')
  const safeUsers = await executeWebMcpTool(page, 'list_admin_users', {})
  expect(safeUsers.isError).toBe(false)
  expect(safeUsers.content[0]?.text).toContain(administrator.email)
  expect(safeUsers.content[0]?.text).not.toContain('password')
  const previousReset = await findEmail(administrator.email, 'Reset your password')
  const preparedReset = await executeWebMcpTool(page, 'prepare_admin_password_reset', {
    userId: administrator.id,
  })
  expect(preparedReset.isError).toBe(false)
  await expect(page.getByRole('button', { name: 'Confirm reset email' })).toBeFocused()
  await page.getByRole('button', { name: 'Confirm reset email' }).click()
  await expect(page.getByText('Password-reset email requested.')).toBeVisible()
  await waitForEmail(
    administrator.email,
    'Reset your password',
    previousReset?.idempotencyKey,
  )

  await page.getByRole('link', { name: 'Service accounts' }).click()
  await expect
    .poll(() => listWebMcpToolNames(page))
    .toContain('prepare_create_service_account')
  const preparedCreation = await executeWebMcpTool(
    page,
    'prepare_create_service_account',
    {
      name: 'Deployment health monitor',
      scopes: ['system:health:read'],
    },
  )
  expect(preparedCreation.isError).toBe(false)
  const serviceNameInput = page.getByLabel('Service account name')
  await expect(serviceNameInput).toHaveValue('Deployment health monitor')
  await expect(page.getByRole('button', { name: 'Confirm creation' })).toBeFocused()
  const inputFontSize = await serviceNameInput.evaluate((element) =>
    Number(getComputedStyle(element).fontSize.replace('px', '')),
  )
  expect(inputFontSize).toBeGreaterThanOrEqual(16)
  await page.getByRole('button', { name: 'Confirm creation' }).click()
  const tokenInput = page.getByLabel('One-time service-account token')
  await expect(tokenInput).toBeVisible()
  const firstToken = await tokenInput.inputValue()
  expect(
    (
      await request.get('/api/service/health', {
        headers: { authorization: `Bearer ${firstToken}` },
      })
    ).status(),
  ).toBe(200)

  const safeList = await executeWebMcpTool(page, 'list_admin_service_accounts', {})
  expect(safeList.isError).toBe(false)
  expect(safeList.content[0]?.text).not.toContain(firstToken)

  const rotateButton = page.getByRole('button', { name: 'Rotate' })
  const serviceAccountId = z
    .uuid()
    .parse(await rotateButton.getAttribute('data-admin-rotate-service-account-id'))
  const preparedRotation = await executeWebMcpTool(
    page,
    'prepare_rotate_service_account',
    { serviceAccountId },
  )
  expect(preparedRotation.isError).toBe(false)
  await page.getByRole('button', { name: 'Confirm rotation' }).click()
  const replacementToken = await tokenInput.inputValue()
  expect(replacementToken).not.toBe(firstToken)
  expect(
    (
      await request.get('/api/service/health', {
        headers: { authorization: `Bearer ${firstToken}` },
      })
    ).status(),
  ).toBe(401)
  expect(
    (
      await request.get('/api/service/health', {
        headers: { authorization: `Bearer ${replacementToken}` },
      })
    ).status(),
  ).toBe(200)

  await executeWebMcpTool(page, 'prepare_revoke_service_account', {
    serviceAccountId,
  })
  await page.getByRole('button', { name: 'Confirm revocation' }).click()
  await expect(page.getByText('Service account revoked.')).toBeVisible()
  expect(
    (
      await request.get('/api/service/health', {
        headers: { authorization: `Bearer ${replacementToken}` },
      })
    ).status(),
  ).toBe(401)

  await page.getByRole('link', { name: 'Data' }).click()
  await expect(
    page.getByRole('heading', { name: 'Understand what the application stores' }),
  ).toBeVisible()
  await expect(page.getByText('Security-hidden').first()).toBeVisible()
  await expect
    .poll(() => listWebMcpToolNames(page))
    .toContain('list_admin_workflow_receipts')
  const dataCatalog = await executeWebMcpTool(page, 'get_admin_data_catalog', {})
  const profiles = await executeWebMcpTool(page, 'list_admin_account_profiles', {})
  const failedEvents = await executeWebMcpTool(
    page,
    'list_admin_failed_queue_events',
    {},
  )
  const workflowReceipts = await executeWebMcpTool(
    page,
    'list_admin_workflow_receipts',
    {},
  )
  expect(dataCatalog.isError).toBe(false)
  expect(dataCatalog.content[0]?.text).toContain('domains')
  expect(profiles.isError).toBe(false)
  expect(profiles.content[0]?.text).toContain('recentProfiles')
  expect(failedEvents.isError).toBe(false)
  expect(failedEvents.content[0]?.text).toContain('recentEvents')
  expect(workflowReceipts.isError).toBe(false)
  expect(workflowReceipts.content[0]?.text).toContain('recentReceipts')

  await page.getByRole('link', { name: 'Activity' }).click()
  await expect(page.getByText('admin.service-account.created').first()).toBeVisible()
  await expect(page.getByText('admin.service-account.rotated').first()).toBeVisible()
  await expect(page.getByText('admin.service-account.revoked').first()).toBeVisible()
  await expect.poll(() => listWebMcpToolNames(page)).toContain('list_admin_activity')
  const activity = await executeWebMcpTool(page, 'list_admin_activity', {})
  expect(activity.isError).toBe(false)
  expect(activity.content[0]?.text).toContain('admin.service-account.created')
  const navigationTargetHeight = await page
    .getByRole('link', { name: 'People' })
    .evaluate((element) => element.getBoundingClientRect().height)
  expect(navigationTargetHeight).toBeGreaterThanOrEqual(44)
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true)

  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(accessibility.violations).toEqual([])
})
