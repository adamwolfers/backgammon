import { Player } from '../../game/types';

interface CheckerProps {
  player: Player;
  stacked?: boolean;
  count?: number;
}

export function Checker({ player, stacked = false, count }: CheckerProps) {
  const colorClass = player === 'white' ? 'bg-checker-white' : 'bg-checker-black';
  const borderClass = player === 'white' ? 'border-gray-300' : 'border-gray-600';
  const textClass = player === 'white' ? 'text-gray-800' : 'text-white';

  return (
    <div
      className={`
        w-8 h-8 rounded-full border-2 ${colorClass} ${borderClass}
        flex items-center justify-center
        shadow-md
        ${stacked ? 'absolute' : ''}
      `}
    >
      {count && count > 1 && (
        <span className={`text-xs font-bold ${textClass}`}>{count}</span>
      )}
    </div>
  );
}
