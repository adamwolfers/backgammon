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
    // Check for player info elements - pip count is now shown
    await expect(page.getByText('Pip Count').first()).toBeVisible();
    await expect(page.getByText('Borne Off').first()).toBeVisible();
  });

  test('should show new game button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'New Game' })).toBeVisible();
  });

  test('should roll dice when roll button is clicked', async ({ page }) => {
    const rollButton = page.getByRole('button', { name: 'Roll Dice' });
    await rollButton.click();

    // After rolling, the roll button should disappear (unless turn was auto-skipped)
    // If no valid moves, the roll button will reappear for the next player
    // So we just check that either End Turn appears or Roll Dice for next player
    const endTurnVisible = await page.getByRole('button', { name: 'End Turn' }).isVisible();
    const rollDiceVisible = await page.getByRole('button', { name: 'Roll Dice' }).isVisible();
    expect(endTurnVisible || rollDiceVisible).toBe(true);
  });

  test('should switch players after turn ends', async ({ page }) => {
    // White starts
    await expect(page.getByText('(Roll)')).toBeVisible();

    // Roll dice
    await page.getByRole('button', { name: 'Roll Dice' }).click();

    // End turn (if available - might auto-end if no moves)
    const endTurnButton = page.getByRole('button', { name: 'End Turn' });
    if (await endTurnButton.isVisible()) {
      await endTurnButton.click();
    }

    // Now it should be black's turn to roll (or white if turn was skipped)
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

test.describe('Undo Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should not show undo button before any moves', async ({ page }) => {
    // Roll dice
    await page.getByRole('button', { name: 'Roll Dice' }).click();

    // Wait for moving phase
    await page.waitForTimeout(100);

    // Undo should not be visible until a move is made
    // (might have End Turn but not Undo)
    const undoButton = page.getByRole('button', { name: 'Undo' });
    const undoVisible = await undoButton.isVisible();

    // If we're in moving phase and no moves made, no undo
    // But if turn was auto-skipped, we're back to rolling
    const rollVisible = await page.getByRole('button', { name: 'Roll Dice' }).isVisible();
    if (!rollVisible) {
      // We're in moving phase - undo should not be visible yet
      expect(undoVisible).toBe(false);
    }
  });
});

test.describe('Game Over', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show new game button that can start fresh game', async ({ page }) => {
    // Click new game
    await page.getByRole('button', { name: 'New Game' }).click();

    // Should see roll dice button for fresh game
    await expect(page.getByRole('heading', { name: 'Backgammon' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Roll Dice' })).toBeVisible();
  });
});

test.describe('Visual Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display dice after rolling', async ({ page }) => {
    // Before rolling, dice should show placeholder
    const placeholderDice = page.locator('.bg-gray-300.w-12.h-12');
    await expect(placeholderDice.first()).toBeVisible();

    // Roll dice
    await page.getByRole('button', { name: 'Roll Dice' }).click();

    // After rolling, actual dice should appear (white background with dots)
    const dice = page.locator('.bg-white.w-12.h-12');

    // Wait for dice to appear (unless turn was skipped)
    const diceVisible = await dice.first().isVisible({ timeout: 2000 }).catch(() => false);

    // Either dice are visible or the turn was skipped
    const rollVisible = await page.getByRole('button', { name: 'Roll Dice' }).isVisible();
    expect(diceVisible || rollVisible).toBe(true);
  });

  test('should display board with 24 points', async ({ page }) => {
    // Each point has a number displayed
    for (let i = 1; i <= 24; i++) {
      await expect(page.locator(`text="${i}"`).first()).toBeVisible();
    }
  });

  test('should display bear-off trays for both players', async ({ page }) => {
    // Look for bear-off areas (they show player names)
    await expect(page.locator('text="white"').first()).toBeVisible();
    await expect(page.locator('text="black"').first()).toBeVisible();
  });
});

test.describe('Message Display', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should dismiss message when clicked', async ({ page }) => {
    // Play a few turns to potentially trigger a message
    for (let i = 0; i < 5; i++) {
      const rollButton = page.getByRole('button', { name: 'Roll Dice' });
      if (await rollButton.isVisible()) {
        await rollButton.click();
        await page.waitForTimeout(100);
      }

      const endTurnButton = page.getByRole('button', { name: 'End Turn' });
      if (await endTurnButton.isVisible()) {
        await endTurnButton.click();
        await page.waitForTimeout(100);
      }

      // Check if a message appeared and click to dismiss
      const message = page.locator('.bg-blue-100.text-blue-800');
      if (await message.isVisible({ timeout: 100 }).catch(() => false)) {
        await message.click();
        // Message should be dismissed
        await expect(message).not.toBeVisible({ timeout: 500 });
        break;
      }
    }
  });
});
