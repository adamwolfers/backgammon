import { DragEvent } from 'react';
import { useGame } from '../../hooks/useGame';
import { Checker } from '../Checker';

export function Bar() {
  const { state, selectPoint } = useGame();
  const { bar, selectedPoint, currentPlayer, phase } = state;

  const isSelected = selectedPoint === 'bar';
  const canDrag = phase === 'moving' && bar[currentPlayer] > 0;

  const handleClick = () => {
    if (!canDrag) return;
    selectPoint('bar');
  };

  const handleDragStart = (e: DragEvent, player: 'white' | 'black') => {
    if (player !== currentPlayer || !canDrag) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('text/plain', 'bar');
    e.dataTransfer.effectAllowed = 'move';
    selectPoint('bar');
  };

  return (
    <div
      onClick={handleClick}
      className={`
        w-12 h-full bg-board flex flex-col items-center justify-center gap-8
        border-x-2 border-gray-700
        ${isSelected ? 'ring-2 ring-blue-400' : ''}
        ${canDrag ? 'cursor-pointer hover:bg-gray-700' : ''}
      `}
    >
      {/* White checkers on bar (top) */}
      {bar.white > 0 && (
        <div
          className={`flex flex-col items-center gap-1 ${currentPlayer === 'white' && canDrag ? 'cursor-grab active:cursor-grabbing checker-interactive' : ''}`}
          draggable={currentPlayer === 'white' && canDrag}
          onDragStart={(e) => handleDragStart(e, 'white')}
        >
          <Checker player="white" count={bar.white} />
        </div>
      )}

      {/* Black checkers on bar (bottom) */}
      {bar.black > 0 && (
        <div
          className={`flex flex-col items-center gap-1 ${currentPlayer === 'black' && canDrag ? 'cursor-grab active:cursor-grabbing checker-interactive' : ''}`}
          draggable={currentPlayer === 'black' && canDrag}
          onDragStart={(e) => handleDragStart(e, 'black')}
        >
          <Checker player="black" count={bar.black} />
        </div>
      )}
    </div>
  );
}
