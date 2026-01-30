import { getRequiredMoves, canUseBothDice } from '../forcedMoves';
import { GameState, PointState, Move } from '../types';
import { createInitialState } from '../constants';

// Helper to create a custom board state
function createTestState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialState(),
    ...overrides,
  };
}

// Helper to create empty points
function emptyPoints(): PointState[] {
  return Array.from({ length: 24 }, () => ({ player: null, count: 0 }));
}

describe('forcedMoves', () => {
  describe('canUseBothDice', () => {
    it('should return true when both dice can be used in sequence', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 }; // point 13
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      expect(canUseBothDice(state)).toBe(true);
    });

    it('should return false when only one die can be used', () => {
      const points = emptyPoints();
      points[5] = { player: 'white', count: 1 }; // point 6
      // Block points 2 and 3
      points[1] = { player: 'black', count: 2 }; // point 2 blocked
      points[2] = { player: 'black', count: 2 }; // point 3 blocked
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      // Can only move to point 2 (blocked) or point 3 (blocked)
      // Actually let me reconsider - white moves 24->1, so from point 6:
      // die 3 -> point 3 (blocked), die 4 -> point 2 (blocked)
      expect(canUseBothDice(state)).toBe(false);
    });

    it('should return true when dice must be used in specific order', () => {
      const points = emptyPoints();
      points[7] = { player: 'white', count: 1 }; // point 8
      // Block point 5 but not point 4 or 2
      points[4] = { player: 'black', count: 2 }; // point 5 blocked
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      // From point 8:
      // - die 3 first -> point 5 (blocked) - can't do this
      // - die 4 first -> point 4, then die 3 -> point 1 - works!
      expect(canUseBothDice(state)).toBe(true);
    });
  });

  describe('getRequiredMoves', () => {
    it('should return all moves when both dice can be used from any', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 }; // point 13
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = getRequiredMoves(state);
      // Both moves from point 13 are valid
      expect(moves.length).toBe(2);
    });

    it('should only return higher die move when only one die can be used', () => {
      const points = emptyPoints();
      points[5] = { player: 'white', count: 1 }; // point 6
      // Block lower destination, leave higher open
      points[1] = { player: 'black', count: 2 }; // point 2 blocked (die 4)
      // point 3 open for die 3
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = getRequiredMoves(state);
      // Only die 4 (higher) should be required... wait, that's blocked
      // Let me fix: point 2 blocked means die 4 blocked, die 3 -> point 3 is open
      // So only die 3 can be used, and since only one die can be used,
      // we should use the higher if possible. Since die 4 is blocked, die 3 is the only option.
      expect(moves.length).toBe(1);
      expect(moves[0].dieUsed).toBe(3);
    });

    it('should prefer moves that allow using both dice', () => {
      const points = emptyPoints();
      points[9] = { player: 'white', count: 1 }; // point 10
      points[5] = { player: 'white', count: 1 }; // point 6
      // Block point 7 (would be reached by 10-3)
      points[6] = { player: 'black', count: 2 }; // point 7 blocked
      // Point 6 with die 4 -> point 2 (open), then die 3 -> can't (below 1)
      // Point 10 with die 4 -> point 6, then die 3 -> point 3 (works!)
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = getRequiredMoves(state);
      // Should only include moves that lead to using both dice
      // From point 10: die 4 -> point 6 allows second move
      // From point 10: die 3 -> point 7 (blocked)
      // From point 6: die 4 -> point 2, but then no second move possible
      // From point 6: die 3 -> point 3, but then no second move possible
      // So only point 10 with die 4 should be in required moves
      const point10Moves = moves.filter(m => m.from === 10);
      expect(point10Moves.some(m => m.dieUsed === 4)).toBe(true);
    });

    it('should return higher die moves when only one die can be used and both have moves', () => {
      const points = emptyPoints();
      points[20] = { player: 'white', count: 1 }; // point 21
      // From point 21: die 3 -> point 18, die 4 -> point 17
      // Block all second-move destinations to make only 1 die usable total
      points[13] = { player: 'black', count: 2 }; // point 14 blocked (17-3, 18-4)
      points[14] = { player: 'black', count: 2 }; // point 15 blocked (18-3)
      points[12] = { player: 'black', count: 2 }; // point 13 blocked (17-4)
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = getRequiredMoves(state);
      // Only one die can be used total (all second moves blocked).
      // Must use higher die (4).
      expect(moves.length).toBe(1);
      expect(moves[0].dieUsed).toBe(4);
    });

    it('should work correctly with doubles', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 4 }; // point 13, 4 checkers
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 3], remaining: [3, 3, 3, 3], rolled: true },
      });

      const moves = getRequiredMoves(state);
      // All 4 dice can potentially be used
      expect(moves.length).toBeGreaterThan(0);
    });

    it('should handle bar entry with forced moves', () => {
      const points = emptyPoints();
      // Block some entry points
      points[21] = { player: 'black', count: 2 }; // point 22 blocked (die 3 entry)
      const state = createTestState({
        points,
        bar: { white: 1, black: 0 },
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = getRequiredMoves(state);
      // Can only enter with die 4 (point 21), die 3 is blocked (point 22)
      expect(moves.length).toBe(1);
      expect(moves[0].from).toBe('bar');
      expect(moves[0].dieUsed).toBe(4);
    });
  });
});
