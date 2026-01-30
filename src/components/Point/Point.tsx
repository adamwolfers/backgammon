import { PointState, Move } from '../../game/types';
import { Checker } from '../Checker';
import { useGame } from '../../hooks/useGame';

interface PointProps {
  pointNumber: number;
  state: PointState;
  isTop: boolean;
}

export function Point({ pointNumber, state, isTop }: PointProps) {
  const { state: gameState, selectPoint, makeMove } = useGame();
  const { selectedPoint, validMoves, currentPlayer, phase } = gameState;

  const isSelected = selectedPoint === pointNumber;
  const isValidDestination = validMoves.some((m) => m.to === pointNumber);
  const moveToHere = validMoves.find((m) => m.to === pointNumber);

  const isOdd = pointNumber % 2 === 1;
  const triangleColor = isOdd ? 'border-point-dark' : 'border-point-light';

  const handleClick = () => {
    if (phase !== 'moving') return;

    // If this is a valid destination, make the move
    if (isValidDestination && moveToHere) {
      makeMove(moveToHere);
      return;
    }

    // Otherwise, try to select this point
    if (state.player === currentPlayer && state.count > 0) {
      selectPoint(pointNumber);
    }
  };

  // Render checkers - compress when 5+ to avoid overlap with opposing point
  const maxDisplay = 6;
  const displayCount = Math.min(state.count, maxDisplay);

  // Calculate spacing: full size (32px) for few checkers, compressed for many
  // Point height is 128px, leave some margin
  const maxHeight = 118; // px available for checkers
  const checkerSize = 32; // h-8 = 32px
  const fullSpacing = checkerSize + 2; // checker + small gap
  const neededHeight = displayCount * fullSpacing;

  // If checkers would overflow, compress them
  const spacing = neededHeight > maxHeight
    ? Math.floor(maxHeight / displayCount)
    : fullSpacing;

  return (
    <div
      onClick={handleClick}
      className={`
        relative w-10 h-32 flex flex-col
        ${isTop ? 'items-center justify-start' : 'items-center justify-end'}
        cursor-pointer
        ${isSelected ? 'bg-blue-200' : ''}
        ${isValidDestination ? 'bg-valid-move' : ''}
      `}
    >
      {/* Triangle */}
      <div
        className={`
          absolute ${isTop ? 'top-0' : 'bottom-0'}
          w-0 h-0
          border-l-[20px] border-r-[20px]
          ${isTop ? 'border-t-[80px]' : 'border-b-[80px]'}
          border-l-transparent border-r-transparent
          ${triangleColor}
        `}
      />

      {/* Checkers - positioned absolutely to control overlap */}
      <div className="relative z-10 w-8" style={{ height: maxHeight }}>
        {state.player &&
          Array.from({ length: displayCount }).map((_, i) => {
            const offset = i * spacing;
            const positionStyle = isTop
              ? { top: offset }
              : { bottom: offset };

            return (
              <div
                key={i}
                className="absolute left-0"
                style={positionStyle}
              >
                <Checker
                  player={state.player!}
                  count={i === displayCount - 1 && state.count > maxDisplay ? state.count : undefined}
                />
              </div>
            );
          })}
      </div>

      {/* Point number (for debugging, can be removed) */}
      <div
        className={`
          absolute ${isTop ? 'bottom-0' : 'top-0'}
          text-xs text-gray-400
        `}
      >
        {pointNumber}
      </div>
    </div>
  );
}
