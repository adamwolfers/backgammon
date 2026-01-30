import { rollDice, useDie, initializeDiceState, getRemainingMoves } from '../diceLogic';
import { DiceState, DieValue } from '../types';

describe('diceLogic', () => {
  describe('rollDice', () => {
    it('should return two values between 1 and 6', () => {
      const result = rollDice();
      expect(result.values).toHaveLength(2);
      expect(result.values![0]).toBeGreaterThanOrEqual(1);
      expect(result.values![0]).toBeLessThanOrEqual(6);
      expect(result.values![1]).toBeGreaterThanOrEqual(1);
      expect(result.values![1]).toBeLessThanOrEqual(6);
    });

    it('should set rolled to true', () => {
      const result = rollDice();
      expect(result.rolled).toBe(true);
    });

    it('should initialize remaining with the dice values for non-doubles', () => {
      // Mock random to return specific values (not doubles)
      const mockRandom = jest.spyOn(Math, 'random');
      mockRandom
        .mockReturnValueOnce(0.1) // die 1 = 1
        .mockReturnValueOnce(0.5); // die 2 = 4

      const result = rollDice();
      expect(result.remaining).toEqual([1, 4]);

      mockRandom.mockRestore();
    });

    it('should initialize remaining with 4 dice for doubles', () => {
      const mockRandom = jest.spyOn(Math, 'random');
      mockRandom
        .mockReturnValueOnce(0.5) // die 1 = 4
        .mockReturnValueOnce(0.5); // die 2 = 4

      const result = rollDice();
      expect(result.remaining).toEqual([4, 4, 4, 4]);

      mockRandom.mockRestore();
    });
  });

  describe('useDie', () => {
    it('should remove the used die from remaining', () => {
      const state: DiceState = {
        values: [3, 5],
        remaining: [3, 5],
        rolled: true,
      };

      const result = useDie(state, 3);
      expect(result.remaining).toEqual([5]);
    });

    it('should only remove one instance of the die for doubles', () => {
      const state: DiceState = {
        values: [4, 4],
        remaining: [4, 4, 4, 4],
        rolled: true,
      };

      const result = useDie(state, 4);
      expect(result.remaining).toEqual([4, 4, 4]);
    });

    it('should not modify values', () => {
      const state: DiceState = {
        values: [2, 6],
        remaining: [2, 6],
        rolled: true,
      };

      const result = useDie(state, 2);
      expect(result.values).toEqual([2, 6]);
    });

    it('should throw if die value is not in remaining', () => {
      const state: DiceState = {
        values: [1, 2],
        remaining: [1, 2],
        rolled: true,
      };

      expect(() => useDie(state, 5)).toThrow();
    });
  });

  describe('initializeDiceState', () => {
    it('should return an unrolled dice state', () => {
      const result = initializeDiceState();
      expect(result.values).toBeNull();
      expect(result.remaining).toEqual([]);
      expect(result.rolled).toBe(false);
    });
  });

  describe('getRemainingMoves', () => {
    it('should return unique die values from remaining', () => {
      const state: DiceState = {
        values: [4, 4],
        remaining: [4, 4, 4],
        rolled: true,
      };

      const result = getRemainingMoves(state);
      expect(result).toEqual([4]);
    });

    it('should return both values for non-doubles', () => {
      const state: DiceState = {
        values: [2, 5],
        remaining: [2, 5],
        rolled: true,
      };

      const result = getRemainingMoves(state);
      expect(result).toEqual([2, 5]);
    });

    it('should return empty array when no moves remain', () => {
      const state: DiceState = {
        values: [3, 4],
        remaining: [],
        rolled: true,
      };

      const result = getRemainingMoves(state);
      expect(result).toEqual([]);
    });
  });
});
