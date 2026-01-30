import { GameState, GameAction, Move, Player } from './types';
import { createInitialState, CHECKERS_PER_PLAYER } from './constants';
import { rollDice, useDie, initializeDiceState } from './diceLogic';
import { calculateValidMoves } from './moveCalculation';
import { getRequiredMoves } from './forcedMoves';

function switchPlayer(player: Player): Player {
  return player === 'white' ? 'black' : 'white';
}

function checkWinner(state: GameState): Player | null {
  if (state.borneOff.white === CHECKERS_PER_PLAYER) return 'white';
  if (state.borneOff.black === CHECKERS_PER_PLAYER) return 'black';
  return null;
}

function handleRollDice(state: GameState): GameState {
  if (state.phase !== 'rolling') return state;

  const newDice = rollDice();
  const newState: GameState = {
    ...state,
    dice: newDice,
    phase: 'moving',
  };

  // Calculate required moves (enforcing forced move rules)
  const validMoves = getRequiredMoves(newState);

  // If no valid moves, auto-end turn with message
  if (validMoves.length === 0) {
    return {
      ...newState,
      currentPlayer: switchPlayer(state.currentPlayer),
      phase: 'rolling',
      dice: initializeDiceState(),
      validMoves: [],
      message: `${state.currentPlayer} has no valid moves - turn skipped`,
    };
  }

  return {
    ...newState,
    validMoves,
    message: null,
  };
}

function handleSelectPoint(state: GameState, point: number | 'bar'): GameState {
  if (state.phase !== 'moving') return state;

  // Deselect if clicking same point
  if (state.selectedPoint === point) {
    return {
      ...state,
      selectedPoint: null,
      validMoves: getRequiredMoves(state),
    };
  }

  // Check if valid selection
  if (point === 'bar') {
    if (state.bar[state.currentPlayer] === 0) {
      return state;
    }
  } else {
    const pointState = state.points[point - 1];
    if (!pointState || pointState.player !== state.currentPlayer || pointState.count === 0) {
      return state;
    }
    // If checker on bar, can only select bar
    if (state.bar[state.currentPlayer] > 0) {
      return state;
    }
  }

  // Get moves for this point, filtered by forced move rules
  const pointMoves = calculateValidMoves(state, point);
  const requiredMoves = getRequiredMoves(state);

  // Only show moves from this point that are in the required moves
  const validMoves = pointMoves.filter((pm) =>
    requiredMoves.some(
      (rm) => rm.from === pm.from && rm.to === pm.to && rm.dieUsed === pm.dieUsed
    )
  );

  // If no valid moves from this point under forced rules, don't select
  if (validMoves.length === 0) {
    return state;
  }

  return {
    ...state,
    selectedPoint: point,
    validMoves,
  };
}

function handleMakeMove(state: GameState, move: Move): GameState {
  if (state.phase !== 'moving') return state;

  const newPoints = state.points.map((p) => ({ ...p }));
  let newBar = { ...state.bar };
  let newBorneOff = { ...state.borneOff };
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
  if (move.to === 'off') {
    newBorneOff[currentPlayer]++;
  } else {
    const toPoint = newPoints[move.to - 1];

    // Handle hit
    if (move.isHit) {
      const opponent = switchPlayer(currentPlayer);
      newBar[opponent]++;
      toPoint.count = 0;
    }

    toPoint.player = currentPlayer;
    toPoint.count++;
  }

  // Use the die
  const newDice = useDie(state.dice, move.dieUsed);

  // Track the move
  const newTurnMoves = [...state.turnMoves, move];

  // Create new state
  let newState: GameState = {
    ...state,
    points: newPoints,
    bar: newBar,
    borneOff: newBorneOff,
    dice: newDice,
    turnMoves: newTurnMoves,
    selectedPoint: null,
  };

  // Check for winner
  const winner = checkWinner(newState);
  if (winner) {
    return {
      ...newState,
      phase: 'gameOver',
      winner,
      validMoves: [],
    };
  }

  // Check if turn should end (no dice remaining or no valid moves)
  const remainingMoves = getRequiredMoves(newState);
  if (newDice.remaining.length === 0 || remainingMoves.length === 0) {
    const noMovesLeft = newDice.remaining.length > 0 && remainingMoves.length === 0;
    return {
      ...newState,
      currentPlayer: switchPlayer(currentPlayer),
      phase: 'rolling',
      dice: initializeDiceState(),
      turnMoves: [],
      validMoves: [],
      message: noMovesLeft ? `${currentPlayer} has no more valid moves` : null,
    };
  }

  return {
    ...newState,
    validMoves: remainingMoves,
  };
}

function handleEndTurn(state: GameState): GameState {
  return {
    ...state,
    currentPlayer: switchPlayer(state.currentPlayer),
    phase: 'rolling',
    dice: initializeDiceState(),
    turnMoves: [],
    selectedPoint: null,
    validMoves: [],
  };
}

function handleNewGame(): GameState {
  return createInitialState();
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'ROLL_DICE':
      return handleRollDice(state);
    case 'SELECT_POINT':
      return handleSelectPoint(state, action.point);
    case 'MAKE_MOVE':
      return handleMakeMove(state, action.move);
    case 'END_TURN':
      return handleEndTurn(state);
    case 'NEW_GAME':
      return handleNewGame();
    case 'CLEAR_MESSAGE':
      return { ...state, message: null };
    default:
      return state;
  }
}
