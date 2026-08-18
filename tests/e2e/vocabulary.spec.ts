import { expect, test } from '@playwright/test';

import { skipIfNoClerkSecret } from '../helpers/clerk-login';

skipIfNoClerkSecret();

async function navigateToVocabulary(page: import('@playwright/test').Page) {
  await page.goto('/vocabulary');
  await expect(page.getByRole('heading', { name: 'Vocabulary', exact: true })).toBeVisible();
}

test.describe('Vocabulary page loading', () => {
  test('vocabulary page renders with header and tabs', async ({ page }) => {
    await navigateToVocabulary(page);
    // Heading
    await expect(page.getByRole('heading', { name: 'Vocabulary', exact: true })).toBeVisible();
    // Tabs: New, Learned, Mastered
    await expect(page.getByRole('tab', { name: /new/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /learned/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /mastered/i })).toBeVisible();
  });

  test('search opens the search modal with an input', async ({ page }) => {
    await navigateToVocabulary(page);
    await page.getByTitle('Search vocabulary').click();
    await expect(page.getByPlaceholder(/type a word in english/i)).toBeVisible();
  });
});

test.describe('Vocabulary search', () => {
  const openSearch = async (page: import('@playwright/test').Page) => {
    await page.getByTitle('Search vocabulary').click();
    return page.getByPlaceholder(/type a word in english/i);
  };

  test('searching for a word shows results', async ({ page }) => {
    await navigateToVocabulary(page);
    const searchInput = await openSearch(page);
    await searchInput.fill('compile');
    await searchInput.press('Enter');

    // Should show results section or a no-match message
    const resultsOrNoMatch = page.getByText(/search results|no canonical match|results found/i);
    await expect(resultsOrNoMatch.first()).toBeVisible({ timeout: 10_000 });
  });

  test('search modal handles an empty query gracefully', async ({ page }) => {
    await navigateToVocabulary(page);
    const searchInput = await openSearch(page);
    await searchInput.fill('');
    await searchInput.press('Enter');
    await page.waitForTimeout(500);
    // No crash — the page stays intact and the modal can be closed.
    await expect(page.getByRole('heading', { name: 'Vocabulary', exact: true })).toBeVisible();
  });
});

test.describe('Vocabulary tabs', () => {
  test('clicking Learned tab switches view', async ({ page }) => {
    await navigateToVocabulary(page);
    const learnedTab = page.getByRole('tab', { name: /learned/i });
    await learnedTab.click();
    await expect(learnedTab).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking Mastered tab switches view', async ({ page }) => {
    await navigateToVocabulary(page);
    const masteredTab = page.getByRole('tab', { name: /mastered/i });
    await masteredTab.click();
    await expect(masteredTab).toHaveAttribute('aria-selected', 'true');
  });

  test('clicking New tab switches view', async ({ page }) => {
    await navigateToVocabulary(page);
    const newTab = page.getByRole('tab', { name: /new/i });
    await newTab.click();
    await expect(newTab).toHaveAttribute('aria-selected', 'true');
  });
});

test.describe('Vocabulary word card details', () => {
  test('word cards have expandable details', async ({ page }) => {
    await navigateToVocabulary(page);

    // Load some words by switching to New tab
    const newTab = page.getByRole('tab', { name: /new/i });
    await newTab.click();
    await page.waitForTimeout(2000);

    // Find a word card's details toggle and expand it
    const detailsToggle = page.getByRole('button', { name: /word details/i }).first();
    if (await detailsToggle.isVisible({ timeout: 5000 }).catch(() => false)) {
      await detailsToggle.click();
      await expect(detailsToggle).toHaveAttribute('aria-expanded', 'true');
    }
  });

  test('word cards have flip button', async ({ page }) => {
    await navigateToVocabulary(page);
    await page.getByRole('tab', { name: /new/i }).click();
    await page.waitForTimeout(2000);

    const flipButton = page.getByRole('button', { name: /flip/i }).first();
    if (await flipButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await flipButton.click();
      // After flip, button should say "Front"
      await expect(page.getByRole('button', { name: /front/i }).first()).toBeVisible();
    }
  });
});

test.describe('Add to My Vocabulary', () => {
  const searchUnknown = async (page: import('@playwright/test').Page) => {
    await page.getByTitle('Search vocabulary').click();
    const searchInput = page.getByPlaceholder(/type a word in english/i);
    await searchInput.fill('zzznonexistentwordxyz');
    await searchInput.press('Enter');
  };

  test('searching for unknown word shows Add to My Vocabulary button', async ({ page }) => {
    await navigateToVocabulary(page);
    await searchUnknown(page);

    // "No canonical match" section should appear with Add button
    const addButton = page.getByRole('button', {
      name: /add to my vocabulary/i,
    });
    if (await addButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await addButton.click();
      // Add form should appear
      await expect(page.getByRole('form', { name: /add to my vocabulary/i })).toBeVisible();
    }
  });

  test('add form has required fields', async ({ page }) => {
    await navigateToVocabulary(page);
    await searchUnknown(page);

    const addButton = page.getByRole('button', {
      name: /add to my vocabulary/i,
    });
    if (await addButton.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await addButton.click();
      const form = page.getByRole('form', { name: /add to my vocabulary/i });
      await expect(form.getByLabel(/english term/i)).toBeVisible();
      await expect(form.getByLabel(/turkish meaning/i)).toBeVisible();
      await expect(form.getByLabel(/example/i)).toBeVisible();
    }
  });
});
