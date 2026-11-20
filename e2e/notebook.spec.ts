import { expect, test } from '@playwright/test'
import { openPerson, skipOnboarding } from './helpers'

test.beforeEach(async ({ page }) => {
  await skipOnboarding(page)
})

test('Home resurfaces a thought for an upcoming moment', async ({ page }) => {
  await expect(page.getByText('You noticed').first()).toBeVisible()
})

test('keeping a thought adds it to the person’s notebook', async ({ page }) => {
  await openPerson(page, 'Priya')
  await page.getByRole('button', { name: /Note something about Priya/ }).click()
  await page.getByLabel('Your thought').fill('Loves the smell of fresh bread.')
  await page.getByRole('button', { name: 'Keep it' }).click()
  await expect(page.getByText('Loves the smell of fresh bread.')).toBeVisible()
})

test('adding a person from the people list', async ({ page }) => {
  await page.goto('/people')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  const sheet = page.getByRole('dialog')
  await sheet.getByLabel('Name').fill('Jordan')
  await sheet.getByRole('button', { name: 'Start their notebook' }).click()
  // Saving opens their new notebook.
  await expect(page.getByRole('heading', { level: 1, name: 'Jordan' })).toBeVisible()
})
