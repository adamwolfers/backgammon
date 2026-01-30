import { useState, useEffect } from 'react';
import { useGame } from '../../hooks/useGame';

const dotPositions: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

interface DieProps {
  value: number;
  used?: boolean;
  rolling?: boolean;
}

function Die({ value, used = false, rolling = false }: DieProps) {
  const positions = dotPositions[value] || [];

  return (
    <div
      className={`
        w-12 h-12 bg-white rounded-lg shadow-lg
        grid grid-cols-3 grid-rows-3 p-1.5 gap-0.5
        ${used ? 'opacity-30' : ''}
        ${rolling ? 'animate-dice-roll' : ''}
        transition-opacity duration-200
      `}
    >
      {[0, 1, 2].map((row) =>
        [0, 1, 2].map((col) => {
          const hasDot = positions.some(([r, c]) => r === row && c === col);
          return (
            <div key={`${row}-${col}`} className="flex items-center justify-center">
              {hasDot && (
                <div className="w-2 h-2 bg-gray-800 rounded-full" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export function Dice() {
  const { state, rollDice } = useGame();
  const { dice, phase } = state;

  const [isRolling, setIsRolling] = useState(false);

  // Trigger roll animation when dice values appear
  useEffect(() => {
    if (dice.values && dice.rolled) {
      setIsRolling(true);
      const timer = setTimeout(() => setIsRolling(false), 300);
      return () => clearTimeout(timer);
    }
  }, [dice.values, dice.rolled]);

  const canRoll = phase === 'rolling';

  // Calculate which dice have been used
  const usedDice = dice.values
    ? dice.values.map((v, i) => {
        // For doubles, we need more complex logic
        if (dice.values![0] === dice.values![1]) {
          // Doubles: 4 uses total
          const usedCount = 4 - dice.remaining.length;
          return i < usedCount;
        }
        // Non-doubles: each die used once
        return !dice.remaining.includes(v);
      })
    : [false, false];

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-4">
        {dice.values ? (
          <>
            <Die value={dice.values[0]} used={usedDice[0]} rolling={isRolling} />
            <Die value={dice.values[1]} used={usedDice[1]} rolling={isRolling} />
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-300 rounded-lg" />
            <div className="w-12 h-12 bg-gray-300 rounded-lg" />
          </>
        )}
      </div>

      {canRoll && (
        <button
          onClick={rollDice}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
        >
          Roll Dice
        </button>
      )}

      {phase === 'moving' && dice.remaining.length > 0 && (
        <div className="text-sm text-gray-600">
          Remaining: {dice.remaining.join(', ')}
        </div>
      )}
    </div>
  );
}
