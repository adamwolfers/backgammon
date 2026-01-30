import { DiceState, DieValue } from './types';

function rollSingleDie(): DieValue {
  return (Math.floor(Math.random() * 6) + 1) as DieValue;
}

export function rollDice(): DiceState {
  const die1 = rollSingleDie();
  const die2 = rollSingleDie();
  const values: [DieValue, DieValue] = [die1, die2];

  // Doubles get 4 moves instead of 2
  const remaining: DieValue[] =
    die1 === die2 ? [die1, die1, die1, die1] : [die1, die2];

  return {
    values,
    remaining,
    rolled: true,
  };
}

export function useDie(state: DiceState, dieValue: DieValue): DiceState {
  const index = state.remaining.indexOf(dieValue);
  if (index === -1) {
    throw new Error(`Die value ${dieValue} not available in remaining: ${state.remaining}`);
  }

  const newRemaining = [...state.remaining];
  newRemaining.splice(index, 1);

  return {
    ...state,
    remaining: newRemaining,
  };
}

export function initializeDiceState(): DiceState {
  return {
    values: null,
    remaining: [],
    rolled: false,
  };
}

export function getRemainingMoves(state: DiceState): DieValue[] {
  // Return unique die values from remaining
  return [...new Set(state.remaining)];
}
