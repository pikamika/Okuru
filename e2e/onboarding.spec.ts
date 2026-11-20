import { expect, test } from '@playwright/test'

test('a new person goes through onboarding and lands on Home with their first person', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/welcome$/)
  await expect(page.getByRole('heading', { name: 'Make thoughtfulness tangible.' })).toBeVisible()

  await page.getByRole('button', { name: 'Begin' }).click()
  await page.getByLabel('First name').fill('Mika')
  await page.getByRole('button', { name: 'Next' }).click()

  await expect(page.getByRole('heading', { name: 'Who’s on your mind?' })).toBeVisible()
  await page.getByLabel('Name').first().fill('Such')
  await page.getByRole('button', { name: 'Friend', exact: true }).first().click()
  await page.getByRole('button', { name: 'Start my notebook' }).click()

  await expect(page).toHaveURL(/\/$/)
  await page.goto('/people')
  await expect(page.getByRole('link', { name: /Such/ })).toBeVisible()
})

test('skipping onboarding is remembered', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.reload()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})
