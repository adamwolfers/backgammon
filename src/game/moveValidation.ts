import { GameState, PointState, Player, DieValue } from './types';
import { getHomeBoard, getBarEntryRange, getMoveDirection } from './constants';

/**
 * Check if a point is blocked for a player (2+ opponent checkers)
 */
export function isBlocked(points: PointState[], point: number, player: Player): boolean {
  const pointState = points[point - 1];
  if (!pointState || pointState.count === 0) return false;

  const opponent = player === 'white' ? 'black' : 'white';
  return pointState.player === opponent && pointState.count >= 2;
}

/**
 * Check if a player can enter from the bar with a given die
 */
export function canEnterFromBar(
  points: PointState[],
  player: Player,
  dieValue: DieValue
): boolean {
  // White enters from point 25-die (so die 1 = point 24, die 6 = point 19)
  // Black enters from point 0+die (so die 1 = point 1, die 6 = point 6)
  const entryPoint = player === 'white' ? 25 - dieValue : dieValue;
  return !isBlocked(points, entryPoint, player);
}

/**
 * Check if a player can bear off (all checkers in home board, none on bar)
 */
export function canBearOff(state: GameState, player: Player): boolean {
  // Cannot bear off if any checkers on bar
  if (state.bar[player] > 0) return false;

  const homeBoard = getHomeBoard(player);

  // Check all points for checkers outside home board
  for (let point = 1; point <= 24; point++) {
    const pointState = state.points[point - 1];
    if (pointState.player !== player || pointState.count === 0) continue;

    // Check if this point is outside home board
    if (player === 'white') {
      // White home is 1-6, so points 7-24 are outside
      if (point > homeBoard.end) return false;
    } else {
      // Black home is 19-24, so points 1-18 are outside
      if (point < homeBoard.start) return false;
    }
  }

  return true;
}

/**
 * Validate a move
 */
export function isValidMove(
  state: GameState,
  from: number | 'bar',
  to: number | 'off',
  dieValue: DieValue
): boolean {
  const { points, currentPlayer, dice, bar } = state;

  // Check if die value is available
  if (!dice.remaining.includes(dieValue)) return false;

  // If player has checkers on bar, they must enter first
  if (bar[currentPlayer] > 0 && from !== 'bar') return false;

  // Handle bar entry
  if (from === 'bar') {
    if (bar[currentPlayer] === 0) return false;
    if (to === 'off') return false;

    // Calculate entry point
    const expectedTo = currentPlayer === 'white' ? 25 - dieValue : dieValue;
    if (to !== expectedTo) return false;

    return canEnterFromBar(points, currentPlayer, dieValue);
  }

  // Check if there's a checker to move
  const fromPoint = points[from - 1];
  if (!fromPoint || fromPoint.player !== currentPlayer || fromPoint.count === 0) {
    return false;
  }

  // Handle bearing off
  if (to === 'off') {
    if (!canBearOff(state, currentPlayer)) return false;

    // Calculate if the die can bear off this checker
    // White bears off from points 1-6 (point value = distance to off)
    // Black bears off from points 19-24 (25 - point = distance to off)
    const distanceToOff = currentPlayer === 'white' ? from : 25 - from;

    if (dieValue === distanceToOff) {
      // Exact roll - always valid
      return true;
    }

    if (dieValue > distanceToOff) {
      // Higher roll - only valid if no checkers on higher points
      const homeBoard = getHomeBoard(currentPlayer);
      for (let point = homeBoard.start; point <= homeBoard.end; point++) {
        const p = points[point - 1];
        if (p.player !== currentPlayer || p.count === 0) continue;

        // Check if this point is further from bearing off than 'from'
        if (currentPlayer === 'white' && point > from) return false;
        if (currentPlayer === 'black' && point < from) return false;
      }
      return true;
    }

    // Die is lower than distance - cannot bear off
    return false;
  }

  // Normal move validation
  const direction = getMoveDirection(currentPlayer);
  const expectedTo = from + direction * dieValue;

  if (to !== expectedTo) return false;
  if (to < 1 || to > 24) return false;

  return !isBlocked(points, to, currentPlayer);
}
