import { useGame } from '../../hooks/useGame';
import { Player } from '../../game/types';

interface PlayerInfoProps {
  player: Player;
}

export function PlayerInfo({ player }: PlayerInfoProps) {
  const { state } = useGame();
  const { currentPlayer, phase, borneOff, bar } = state;

  const isActive = currentPlayer === player && phase !== 'gameOver';
  const checkerColor = player === 'white' ? 'bg-checker-white border-gray-300' : 'bg-checker-black border-gray-600';
  const textColor = player === 'white' ? 'text-gray-800' : 'text-white';

  return (
    <div
      className={`
        p-4 rounded-lg
        ${isActive ? 'bg-green-100 ring-2 ring-green-500' : 'bg-gray-100'}
        transition-all
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`w-6 h-6 rounded-full border-2 ${checkerColor}`} />
        <span className="font-semibold capitalize">{player}</span>
        {isActive && (
          <span className="text-green-600 text-sm font-medium">
            {phase === 'rolling' ? '(Roll)' : '(Move)'}
          </span>
        )}
      </div>

      <div className="mt-2 text-sm text-gray-600 space-y-1">
        <div>Borne off: {borneOff[player]}/15</div>
        {bar[player] > 0 && (
          <div className="text-red-600">On bar: {bar[player]}</div>
        )}
      </div>
    </div>
  );
}
