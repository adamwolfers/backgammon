import { gameReducer } from '../gameReducer';
import { GameState, PointState, GameAction, Move } from '../types';
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

describe('gameReducer', () => {
  describe('ROLL_DICE', () => {
    it('should roll dice and transition to moving phase', () => {
      const state = createTestState({ phase: 'rolling' });
      const newState = gameReducer(state, { type: 'ROLL_DICE' });

      expect(newState.dice.rolled).toBe(true);
      expect(newState.dice.values).toHaveLength(2);
      expect(newState.phase).toBe('moving');
    });

    it('should not roll if not in rolling phase', () => {
      const state = createTestState({ phase: 'moving' });
      const newState = gameReducer(state, { type: 'ROLL_DICE' });

      expect(newState).toBe(state); // No change
    });

    it('should calculate valid moves after rolling', () => {
      const state = createTestState({ phase: 'rolling' });

      // Mock specific dice roll
      const mockRandom = jest.spyOn(Math, 'random');
      mockRandom.mockReturnValueOnce(0.1).mockReturnValueOnce(0.5);

      const newState = gameReducer(state, { type: 'ROLL_DICE' });

      // Valid moves should be calculated (at initial position)
      expect(newState.validMoves.length).toBeGreaterThan(0);

      mockRandom.mockRestore();
    });
  });

  describe('SELECT_POINT', () => {
    it('should select a point with current player checkers', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 }; // point 13
      const state = createTestState({
        points,
        currentPlayer: 'white',
        phase: 'moving',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const newState = gameReducer(state, { type: 'SELECT_POINT', point: 13 });

      expect(newState.selectedPoint).toBe(13);
      expect(newState.validMoves.length).toBeGreaterThan(0);
    });

    it('should not select empty point', () => {
      const points = emptyPoints();
      const state = createTestState({
        points,
        currentPlayer: 'white',
        phase: 'moving',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const newState = gameReducer(state, { type: 'SELECT_POINT', point: 5 });

      expect(newState.selectedPoint).toBeNull();
    });

    it('should not select opponent checkers', () => {
      const points = emptyPoints();
      points[12] = { player: 'black', count: 2 }; // point 13 has black
      const state = createTestState({
        points,
        currentPlayer: 'white',
        phase: 'moving',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const newState = gameReducer(state, { type: 'SELECT_POINT', point: 13 });

      expect(newState.selectedPoint).toBeNull();
    });

    it('should allow selecting bar when checker is on bar', () => {
      const state = createTestState({
        bar: { white: 1, black: 0 },
        currentPlayer: 'white',
        phase: 'moving',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const newState = gameReducer(state, { type: 'SELECT_POINT', point: 'bar' });

      expect(newState.selectedPoint).toBe('bar');
      expect(newState.validMoves.length).toBeGreaterThan(0);
    });

    it('should deselect when selecting already selected point', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 };
      const state = createTestState({
        points,
        currentPlayer: 'white',
        phase: 'moving',
        selectedPoint: 13,
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const newState = gameReducer(state, { type: 'SELECT_POINT', point: 13 });

      expect(newState.selectedPoint).toBeNull();
    });
  });

  describe('MAKE_MOVE', () => {
    it('should move checker to destination', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 }; // point 13
      const state = createTestState({
        points,
        currentPlayer: 'white',
        phase: 'moving',
        selectedPoint: 13,
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const move: Move = { from: 13, to: 10, dieUsed: 3, isHit: false };
      const newState = gameReducer(state, { type: 'MAKE_MOVE', move });

      expect(newState.points[12].count).toBe(1); // from point
      expect(newState.points[9].count).toBe(1); // to point
      expect(newState.points[9].player).toBe('white');
    });

    it('should use the die and track turn moves', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 };
      const state = createTestState({
        points,
        currentPlayer: 'white',
        phase: 'moving',
        selectedPoint: 13,
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const move: Move = { from: 13, to: 10, dieUsed: 3, isHit: false };
      const newState = gameReducer(state, { type: 'MAKE_MOVE', move });

      expect(newState.dice.remaining).toEqual([4]);
      expect(newState.turnMoves).toContainEqual(move);
    });

    it('should hit opponent blot and send to bar', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 }; // point 13
      points[9] = { player: 'black', count: 1 }; // point 10 - blot
      const state = createTestState({
        points,
        bar: { white: 0, black: 0 },
        currentPlayer: 'white',
        phase: 'moving',
        selectedPoint: 13,
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const move: Move = { from: 13, to: 10, dieUsed: 3, isHit: true };
      const newState = gameReducer(state, { type: 'MAKE_MOVE', move });

      expect(newState.points[9].player).toBe('white');
      expect(newState.points[9].count).toBe(1);
      expect(newState.bar.black).toBe(1);
    });

    it('should enter from bar', () => {
      const points = emptyPoints();
      const state = createTestState({
        points,
        bar: { white: 1, black: 0 },
        currentPlayer: 'white',
        phase: 'moving',
        selectedPoint: 'bar',
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const move: Move = { from: 'bar', to: 22, dieUsed: 3, isHit: false };
      const newState = gameReducer(state, { type: 'MAKE_MOVE', move });

      expect(newState.bar.white).toBe(0);
      expect(newState.points[21].player).toBe('white');
      expect(newState.points[21].count).toBe(1);
    });

    it('should bear off checker', () => {
      const points = emptyPoints();
      points[2] = { player: 'white', count: 5 }; // point 3
      points[0] = { player: 'white', count: 10 }; // point 1
      const state = createTestState({
        points,
        borneOff: { white: 0, black: 0 },
        currentPlayer: 'white',
        phase: 'moving',
        selectedPoint: 3,
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const move: Move = { from: 3, to: 'off', dieUsed: 3, isHit: false };
      const newState = gameReducer(state, { type: 'MAKE_MOVE', move });

      expect(newState.points[2].count).toBe(4);
      expect(newState.borneOff.white).toBe(1);
    });

    it('should end turn automatically when no dice remain', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 };
      const state = createTestState({
        points,
        currentPlayer: 'white',
        phase: 'moving',
        selectedPoint: 13,
        dice: { values: [3, 4], remaining: [3], rolled: true }, // only one die left
      });

      const move: Move = { from: 13, to: 10, dieUsed: 3, isHit: false };
      const newState = gameReducer(state, { type: 'MAKE_MOVE', move });

      expect(newState.currentPlayer).toBe('black');
      expect(newState.phase).toBe('rolling');
      expect(newState.dice.remaining).toEqual([]);
    });

    it('should detect winner when all checkers borne off', () => {
      const points = emptyPoints();
      points[2] = { player: 'white', count: 1 }; // last checker on point 3
      const state = createTestState({
        points,
        borneOff: { white: 14, black: 0 },
        currentPlayer: 'white',
        phase: 'moving',
        selectedPoint: 3,
        dice: { values: [3, 4], remaining: [3], rolled: true },
      });

      const move: Move = { from: 3, to: 'off', dieUsed: 3, isHit: false };
      const newState = gameReducer(state, { type: 'MAKE_MOVE', move });

      expect(newState.borneOff.white).toBe(15);
      expect(newState.phase).toBe('gameOver');
      expect(newState.winner).toBe('white');
    });

    it('should clear selection after move', () => {
      const points = emptyPoints();
      points[12] = { player: 'white', count: 2 };
      const state = createTestState({
        points,
        currentPlayer: 'white',
        phase: 'moving',
        selectedPoint: 13,
        dice: { values: [3, 4], remaining: [3, 4], rolled: true },
      });

      const move: Move = { from: 13, to: 10, dieUsed: 3, isHit: false };
      const newState = gameReducer(state, { type: 'MAKE_MOVE', move });

      expect(newState.selectedPoint).toBeNull();
    });
  });

  describe('END_TURN', () => {
    it('should switch player and reset for rolling', () => {
      const state = createTestState({
        currentPlayer: 'white',
        phase: 'moving',
        dice: { values: [3, 4], remaining: [], rolled: true },
        turnMoves: [{ from: 13, to: 10, dieUsed: 3, isHit: false }],
      });

      const newState = gameReducer(state, { type: 'END_TURN' });

      expect(newState.currentPlayer).toBe('black');
      expect(newState.phase).toBe('rolling');
      expect(newState.dice.rolled).toBe(false);
      expect(newState.turnMoves).toEqual([]);
      expect(newState.selectedPoint).toBeNull();
    });
  });

  describe('NEW_GAME', () => {
    it('should reset to initial state', () => {
      const state = createTestState({
        currentPlayer: 'black',
        phase: 'gameOver',
        winner: 'black',
        borneOff: { white: 5, black: 15 },
      });

      const newState = gameReducer(state, { type: 'NEW_GAME' });

      expect(newState.currentPlayer).toBe('white');
      expect(newState.phase).toBe('rolling');
      expect(newState.winner).toBeNull();
      expect(newState.borneOff).toEqual({ white: 0, black: 0 });
    });
  });
});
