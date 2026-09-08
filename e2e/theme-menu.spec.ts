import { expect, test } from '@playwright/test'

test('a reader can inspect theme choices and return to the page with reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })

  await page.goto('/sign-in')

  const trigger = page.getByRole('button', { name: 'Choose color theme' })

  await trigger.click()

  const menu = page.getByRole('menu')

  await expect(menu).toBeVisible()

  await expect(
    menu.getByRole('menuitemradio', { name: 'light', exact: true }),
  ).toBeVisible()

  await expect(
    menu.getByRole('menuitemradio', { name: 'dark', exact: true }),
  ).toBeVisible()

  await expect(
    menu.getByRole('menuitemradio', { name: 'system', exact: true }),
  ).toBeVisible()

  await menu.press('Escape')

  await expect(menu).toBeHidden()

  await expect(trigger).toBeFocused()

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
})
