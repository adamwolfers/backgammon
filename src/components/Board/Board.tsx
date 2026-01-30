import { useGame } from '../../hooks/useGame';
import { Point } from '../Point';
import { Bar } from '../Bar';
import { BearOff } from '../BearOff';

export function Board() {
  const { state } = useGame();
  const { points } = state;

  // Board layout:
  // Top row (points 13-24, viewed from white's perspective):
  //   Left quadrant: 13, 14, 15, 16, 17, 18
  //   Right quadrant: 19, 20, 21, 22, 23, 24
  // Bottom row (points 12-1):
  //   Left quadrant: 12, 11, 10, 9, 8, 7
  //   Right quadrant: 6, 5, 4, 3, 2, 1

  const topLeft = [13, 14, 15, 16, 17, 18];
  const topRight = [19, 20, 21, 22, 23, 24];
  const bottomLeft = [12, 11, 10, 9, 8, 7];
  const bottomRight = [6, 5, 4, 3, 2, 1];

  return (
    <div className="bg-board p-4 rounded-xl shadow-2xl">
      <div className="flex gap-2">
        {/* Left bear-off (black) */}
        <div className="flex flex-col justify-center">
          <BearOff player="black" />
        </div>

        {/* Main board */}
        <div className="flex flex-col bg-amber-800 rounded-lg overflow-hidden">
          {/* Top half */}
          <div className="flex">
            {/* Top left quadrant */}
            <div className="flex bg-amber-700 p-1">
              {topLeft.map((pointNum) => (
                <Point
                  key={pointNum}
                  pointNumber={pointNum}
                  state={points[pointNum - 1]}
                  isTop={true}
                />
              ))}
            </div>

            {/* Bar */}
            <Bar />

            {/* Top right quadrant */}
            <div className="flex bg-amber-700 p-1">
              {topRight.map((pointNum) => (
                <Point
                  key={pointNum}
                  pointNumber={pointNum}
                  state={points[pointNum - 1]}
                  isTop={true}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-4 bg-amber-900" />

          {/* Bottom half */}
          <div className="flex">
            {/* Bottom left quadrant */}
            <div className="flex bg-amber-700 p-1">
              {bottomLeft.map((pointNum) => (
                <Point
                  key={pointNum}
                  pointNumber={pointNum}
                  state={points[pointNum - 1]}
                  isTop={false}
                />
              ))}
            </div>

            {/* Bar spacer (bar is full height) */}
            <div className="w-12 bg-board" />

            {/* Bottom right quadrant */}
            <div className="flex bg-amber-700 p-1">
              {bottomRight.map((pointNum) => (
                <Point
                  key={pointNum}
                  pointNumber={pointNum}
                  state={points[pointNum - 1]}
                  isTop={false}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right bear-off (white) */}
        <div className="flex flex-col justify-center">
          <BearOff player="white" />
        </div>
      </div>
    </div>
  );
}
