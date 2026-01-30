import { useGame } from '../../hooks/useGame';
import { Player, GameState } from '../../game/types';

interface PlayerInfoProps {
  player: Player;
}

function calculatePipCount(state: GameState, player: Player): number {
  let pips = 0;

  // Count pips for checkers on the board
  for (let i = 0; i < 24; i++) {
    const point = state.points[i];
    if (point.player === player) {
      const pointNumber = i + 1;
      // For white: distance to bear off is the point number (white bears off from 1-6)
      // For black: distance to bear off is (25 - point number) (black bears off from 19-24)
      const distance = player === 'white' ? pointNumber : 25 - pointNumber;
      pips += distance * point.count;
    }
  }

  // Checkers on bar have 25 pips to go (they must enter and traverse entire board)
  pips += state.bar[player] * 25;

  return pips;
}

function getCheckersOnBoard(state: GameState, player: Player): number {
  let count = 0;
  for (const point of state.points) {
    if (point.player === player) {
      count += point.count;
    }
  }
  return count + state.bar[player];
}

export function PlayerInfo({ player }: PlayerInfoProps) {
  const { state } = useGame();
  const { currentPlayer, phase, borneOff, bar } = state;

  const isActive = currentPlayer === player && phase !== 'gameOver';
  const checkerColor = player === 'white' ? 'bg-checker-white border-gray-300' : 'bg-checker-black border-gray-600';

  const pipCount = calculatePipCount(state, player);
  const onBoard = getCheckersOnBoard(state, player);

  return (
    <div
      className={`
        p-4 rounded-lg
        ${isActive ? 'bg-green-100 ring-2 ring-green-500 active-player' : 'bg-gray-100'}
        transition-all duration-300
      `}
    >
      <div className="flex items-center gap-3">
        <div className={`w-6 h-6 rounded-full border-2 ${checkerColor}`} />
        <span className="font-semibold capitalize">{player}</span>
        {isActive && (
          <span className="text-green-600 text-sm font-medium animate-pulse">
            {phase === 'rolling' ? '(Roll)' : '(Move)'}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-600">
          <div className="font-medium text-gray-800">Pip Count</div>
          <div className="text-lg font-bold">{pipCount}</div>
        </div>
        <div className="text-gray-600">
          <div className="font-medium text-gray-800">Borne Off</div>
          <div className="text-lg font-bold">{borneOff[player]}/15</div>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        On board: {onBoard}
        {bar[player] > 0 && (
          <span className="text-red-600 ml-2">(Bar: {bar[player]})</span>
        )}
      </div>
    </div>
  );
}
