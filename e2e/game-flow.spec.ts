import { test, expect } from '@playwright/test';

test.describe('Backgammon Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the game title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Backgammon' })).toBeVisible();
  });

  test('should show roll dice button on game start', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Roll Dice' })).toBeVisible();
  });

  test('should show both player info sections', async ({ page }) => {
    // Check for player info elements (borne off counts)
    await expect(page.getByText('Borne off: 0/15').first()).toBeVisible();
    await expect(page.getByText('Borne off: 0/15').nth(1)).toBeVisible();
  });

  test('should show new game button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'New Game' })).toBeVisible();
  });

  test('should roll dice when roll button is clicked', async ({ page }) => {
    const rollButton = page.getByRole('button', { name: 'Roll Dice' });
    await rollButton.click();

    // After rolling, the roll button should disappear
    await expect(rollButton).not.toBeVisible();

    // End turn button should appear
    await expect(page.getByRole('button', { name: 'End Turn' })).toBeVisible();
  });

  test('should switch players after turn ends', async ({ page }) => {
    // White starts
    await expect(page.getByText('(Roll)')).toBeVisible();

    // Roll dice
    await page.getByRole('button', { name: 'Roll Dice' }).click();

    // End turn
    await page.getByRole('button', { name: 'End Turn' }).click();

    // Now it should be black's turn to roll
    await expect(page.getByRole('button', { name: 'Roll Dice' })).toBeVisible();
  });

  test('should reset game when new game is clicked', async ({ page }) => {
    // Roll dice first
    await page.getByRole('button', { name: 'Roll Dice' }).click();

    // Click new game
    await page.getByRole('button', { name: 'New Game' }).click();

    // Should be back to rolling phase
    await expect(page.getByRole('button', { name: 'Roll Dice' })).toBeVisible();
  });
});
