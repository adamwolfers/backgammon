import { useGame } from '../../hooks/useGame';

export function GameControls() {
  const { state, endTurn, undoMove, newGame, clearMessage } = useGame();
  const { phase, winner, message, turnMoves } = state;

  const canUndo = phase === 'moving' && turnMoves.length > 0;

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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-2xl text-center max-w-sm mx-4">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-3xl font-bold capitalize mb-2">{winner} wins!</div>
            <div className="text-gray-600 mb-6">Congratulations!</div>
            <button
              onClick={newGame}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold text-lg"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-center">
        {canUndo && (
          <button
            onClick={undoMove}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Undo
          </button>
        )}

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
