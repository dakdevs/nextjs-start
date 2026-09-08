import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const bundle = resolve('.artifacts/forms-browser.js')
test.beforeAll(() => {
  execFileSync(
    'bun',
    [
      'build',
      './test/browser/forms-entry.tsx',
      '--target=browser',
      '--format=iife',
      `--outfile=${bundle}`,
    ],
    { stdio: 'inherit' },
  )
})

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test.describe(`Motion preference: ${reducedMotion}`, () => {
    test('a person edits, resets, validates, and submits composed preferences in a dialog', async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion })

      await page.route('**/__form-fixture.js', (route) => {
        return route.fulfill({ path: bundle, contentType: 'text/javascript' })
      })

      let finishSave = () => {}

      const saveAllowed = new Promise<void>((resolveSave) => {
        finishSave = resolveSave
      })

      let submitted: unknown

      await page.route('**/__form-submit', async (route) => {
        submitted = route.request().postDataJSON()

        await saveAllowed

        await route.fulfill({ status: 204 })
      })
      // Real production styles, but no fixture route or test controls shipped in the app.

      await page.goto('/')

      await page.evaluate(() => {
        const host = document.createElement('main')

        host.id = 'form-fixture'

        document.body.replaceChildren(host)
      })

      await page.addScriptTag({ url: '/__form-fixture.js' })

      await page.getByRole('button', { name: 'Edit preferences' }).click()

      const dialog = page.getByRole('dialog', { name: 'Notification preferences' })

      const name = dialog.getByRole('textbox', { name: 'Name', exact: true })

      const cadence = dialog.getByRole('combobox', { name: 'Delivery cadence' })

      await expect(name).toHaveValue('Ada Lovelace')

      await expect(cadence).toContainText('Weekly')

      await expect(name).toHaveAttribute('autocomplete', 'name')

      await name.fill('Discard this draft')

      await cadence.click()

      await page.getByRole('option', { name: 'Daily', exact: true }).click()

      await dialog.getByRole('button', { name: 'Reset', exact: true }).click()

      await expect(name).toHaveValue('Ada Lovelace')

      await expect(cadence).toContainText('Weekly')

      await name.fill('Grace Hopper')

      const email = dialog.getByRole('textbox', { name: 'Email address' })

      await email.fill('not-an-address')

      await email.press('Tab')

      await expect(email).toHaveAttribute('aria-invalid', 'true')

      await expect(
        dialog.getByText('Enter a valid email address.', { exact: true }),
      ).toBeVisible()

      await email.fill('grace@example.test')

      await email.press('Tab')

      await expect(email).toHaveAttribute('aria-invalid', 'false')

      await cadence.click()

      await page.getByRole('option', { name: 'Monthly', exact: true }).click()

      await expect(dialog).toBeVisible()

      await expect(cadence).toBeFocused()

      await dialog.getByRole('textbox', { name: 'Notes' }).fill('Plain text only')

      expect(
        (await new AxeBuilder({ page }).include('[role="dialog"]').analyze())
          .violations,
      ).toEqual([])

      await name.press('Enter')

      await expect(
        dialog.getByRole('button', { name: 'Saving preferences…' }),
      ).toBeDisabled()

      await expect(
        dialog.getByRole('button', { name: 'Reset', exact: true }),
      ).toBeDisabled()

      await expect
        .poll(() => {
          return submitted
        })
        .toEqual({
          name: 'Grace Hopper',
          email: 'grace@example.test',
          cadence: 'monthly',
          notes: 'Plain text only',
        })

      finishSave()

      await expect(dialog.getByText('Saved for Grace Hopper: monthly.')).toBeVisible()

      await expect(
        dialog.getByRole('button', { name: 'Save preferences', exact: true }),
      ).toBeEnabled()

      await dialog.getByRole('button', { name: 'Close', exact: true }).click()

      await expect(page.getByRole('button', { name: 'Edit preferences' })).toBeFocused()
    })
  })
}
