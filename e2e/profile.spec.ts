import { expect, test } from '@playwright/test'
import { skipOnboarding } from './helpers'

test('comma-separated interests become separate badges on your profile', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/me')
  await page.getByLabel('Add an interest').fill('Volleyball, Dogs')
  await page.getByLabel('Add an interest').press('Enter')
  await expect(page.getByText('Volleyball', { exact: true })).toBeVisible()
  await expect(page.getByText('Dogs', { exact: true })).toBeVisible()

  await page.reload()
  await expect(page.getByText('Volleyball', { exact: true })).toBeVisible()
})

test('your details are saved', async ({ page }) => {
  await skipOnboarding(page)
  await page.goto('/me')
  await page.getByLabel('First name').fill('Mika')
  await page.getByLabel('First name').blur()
  await page.reload()
  await expect(page.getByLabel('First name')).toHaveValue('Mika')
})
