import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { z } from 'zod'
import type { JsonValue } from '@mcp-b/webmcp-types'
import type { Page } from '@playwright/test'

const developmentEmailSchema = z
  .object({
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

async function findEmail(
  recipient: string,
  subject: string,
  excludedIdempotencyKey?: string,
) {
  const filenames = await readdir(mailboxDirectory).catch(() => [])

  for (const filename of filenames) {
    const source = await readFile(join(mailboxDirectory, filename), 'utf8')
    const message = developmentEmailSchema.safeParse(JSON.parse(source))
    if (
      message.success &&
      message.data.to === recipient &&
      message.data.subject === subject &&
      message.data.idempotencyKey !== excludedIdempotencyKey
    ) {
      const link = /https?:\/\/\S+/u.exec(message.data.text)?.[0] ?? null
      if (link !== null) {
        return { idempotencyKey: message.data.idempotencyKey, link }
      }
    }
  }

  return null
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
  if (email === null) throw new Error(`No ${subject} email arrived for the test user`)
  return email
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
      // The testing shim is intentionally used only to exercise real browser
      // registrations; application code targets document.modelContext.
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

async function invokeNavigationTool(page: Page) {
  await page.evaluate(() => {
    // oxlint-disable-next-line typescript/no-deprecated -- The polyfill's isolated testing seam is the supported E2E invocation surface.
    const testing = navigator.modelContextTesting
    if (testing === undefined) throw new Error('WebMCP testing shim is unavailable')
    void testing.executeTool('navigate_account', '{}')
  })
}

async function installVirtualAuthenticator(page: Page) {
  const session = await page.context().newCDPSession(page)
  await session.send('WebAuthn.enable')
  await session.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      automaticPresenceSimulation: true,
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      protocol: 'ctap2',
      transport: 'internal',
    },
  })
}

test('a person can complete the account happy path through UI and WebMCP', async ({
  page,
}) => {
  const identity = crypto.randomUUID()
  const email = `account-${identity}@example.test`
  const originalPassword = `Start-${identity}!`
  const replacementPassword = `Changed-${identity}!`

  await page.goto('/sign-up')
  await page.getByLabel('Display name').fill('Starter Person')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(originalPassword)
  await page.getByRole('button', { name: 'Create account' }).click()
  await expect(page).toHaveURL(/\/verify-email/u)

  const initialVerificationEmail = await waitForEmail(email, 'Verify your email')
  await page.getByRole('button', { name: 'Resend verification email' }).click()
  await expect(page.getByText('Verification email sent')).toBeVisible()
  const verificationEmail = await waitForEmail(
    email,
    'Verify your email',
    initialVerificationEmail.idempotencyKey,
  )
  await page.goto(verificationEmail.link)
  await expect(page).toHaveURL(/\/sign-in$/u)
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(originalPassword)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible()

  await page.getByRole('button', { name: 'Not now' }).click()
  await expect
    .poll(() => listWebMcpToolNames(page))
    .toEqual([
      'begin_passkey_enrollment',
      'get_account_profile',
      'navigate_account',
      'prepare_sign_out',
      'update_account_profile',
    ])

  const profileResult = await executeWebMcpTool(page, 'get_account_profile', {})
  expect(profileResult.isError).toBe(false)
  expect(profileResult.content[0]?.text).toContain(email)
  expect(profileResult.content[0]?.text).toContain('Starter Person')

  const rejectedUpdate = await executeWebMcpTool(page, 'update_account_profile', {
    bio: 'This must not be persisted.',
    name: '',
  })
  expect(rejectedUpdate.isError).toBe(true)
  await expect(page.getByLabel('Display name')).toHaveValue('Starter Person')

  const agentUpdate = await executeWebMcpTool(page, 'update_account_profile', {
    bio: 'Updated through the browser agent surface.',
    name: 'Agent Updated',
  })
  expect(agentUpdate.isError).toBe(false)
  await expect(page.getByLabel('Display name')).toHaveValue('Agent Updated')
  await expect(page.getByLabel('Bio')).toHaveValue(
    'Updated through the browser agent surface.',
  )

  await executeWebMcpTool(page, 'begin_passkey_enrollment', {})
  await expect(page.getByRole('region', { name: 'Add a passkey' })).toBeVisible()
  await installVirtualAuthenticator(page)
  await page.getByRole('button', { name: 'Add passkey' }).click()
  await expect(
    page.getByText('A passkey is available as an alternative sign-in method.'),
  ).toBeVisible()

  await page.getByLabel('Display name').fill('Human Updated')
  await page.getByLabel('Bio').fill('Updated through the human interface.')
  await page.getByRole('button', { name: 'Save changes' }).click()
  await expect(page.getByText('Changes saved.')).toBeVisible()

  const accessibility = await new AxeBuilder({ page }).analyze()
  expect(accessibility.violations).toEqual([])

  const preparedSignOut = await executeWebMcpTool(page, 'prepare_sign_out', {})
  expect(preparedSignOut.isError).toBe(false)
  const signOut = page.getByRole('button', { name: 'Sign out' })
  await expect(signOut).toBeFocused()
  await signOut.click()
  await expect(page).toHaveURL(/\/sign-in$/u)
  await expect.poll(() => listWebMcpToolNames(page)).toEqual(['navigate_account'])

  await page.getByRole('button', { name: 'Use passkey' }).click()
  await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible()
  await page.getByRole('button', { name: 'Sign out' }).click()
  await expect(page).toHaveURL(/\/sign-in$/u)

  await page.getByRole('link', { name: 'Forgot password?' }).click()
  await expect(page).toHaveURL(/\/forgot-password$/u)
  await expect(page.locator('form')).toHaveAttribute('data-client-ready', 'true')
  await page.getByLabel('Email').fill(email)
  await page.getByRole('button', { name: 'Send reset link' }).click()
  await expect(page.getByText('Check your inbox for a reset link.')).toBeVisible()

  const resetEmail = await waitForEmail(email, 'Reset your password')
  await page.goto(resetEmail.link)
  await page.getByLabel('New password').fill(replacementPassword)
  await page.getByRole('button', { name: 'Save new password' }).click()
  await expect(page.getByText('Your password has been reset.')).toBeVisible()
  await expect(page).toHaveURL('/reset-password')

  await page.getByRole('link', { name: 'Sign in' }).click()
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill(replacementPassword)
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible()

  await page.goto('/')
  await expect.poll(() => listWebMcpToolNames(page)).toContain('navigate_account')
  await Promise.all([page.waitForURL(/\/account$/u), invokeNavigationTool(page)])
  await expect(page.getByRole('heading', { name: 'Your profile' })).toBeVisible()
  await page.waitForLoadState('networkidle')
})
