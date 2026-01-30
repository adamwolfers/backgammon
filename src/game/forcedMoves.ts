import { GameState, Move, DieValue } from './types';
import { calculateAllMoves, calculateValidMoves } from './moveCalculation';
import { useDie } from './diceLogic';

/**
 * Simulate making a move and return the resulting state
 */
function simulateMove(state: GameState, move: Move): GameState {
  const newPoints = state.points.map((p) => ({ ...p }));
  let newBar = { ...state.bar };
  const { currentPlayer } = state;

  // Remove checker from source
  if (move.from === 'bar') {
    newBar[currentPlayer]--;
  } else {
    const fromPoint = newPoints[move.from - 1];
    fromPoint.count--;
    if (fromPoint.count === 0) {
      fromPoint.player = null;
    }
  }

  // Add checker to destination
  if (move.to !== 'off') {
    const toPoint = newPoints[move.to - 1];
    if (move.isHit) {
      const opponent = currentPlayer === 'white' ? 'black' : 'white';
      newBar[opponent]++;
      toPoint.count = 0;
    }
    toPoint.player = currentPlayer;
    toPoint.count++;
  }

  // Use the die
  const newDice = useDie(state.dice, move.dieUsed);

  return {
    ...state,
    points: newPoints,
    bar: newBar,
    dice: newDice,
  };
}

/**
 * Check if both dice can be used (in some order)
 */
export function canUseBothDice(state: GameState): boolean {
  const moves = calculateAllMoves(state);
  if (moves.length === 0) return false;

  // For each possible first move, check if a second move is possible
  for (const firstMove of moves) {
    const stateAfterFirst = simulateMove(state, firstMove);
    const secondMoves = calculateAllMoves(stateAfterFirst);
    if (secondMoves.length > 0) {
      return true;
    }
  }

  return false;
}

/**
 * Get the maximum number of dice that can be used from this state
 */
function getMaxDiceUsable(state: GameState): number {
  if (state.dice.remaining.length === 0) return 0;

  const moves = calculateAllMoves(state);
  if (moves.length === 0) return 0;

  let maxUsable = 1; // At least one move is possible

  for (const move of moves) {
    const stateAfterMove = simulateMove(state, move);
    const usableAfter = getMaxDiceUsable(stateAfterMove);
    maxUsable = Math.max(maxUsable, 1 + usableAfter);
  }

  return maxUsable;
}

/**
 * Get the required moves according to backgammon forced move rules:
 * 1. Must use both dice if possible
 * 2. If only one die can be used, must use the higher one
 * 3. Moves that prevent using all possible dice are filtered out
 */
export function getRequiredMoves(state: GameState): Move[] {
  const allMoves = calculateAllMoves(state);
  if (allMoves.length === 0) return [];

  const maxDice = getMaxDiceUsable(state);

  // If only one die can be used total, filter to only higher die moves
  if (maxDice === 1) {
    // Find the highest die value that has valid moves
    const dieValues = [...new Set(allMoves.map((m) => m.dieUsed))];
    const highestUsableDie = Math.max(...dieValues) as DieValue;

    return allMoves.filter((m) => m.dieUsed === highestUsableDie);
  }

  // If multiple dice can be used, filter to moves that allow using max dice
  const validMoves: Move[] = [];

  for (const move of allMoves) {
    const stateAfterMove = simulateMove(state, move);
    const usableAfter = getMaxDiceUsable(stateAfterMove);

    // This move allows using the maximum possible dice
    if (1 + usableAfter === maxDice) {
      validMoves.push(move);
    }
  }

  return validMoves.length > 0 ? validMoves : allMoves;
}
