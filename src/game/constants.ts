import { GameState, PointState, Player } from './types';

export const TOTAL_POINTS = 24;
export const CHECKERS_PER_PLAYER = 15;

// White moves from 24 to 1 (home board: 1-6)
// Black moves from 1 to 24 (home board: 19-24)

// Standard backgammon initial setup
// Points are 1-indexed in the game, but 0-indexed in the array
const INITIAL_SETUP: { point: number; player: Player; count: number }[] = [
  // White checkers
  { point: 24, player: 'white', count: 2 },
  { point: 13, player: 'white', count: 5 },
  { point: 8, player: 'white', count: 3 },
  { point: 6, player: 'white', count: 5 },
  // Black checkers
  { point: 1, player: 'black', count: 2 },
  { point: 12, player: 'black', count: 5 },
  { point: 17, player: 'black', count: 3 },
  { point: 19, player: 'black', count: 5 },
];

function createInitialPoints(): PointState[] {
  const points: PointState[] = Array.from({ length: TOTAL_POINTS }, () => ({
    player: null,
    count: 0,
  }));

  for (const { point, player, count } of INITIAL_SETUP) {
    points[point - 1] = { player, count };
  }

  return points;
}

export function createInitialState(): GameState {
  return {
    points: createInitialPoints(),
    bar: { white: 0, black: 0 },
    borneOff: { white: 0, black: 0 },
    currentPlayer: 'white',
    dice: {
      values: null,
      remaining: [],
      rolled: false,
    },
    phase: 'rolling',
    winner: null,
    selectedPoint: null,
    validMoves: [],
    turnMoves: [],
    message: null,
    turnStartSnapshot: null,
  };
}

// Direction of movement for each player
export function getMoveDirection(player: Player): -1 | 1 {
  // White moves from higher to lower (24 → 1)
  // Black moves from lower to higher (1 → 24)
  return player === 'white' ? -1 : 1;
}

// Home board range for each player
export function getHomeBoard(player: Player): { start: number; end: number } {
  // White's home board: points 1-6
  // Black's home board: points 19-24
  return player === 'white'
    ? { start: 1, end: 6 }
    : { start: 19, end: 24 };
}

// Entry point when coming off the bar
export function getBarEntryRange(player: Player): { start: number; end: number } {
  // White enters from black's home board (points 19-24)
  // Black enters from white's home board (points 1-6)
  return player === 'white'
    ? { start: 19, end: 24 }
    : { start: 1, end: 6 };
}
