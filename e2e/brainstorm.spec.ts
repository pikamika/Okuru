import { expect, test } from '@playwright/test'
import { openPerson, skipOnboarding } from './helpers'

test('thinking of a gift together opens a chat that replies with suggestions', async ({ page }) => {
  await skipOnboarding(page)
  await openPerson(page, 'Priya')
  await page.getByRole('button', { name: 'Think of a gift together' }).click()
  await expect(page.getByRole('heading', { name: 'Think it through' })).toBeVisible()

  await page
    .getByPlaceholder(/What are you thinking for Priya/)
    .fill('Something she can do with me')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.getByRole('button', { name: 'Use as the gift' }).first()).toBeVisible()
})
