import { expect, test } from '@playwright/test'
import { openPerson, skipOnboarding } from './helpers'

test('logging a hangout from Home saves it and keeps the takeaway as a thought', async ({
  page,
}) => {
  await skipOnboarding(page)
  await page.getByRole('button', { name: 'Just spent time with someone?' }).click()

  const sheet = page.getByRole('dialog')
  await sheet.getByRole('button', { name: 'Daniel', exact: true }).click()
  await sheet.getByPlaceholder(/Brunch, a hike/).fill('Brunch')
  await sheet.getByRole('button', { name: 'Learned something new' }).click()
  await sheet.getByLabel(/What did you learn/).fill('He used to be a barista.')
  await sheet.getByRole('button', { name: 'Save' }).click()
  await expect(sheet).toBeHidden()

  await openPerson(page, 'Daniel')
  await expect(page.getByRole('heading', { name: 'Hangouts' })).toBeVisible()
  await expect(page.getByText('Brunch')).toBeVisible()
  await expect(page.getByText(/· Learned something new/)).toBeVisible()
  // Once as the hangout's takeaway, once as a thought in the notebook.
  await expect(page.getByText('He used to be a barista.')).toHaveCount(2)
})

test('a hangout needs a person and a title before it can be saved', async ({ page }) => {
  await skipOnboarding(page)
  await page.getByRole('button', { name: 'Just spent time with someone?' }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet.getByRole('button', { name: 'Save' })).toBeDisabled()
  await sheet.getByRole('button', { name: 'Hana', exact: true }).click()
  await expect(sheet.getByRole('button', { name: 'Save' })).toBeDisabled()
  await sheet.getByPlaceholder(/Brunch, a hike/).fill('Walk')
  await expect(sheet.getByRole('button', { name: 'Save' })).toBeEnabled()
})
