import { useGame } from '../../hooks/useGame';

export function GameControls() {
  const { state, endTurn, newGame, clearMessage } = useGame();
  const { phase, winner, message } = state;

  return (
    <div className="flex flex-col gap-4">
      {message && (
        <div
          onClick={clearMessage}
          className="text-center p-3 bg-blue-100 text-blue-800 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors relative group"
        >
          {message}
          <span className="ml-2 text-blue-600 group-hover:text-blue-800">×</span>
        </div>
      )}

      {phase === 'gameOver' && winner && (
        <div className="text-center p-4 bg-yellow-100 rounded-lg">
          <div className="text-2xl font-bold capitalize">{winner} wins!</div>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        {phase === 'moving' && (
          <button
            onClick={endTurn}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            End Turn
          </button>
        )}

        <button
          onClick={newGame}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
