import { useGame } from '../../hooks/useGame';
import { Checker } from '../Checker';
import { Player } from '../../game/types';

export function Bar() {
  const { state, selectPoint, makeMove } = useGame();
  const { bar, selectedPoint, validMoves, currentPlayer, phase } = state;

  const isSelected = selectedPoint === 'bar';
  const canSelect = phase === 'moving' && bar[currentPlayer] > 0;

  const handleClick = () => {
    if (!canSelect) return;
    selectPoint('bar');
  };

  return (
    <div
      onClick={handleClick}
      className={`
        w-12 h-full bg-board flex flex-col items-center justify-center gap-8
        border-x-2 border-gray-700
        ${isSelected ? 'ring-2 ring-blue-400' : ''}
        ${canSelect ? 'cursor-pointer hover:bg-gray-700' : ''}
      `}
    >
      {/* White checkers on bar (top) */}
      {bar.white > 0 && (
        <div className="flex flex-col items-center gap-1">
          <Checker player="white" count={bar.white} />
        </div>
      )}

      {/* Black checkers on bar (bottom) */}
      {bar.black > 0 && (
        <div className="flex flex-col items-center gap-1">
          <Checker player="black" count={bar.black} />
        </div>
      )}
    </div>
  );
}
