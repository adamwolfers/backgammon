import { calculateValidMoves, calculateAllMoves } from '../moveCalculation';
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

describe('moveCalculation', () => {
  describe('calculateValidMoves', () => {
    it('should return empty array when no checkers on selected point', () => {
      const points = emptyPoints();
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = calculateValidMoves(state, 10);
      expect(moves).toEqual([]);
    });

    it('should return moves for each available die', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 }; // point 13
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = calculateValidMoves(state, 13);
      expect(moves).toHaveLength(2);
      expect(moves).toContainEqual(
        expect.objectContaining({ from: 13, to: 10, dieUsed: 3 })
      );
      expect(moves).toContainEqual(
        expect.objectContaining({ from: 13, to: 9, dieUsed: 4 })
      );
    });

    it('should include hit flag when landing on blot', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 }; // point 13
      points[9] = { player: 'black', count: 1 }; // point 10 - blot
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = calculateValidMoves(state, 13);
      const hitMove = moves.find((m) => m.to === 10);
      expect(hitMove?.isHit).toBe(true);
    });

    it('should return bar entry moves when checker is on bar', () => {
      const points = emptyPoints();
      const state = createTestState({
        points,
        bar: { white: 1, black: 0 },
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = calculateValidMoves(state, 'bar');
      expect(moves).toHaveLength(2);
      expect(moves).toContainEqual(
        expect.objectContaining({ from: 'bar', to: 22, dieUsed: 3 })
      );
      expect(moves).toContainEqual(
        expect.objectContaining({ from: 'bar', to: 21, dieUsed: 4 })
      );
    });

    it('should return bear-off moves when all checkers in home board', () => {
      const points = emptyPoints();
      points[2] = { player: 'white', count: 5 }; // point 3
      points[0] = { player: 'white', count: 10 }; // point 1
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = calculateValidMoves(state, 3);
      expect(moves).toContainEqual(
        expect.objectContaining({ from: 3, to: 'off', dieUsed: 3 })
      );
    });

    it('should return only one move for doubles with single checker', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 1 }; // point 13, single checker
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 3], remaining: [3, 3, 3, 3], rolled: true },
      });

      const moves = calculateValidMoves(state, 13);
      // Should only return one move even though there are 4 dice
      // (same destination point 10)
      expect(moves).toHaveLength(1);
      expect(moves[0]).toMatchObject({ from: 13, to: 10, dieUsed: 3 });
    });
  });

  describe('calculateAllMoves', () => {
    it('should return all valid moves for all checkers', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 }; // point 13
      points[5] = { player: 'white', count: 2 }; // point 6
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = calculateAllMoves(state);
      // From point 13: can go to 10 (die 3) and 9 (die 4)
      // From point 6: can go to 3 (die 3) and 2 (die 4)
      expect(moves).toHaveLength(4);
    });

    it('should only return bar moves when checker is on bar', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 }; // point 13
      const state = createTestState({
        points,
        bar: { white: 1, black: 0 },
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = calculateAllMoves(state);
      // Only bar entry moves should be available
      expect(moves.every((m) => m.from === 'bar')).toBe(true);
      expect(moves).toHaveLength(2);
    });

    it('should return empty array when no valid moves', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 1 }; // point 13
      // Block all possible destinations
      points[9] = { player: 'black', count: 2 }; // point 10 blocked
      points[8] = { player: 'black', count: 2 }; // point 9 blocked
      const state = createTestState({
        points,
        currentPlayer: 'white',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const moves = calculateAllMoves(state);
      expect(moves).toEqual([]);
    });
  });
});
