import { isValidMove, canBearOff, isBlocked, canEnterFromBar } from '../moveValidation';
import { GameState, PointState, Player, DieValue } from '../types';
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

describe('moveValidation', () => {
  describe('isBlocked', () => {
    it('should return false for empty point', () => {
      const points = emptyPoints();
      expect(isBlocked(points, 5, 'white')).toBe(false);
    });

    it('should return false for point with own checkers', () => {
      const points = emptyPoints();
      points[4] = { player: 'white', count: 3 }; // point 5
      expect(isBlocked(points, 5, 'white')).toBe(false);
    });

    it('should return false for point with single opponent checker (blot)', () => {
      const points = emptyPoints();
      points[4] = { player: 'black', count: 1 }; // point 5
      expect(isBlocked(points, 5, 'white')).toBe(false);
    });

    it('should return true for point with 2+ opponent checkers', () => {
      const points = emptyPoints();
      points[4] = { player: 'black', count: 2 }; // point 5
      expect(isBlocked(points, 5, 'white')).toBe(true);
    });
  });

  describe('canEnterFromBar', () => {
    it('should allow white to enter on points 19-24 if not blocked', () => {
      const points = emptyPoints();
      // White enters from black's home (19-24), with die showing distance from point 25
      expect(canEnterFromBar(points, 'white', 1)).toBe(true); // enters point 24
      expect(canEnterFromBar(points, 'white', 6)).toBe(true); // enters point 19
    });

    it('should allow black to enter on points 1-6 if not blocked', () => {
      const points = emptyPoints();
      // Black enters from white's home (1-6), with die showing distance from point 0
      expect(canEnterFromBar(points, 'black', 1)).toBe(true); // enters point 1
      expect(canEnterFromBar(points, 'black', 6)).toBe(true); // enters point 6
    });

    it('should not allow entry on blocked point', () => {
      const points = emptyPoints();
      points[23] = { player: 'black', count: 2 }; // point 24 blocked
      expect(canEnterFromBar(points, 'white', 1)).toBe(false);
    });

    it('should allow entry on blot (single opponent checker)', () => {
      const points = emptyPoints();
      points[23] = { player: 'black', count: 1 }; // point 24 has blot
      expect(canEnterFromBar(points, 'white', 1)).toBe(true);
    });
  });

  describe('canBearOff', () => {
    it('should return false if any checkers are outside home board', () => {
      const points = emptyPoints();
      // White home board is 1-6
      points[0] = { player: 'white', count: 5 }; // point 1
      points[11] = { player: 'white', count: 5 }; // point 12 - outside home
      const state = createTestState({ points, currentPlayer: 'white' });
      expect(canBearOff(state, 'white')).toBe(false);
    });

    it('should return false if checkers are on the bar', () => {
      const points = emptyPoints();
      points[0] = { player: 'white', count: 14 };
      const state = createTestState({
        points,
        bar: { white: 1, black: 0 },
        currentPlayer: 'white',
      });
      expect(canBearOff(state, 'white')).toBe(false);
    });

    it('should return true if all checkers are in home board (white)', () => {
      const points = emptyPoints();
      // White home board is 1-6
      points[0] = { player: 'white', count: 5 }; // point 1
      points[2] = { player: 'white', count: 5 }; // point 3
      points[5] = { player: 'white', count: 5 }; // point 6
      const state = createTestState({ points, currentPlayer: 'white' });
      expect(canBearOff(state, 'white')).toBe(true);
    });

    it('should return true if all checkers are in home board (black)', () => {
      const points = emptyPoints();
      // Black home board is 19-24
      points[18] = { player: 'black', count: 5 }; // point 19
      points[20] = { player: 'black', count: 5 }; // point 21
      points[23] = { player: 'black', count: 5 }; // point 24
      const state = createTestState({ points, currentPlayer: 'black' });
      expect(canBearOff(state, 'black')).toBe(true);
    });
  });

  describe('isValidMove', () => {
    describe('basic movement', () => {
      it('should allow white to move from higher to lower point', () => {
        const points = emptyPoints();
        points[12] = { player: 'white', count: 2 }; // point 13
        const state = createTestState({
          points,
          currentPlayer: 'white',
          dice: { values: [3, 4], remaining: [3, 4], rolled: true },
        });
        // Move from point 13 to point 10 using die 3
        expect(isValidMove(state, 13, 10, 3)).toBe(true);
      });

      it('should allow black to move from lower to higher point', () => {
        const points = emptyPoints();
        points[11] = { player: 'black', count: 2 }; // point 12
        const state = createTestState({
          points,
          currentPlayer: 'black',
          dice: { values: [3, 4], remaining: [3, 4], rolled: true },
        });
        // Move from point 12 to point 15 using die 3
        expect(isValidMove(state, 12, 15, 3)).toBe(true);
      });

      it('should not allow movement in wrong direction', () => {
        const points = emptyPoints();
        points[12] = { player: 'white', count: 2 }; // point 13
        const state = createTestState({
          points,
          currentPlayer: 'white',
          dice: { values: [3, 4], remaining: [3, 4], rolled: true },
        });
        // White trying to move from 13 to 16 (wrong direction)
        expect(isValidMove(state, 13, 16, 3)).toBe(false);
      });

      it('should not allow movement to blocked point', () => {
        const points = emptyPoints();
        points[12] = { player: 'white', count: 2 }; // point 13
        points[9] = { player: 'black', count: 2 }; // point 10 blocked
        const state = createTestState({
          points,
          currentPlayer: 'white',
          dice: { values: [3, 4], remaining: [3, 4], rolled: true },
        });
        expect(isValidMove(state, 13, 10, 3)).toBe(false);
      });

      it('should not allow moving opponent checkers', () => {
        const points = emptyPoints();
        points[12] = { player: 'black', count: 2 }; // point 13 has black
        const state = createTestState({
          points,
          currentPlayer: 'white',
          dice: { values: [3, 4], remaining: [3, 4], rolled: true },
        });
        expect(isValidMove(state, 13, 10, 3)).toBe(false);
      });

      it('should not allow using a die value not in remaining', () => {
        const points = emptyPoints();
        points[12] = { player: 'white', count: 2 }; // point 13
        const state = createTestState({
          points,
          currentPlayer: 'white',
          dice: { values: [3, 4], remaining: [3], rolled: true }, // only 3 left
        });
        expect(isValidMove(state, 13, 9, 4)).toBe(false); // trying to use 4
      });
    });

    describe('bar entry', () => {
      it('should require bar entry before other moves', () => {
        const points = emptyPoints();
        points[12] = { player: 'white', count: 2 }; // point 13
        const state = createTestState({
          points,
          bar: { white: 1, black: 0 },
          currentPlayer: 'white',
          dice: { values: [3, 4], remaining: [3, 4], rolled: true },
        });
        // Cannot move from point 13 when checker is on bar
        expect(isValidMove(state, 13, 10, 3)).toBe(false);
      });

      it('should allow valid bar entry move', () => {
        const points = emptyPoints();
        const state = createTestState({
          points,
          bar: { white: 1, black: 0 },
          currentPlayer: 'white',
          dice: { values: [3, 4], remaining: [3, 4], rolled: true },
        });
        // White enters on point 22 with die 3 (25 - 3 = 22)
        expect(isValidMove(state, 'bar', 22, 3)).toBe(true);
      });
    });

    describe('bearing off', () => {
      it('should allow exact bear off', () => {
        const points = emptyPoints();
        points[2] = { player: 'white', count: 5 }; // point 3
        points[0] = { player: 'white', count: 10 }; // point 1
        const state = createTestState({
          points,
          currentPlayer: 'white',
          dice: { values: [3, 4], remaining: [3, 4], rolled: true },
        });
        // Bear off from point 3 with die 3
        expect(isValidMove(state, 3, 'off', 3)).toBe(true);
      });

      it('should allow bearing off with higher die if no checkers on higher points', () => {
        const points = emptyPoints();
        points[1] = { player: 'white', count: 5 }; // point 2
        points[0] = { player: 'white', count: 10 }; // point 1
        const state = createTestState({
          points,
          currentPlayer: 'white',
          dice: { values: [5, 6], remaining: [5, 6], rolled: true },
        });
        // Bear off from point 2 with die 5 (higher than needed)
        expect(isValidMove(state, 2, 'off', 5)).toBe(true);
      });

      it('should not allow bearing off with higher die if checkers on higher points', () => {
        const points = emptyPoints();
        points[4] = { player: 'white', count: 2 }; // point 5
        points[1] = { player: 'white', count: 5 }; // point 2
        const state = createTestState({
          points,
          currentPlayer: 'white',
          dice: { values: [5, 6], remaining: [5, 6], rolled: true },
        });
        // Cannot bear off from point 2 with die 5 because point 5 still has checkers
        expect(isValidMove(state, 2, 'off', 5)).toBe(false);
      });

      it('should not allow bearing off if not all checkers in home board', () => {
        const points = emptyPoints();
        points[2] = { player: 'white', count: 5 }; // point 3
        points[12] = { player: 'white', count: 10 }; // point 13 - outside home
        const state = createTestState({
          points,
          currentPlayer: 'white',
          dice: { values: [3, 4], remaining: [3, 4], rolled: true },
        });
        expect(isValidMove(state, 3, 'off', 3)).toBe(false);
      });
    });

    describe('hitting', () => {
      it('should allow landing on blot', () => {
        const points = emptyPoints();
        points[12] = { player: 'white', count: 2 }; // point 13
        points[9] = { player: 'black', count: 1 }; // point 10 - blot
        const state = createTestState({
          points,
          currentPlayer: 'white',
          dice: { values: [3, 4], remaining: [3, 4], rolled: true },
        });
        expect(isValidMove(state, 13, 10, 3)).toBe(true);
      });
    });
  });
});
