import { useEffect } from 'react';
import { useGame } from '../../hooks/useGame';

export function GameControls() {
  const { state, endTurn, newGame, clearMessage } = useGame();
  const { phase, winner, message } = state;

  // Auto-clear message after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(clearMessage, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);

  return (
    <div className="flex flex-col gap-4">
      {message && (
        <div className="text-center p-3 bg-blue-100 text-blue-800 rounded-lg animate-pulse">
          {message}
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
