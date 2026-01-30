import { GameState, Move, DieValue } from './types';
import { isValidMove, canBearOff } from './moveValidation';
import { getMoveDirection, getHomeBoard } from './constants';
import { getRemainingMoves } from './diceLogic';

/**
 * Check if landing on a point would hit an opponent's blot
 */
function isHit(state: GameState, toPoint: number): boolean {
  if (toPoint < 1 || toPoint > 24) return false;
  const pointState = state.points[toPoint - 1];
  const opponent = state.currentPlayer === 'white' ? 'black' : 'white';
  return pointState.player === opponent && pointState.count === 1;
}

/**
 * Calculate the destination point for a given move
 */
function calculateDestination(
  from: number | 'bar',
  dieValue: DieValue,
  player: 'white' | 'black'
): number | 'off' | null {
  if (from === 'bar') {
    // Bar entry
    return player === 'white' ? 25 - dieValue : dieValue;
  }

  const direction = getMoveDirection(player);
  const to = from + direction * dieValue;

  // Check for bearing off
  if (player === 'white' && to < 1) return 'off';
  if (player === 'black' && to > 24) return 'off';

  // Check bounds for normal move
  if (to < 1 || to > 24) return null;

  return to;
}

/**
 * Calculate all valid moves from a specific point (or bar)
 */
export function calculateValidMoves(
  state: GameState,
  from: number | 'bar'
): Move[] {
  const { currentPlayer, bar, points } = state;

  // If selecting from bar, check if there's a checker there
  if (from === 'bar') {
    if (bar[currentPlayer] === 0) return [];
  } else {
    // Check if there's a checker to move
    const pointState = points[from - 1];
    if (!pointState || pointState.player !== currentPlayer || pointState.count === 0) {
      return [];
    }
  }

  // If checker is on bar but trying to move from board, return empty
  if (from !== 'bar' && bar[currentPlayer] > 0) {
    return [];
  }

  const moves: Move[] = [];
  const availableDice = getRemainingMoves(state.dice);
  const seenDestinations = new Set<string>();

  for (const dieValue of availableDice) {
    const to = calculateDestination(from, dieValue, currentPlayer);
    if (to === null) continue;

    // Avoid duplicate moves for same destination (important for doubles)
    const destKey = `${to}`;
    if (seenDestinations.has(destKey)) continue;

    if (isValidMove(state, from, to, dieValue)) {
      seenDestinations.add(destKey);
      moves.push({
        from,
        to,
        dieUsed: dieValue,
        isHit: to !== 'off' && isHit(state, to),
      });
    }
  }

  return moves;
}

/**
 * Calculate all valid moves for the current player
 */
export function calculateAllMoves(state: GameState): Move[] {
  const { currentPlayer, bar, points } = state;

  // If checker on bar, only bar moves are valid
  if (bar[currentPlayer] > 0) {
    return calculateValidMoves(state, 'bar');
  }

  const allMoves: Move[] = [];

  // Check all points with current player's checkers
  for (let point = 1; point <= 24; point++) {
    const pointState = points[point - 1];
    if (pointState.player === currentPlayer && pointState.count > 0) {
      const moves = calculateValidMoves(state, point);
      allMoves.push(...moves);
    }
  }

  return allMoves;
}
