import { createContext, useReducer, ReactNode } from 'react';
import { GameState, GameAction, Move } from '../game/types';
import { gameReducer } from '../game/gameReducer';
import { createInitialState } from '../game/constants';

interface GameContextValue {
  state: GameState;
  rollDice: () => void;
  selectPoint: (point: number | 'bar') => void;
  makeMove: (move: Move) => void;
  endTurn: () => void;
  undoMove: () => void;
  newGame: () => void;
  clearMessage: () => void;
}

export const GameContext = createContext<GameContextValue | null>(null);

interface GameProviderProps {
  children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialState);

  const value: GameContextValue = {
    state,
    rollDice: () => dispatch({ type: 'ROLL_DICE' }),
    selectPoint: (point) => dispatch({ type: 'SELECT_POINT', point }),
    makeMove: (move) => dispatch({ type: 'MAKE_MOVE', move }),
    endTurn: () => dispatch({ type: 'END_TURN' }),
    undoMove: () => dispatch({ type: 'UNDO_MOVE' }),
    newGame: () => dispatch({ type: 'NEW_GAME' }),
    clearMessage: () => dispatch({ type: 'CLEAR_MESSAGE' }),
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
