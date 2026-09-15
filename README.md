# Backgammon

A two-player backgammon game for the browser, built with React and TypeScript. Both players take turns on the same device (hot-seat), and the game enforces the full rules of backgammon — including forced moves — so only legal moves are ever offered.

## Features

**Rules**
- Standard starting position, 15 checkers per player
- Doubles play four times
- Blocked points (2+ opposing checkers) and hitting blots to the bar
- Mandatory re-entry from the bar before any other move
- Bearing off once all checkers are home, including higher-die bear-offs when no checkers sit further back
- Forced-move rules: you must use both dice when possible, and the higher die when only one can be played
- Turns are skipped automatically when no legal move exists, with a message explaining why

**Gameplay**
- Move checkers by clicking (select, then choose a highlighted destination) or by drag and drop
- Valid destinations pulse to show where the selected checker can go
- Undo moves made during the current turn
- Player panels showing whose turn it is, pip count, checkers borne off, and checkers on the bar
- Dice roll animation and a game-over modal with "Play Again"

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19, TypeScript, Tailwind CSS 4 |
| Build | Vite 7 |
| Unit tests | Jest, React Testing Library |
| E2E tests | Playwright (Chromium) |

## Getting Started

```bash
npm install
npm run dev
```

Then open http://localhost:5173.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |
| `npm test` | Run the Jest unit tests |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:e2e` | Run the Playwright E2E tests (starts the dev server automatically) |
| `npm run test:e2e:ui` | Open the Playwright test runner UI |

The first time you run the E2E tests, install the browser with `npx playwright install chromium`.

## Project Structure

```
src/
├── game/                 # Pure game logic (no React)
│   ├── types.ts          # GameState, Move, and action types
│   ├── constants.ts      # Initial board setup, directions, home boards
│   ├── diceLogic.ts       # Rolling and consuming dice
│   ├── moveValidation.ts  # Blocking, bar entry, bearing-off rules
│   ├── moveCalculation.ts # Generating legal moves
│   ├── forcedMoves.ts     # "Use both dice / use the higher die" rules
│   ├── gameReducer.ts     # State transitions (roll, select, move, undo, …)
│   └── __tests__/        # Jest unit tests for the logic above
├── context/GameContext.tsx  # useReducer-backed provider
├── hooks/useGame.ts         # Hook for accessing game state and actions
├── components/              # App, Board, Point, Checker, Bar, BearOff,
│                            # Dice, GameControls, PlayerInfo
├── index.css                # Tailwind setup and animations
└── main.tsx
e2e/
└── game-flow.spec.ts        # Playwright end-to-end tests
```

## How It Works

All game rules live in `src/game/` as pure functions, independent of React. A single reducer (`gameReducer.ts`) handles every action — `ROLL_DICE`, `SELECT_POINT`, `MAKE_MOVE`, `END_TURN`, `UNDO_MOVE`, `NEW_GAME`, `CLEAR_MESSAGE` — and the UI dispatches these through `GameContext`.

Board orientation: white moves from point 24 toward point 1 (home board 1–6), and black moves from point 1 toward point 24 (home board 19–24). White rolls first.

Forced moves are computed by searching ahead through each possible move sequence to find the maximum number of dice that can be played, then keeping only the moves that achieve it. Undo works by restoring a snapshot taken at the start of the turn.

## Not Yet Implemented

- Doubling cube
- Opening roll to decide who goes first
- Computer opponent or online play
- Gammon / backgammon scoring and match play
