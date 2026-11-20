import { expect, type Page } from '@playwright/test'

/** Finishes onboarding the quick way so a test starts on a populated Home. */
export async function skipOnboarding(page: Page) {
  await page.goto('/')
  await expect(page).toHaveURL(/\/welcome$/)
  await page.getByRole('button', { name: 'Skip for now' }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
}

/** Opens a sample person's notebook (Priya, Mum, Daniel or Hana). */
export async function openPerson(page: Page, name: string) {
  await page.goto('/people')
  await page
    .getByRole('link', { name: new RegExp(name) })
    .first()
    .click()
  await expect(page.getByRole('heading', { level: 1, name })).toBeVisible()
}
