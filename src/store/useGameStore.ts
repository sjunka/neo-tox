import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  checkWin,
  getBestMove,
  isBoardFull,
  NO_MOVE,
  type Difficulty,
  type Mark,
  type Player,
} from '../engine/GameEngine';
import { triggerHaptic } from '../utils/haptics';
import { TOKENS } from '../theme/tokens';

export const HUMAN_PLAYER: Mark = 'X';
export const AI_PLAYER: Mark = 'O';

export type Winner = Mark | 'DRAW' | null;

export interface GameStats {
  wins: number;
  losses: number;
  draws: number;
}

const EMPTY_STATS: GameStats = { wins: 0, losses: 0, draws: 0 };

const createEmptyBoard = (gridSize: number): Player[] =>
  Array<Player>(gridSize * gridSize).fill(null);

interface GameState {
  board: Player[];
  gridSize: number;
  currentPlayer: Mark;
  difficulty: Difficulty;
  isAiThinking: boolean;
  winningLine: number[];
  winner: Winner;
  stats: GameStats;
  /** Monotonic id, bumped on every reset, used to discard stale AI turns. */
  gameId: number;
  initializeGame: (size?: number) => void;
  makeMove: (index: number) => Promise<void>;
  setDifficulty: (difficulty: Difficulty) => void;
  resetStats: () => void;
}

/** Small pause before the AI answers — reads as "thinking", not lag. */
const waitForAiBeat = (): Promise<void> =>
  new Promise((resolve) =>
    setTimeout(resolve, TOKENS.animation.aiThinkingDelayMs)
  );

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      board: createEmptyBoard(TOKENS.game.defaultGridSize),
      gridSize: TOKENS.game.defaultGridSize,
      currentPlayer: HUMAN_PLAYER,
      difficulty: 'MEDIUM',
      isAiThinking: false,
      winningLine: [],
      winner: null,
      stats: EMPTY_STATS,
      gameId: 0,

      initializeGame: (size) => {
        const targetSize = size ?? get().gridSize;
        set((state) => ({
          board: createEmptyBoard(targetSize),
          gridSize: targetSize,
          currentPlayer: HUMAN_PLAYER,
          isAiThinking: false,
          winningLine: [],
          winner: null,
          gameId: state.gameId + 1,
        }));
      },

      setDifficulty: (difficulty) => set({ difficulty }),

      resetStats: () => set({ stats: EMPTY_STATS }),

      makeMove: async (index) => {
        const { board, isAiThinking, winner, gridSize, difficulty, gameId } =
          get();

        if (board[index] !== null || isAiThinking || winner !== null) {
          triggerHaptic.error();
          return;
        }

        triggerHaptic.light();

        const updatedBoard = [...board];
        updatedBoard[index] = HUMAN_PLAYER;

        const humanWin = checkWin(updatedBoard, gridSize);
        if (humanWin) {
          triggerHaptic.success();
          set((state) => ({
            board: updatedBoard,
            winner: humanWin.winner,
            winningLine: humanWin.line,
            stats:
              humanWin.winner === HUMAN_PLAYER
                ? { ...state.stats, wins: state.stats.wins + 1 }
                : { ...state.stats, losses: state.stats.losses + 1 },
          }));
          return;
        }

        if (isBoardFull(updatedBoard)) {
          triggerHaptic.light();
          set((state) => ({
            board: updatedBoard,
            winner: 'DRAW',
            stats: { ...state.stats, draws: state.stats.draws + 1 },
          }));
          return;
        }

        // Hand the turn to the AI.
        set({
          board: updatedBoard,
          currentPlayer: AI_PLAYER,
          isAiThinking: true,
        });

        await waitForAiBeat();

        // A reset may have happened while the AI was "thinking".
        if (get().gameId !== gameId) return;

        const aiMove = getBestMove(updatedBoard, gridSize, AI_PLAYER, difficulty);
        if (aiMove === NO_MOVE) {
          set({ currentPlayer: HUMAN_PLAYER, isAiThinking: false });
          return;
        }

        updatedBoard[aiMove] = AI_PLAYER;
        triggerHaptic.light();

        const aiWin = checkWin(updatedBoard, gridSize);
        if (aiWin) {
          triggerHaptic.error(); // The human just lost.
          set((state) => ({
            board: updatedBoard,
            currentPlayer: HUMAN_PLAYER,
            isAiThinking: false,
            winner: aiWin.winner,
            winningLine: aiWin.line,
            stats:
              aiWin.winner === AI_PLAYER
                ? { ...state.stats, losses: state.stats.losses + 1 }
                : { ...state.stats, wins: state.stats.wins + 1 },
          }));
          return;
        }

        if (isBoardFull(updatedBoard)) {
          set((state) => ({
            board: updatedBoard,
            currentPlayer: HUMAN_PLAYER,
            isAiThinking: false,
            winner: 'DRAW',
            stats: { ...state.stats, draws: state.stats.draws + 1 },
          }));
          return;
        }

        set({
          board: updatedBoard,
          currentPlayer: HUMAN_PLAYER,
          isAiThinking: false,
        });
      },
    }),
    {
      name: 'neo-tox-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        stats: state.stats,
        difficulty: state.difficulty,
        gridSize: state.gridSize,
      }),
    }
  )
);
