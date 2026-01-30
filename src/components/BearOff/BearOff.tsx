import { useGame } from '../../hooks/useGame';
import { Checker } from '../Checker';
import { Player } from '../../game/types';

interface BearOffProps {
  player: Player;
}

export function BearOff({ player }: BearOffProps) {
  const { state, makeMove } = useGame();
  const { borneOff, validMoves, phase } = state;

  const count = borneOff[player];
  const isValidDestination = validMoves.some((m) => m.to === 'off');
  const moveToHere = validMoves.find((m) => m.to === 'off');

  const handleClick = () => {
    if (phase !== 'moving' || !isValidDestination || !moveToHere) return;
    makeMove(moveToHere);
  };

  return (
    <div
      onClick={handleClick}
      className={`
        w-12 min-h-[100px] bg-gray-800 rounded-lg
        flex flex-col items-center justify-end p-2
        ${isValidDestination ? 'ring-2 ring-green-400 cursor-pointer' : ''}
      `}
    >
      {/* Stack representation of borne off checkers */}
      {count > 0 && (
        <div className="relative">
          <div
            className={`
              w-8 rounded-sm
              ${player === 'white' ? 'bg-checker-white' : 'bg-checker-black'}
            `}
            style={{ height: Math.min(count * 4, 60) }}
          />
          <div
            className={`
              absolute bottom-1 left-1/2 -translate-x-1/2
              text-xs font-bold
              ${player === 'white' ? 'text-gray-800' : 'text-white'}
            `}
          >
            {count}
          </div>
        </div>
      )}

      <div className="mt-2 text-xs text-gray-400 capitalize">{player}</div>
    </div>
  );
}
