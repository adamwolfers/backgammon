export type Player = 'white' | 'black';

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

export interface PointState {
  player: Player | null;
  count: number;
}

export interface DiceState {
  values: [DieValue, DieValue] | null;
  remaining: DieValue[];
  rolled: boolean;
}

export interface Move {
  from: number | 'bar';  // 1-24 for points, 'bar' for re-entry
  to: number | 'off';    // 1-24 for points, 'off' for bearing off
  dieUsed: DieValue;
  isHit: boolean;
}

export type GamePhase = 'rolling' | 'moving' | 'gameOver';

export interface GameState {
  points: PointState[];          // 24 points, index 0 = point 1
  bar: { white: number; black: number };
  borneOff: { white: number; black: number };
  currentPlayer: Player;
  dice: DiceState;
  phase: GamePhase;
  winner: Player | null;
  selectedPoint: number | 'bar' | null;  // 1-24, 'bar', or null
  validMoves: Move[];            // Currently valid moves for selected piece
  turnMoves: Move[];             // Moves made this turn (for undo)
  message: string | null;        // Notification message for player
}

export type GameAction =
  | { type: 'ROLL_DICE' }
  | { type: 'SELECT_POINT'; point: number | 'bar' }
  | { type: 'MAKE_MOVE'; move: Move }
  | { type: 'END_TURN' }
  | { type: 'UNDO_MOVE' }
  | { type: 'NEW_GAME' }
  | { type: 'CLEAR_MESSAGE' };
