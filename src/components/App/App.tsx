import { GameProvider } from '../../context/GameContext';
import { Board } from '../Board';
import { Dice } from '../Dice';
import { PlayerInfo } from '../PlayerInfo';
import { GameControls } from '../GameControls';

export function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold text-white mb-8">Backgammon</h1>

        <div className="flex gap-8 items-start">
          {/* Left sidebar - Black player info */}
          <div className="w-48">
            <PlayerInfo player="black" />
          </div>

          {/* Main game area */}
          <div className="flex flex-col items-center gap-6">
            <Board />

            <div className="flex gap-8 items-center">
              <Dice />
              <GameControls />
            </div>
          </div>

          {/* Right sidebar - White player info */}
          <div className="w-48">
            <PlayerInfo player="white" />
          </div>
        </div>
      </div>
    </GameProvider>
  );
}
