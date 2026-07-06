/**
 * Pure N×N tic-tac-toe engine — fully decoupled from React.
 *
 * The exponential complexity of N×N game trees (a 5×5 board has ~10^28
 * configurations) is tamed with alpha-beta pruning, center-first move
 * ordering, and depth-limited search backed by an open-line heuristic.
 */
export type Mark = 'X' | 'O';
export type Player = Mark | null;
export type Difficulty = 'EASY' | 'MEDIUM' | 'IMPOSSIBLE';

export interface WinResult {
  winner: Mark;
  line: number[];
}

/** Probability that the EASY AI plays a random cell instead of the best one. */
const EASY_MISTAKE_PROBABILITY = 0.4;
/** Grid size at which exhaustive (game-perfect) search is affordable. */
const FULL_SEARCH_GRID_SIZE = 3;
/** Max plies on a 3×3 board — the whole game. */
const FULL_SEARCH_DEPTH = 9;
/** Search depth for larger grids, keeping the move under a frame budget. */
const LARGE_GRID_DEPTH_LIMIT = 4;
/** Shallow search depth used by the MEDIUM difficulty. */
const MEDIUM_DEPTH_LIMIT = 2;
/** Terminal score for a win; dominates any heuristic value. */
const WIN_SCORE = 1000;
/** Per-mark multiplier for unblocked lines in the heuristic evaluation. */
const OPEN_LINE_MARK_SCORE = 3;
/** No move available (board full). */
export const NO_MOVE = -1;

/** Builds every winning line (rows, columns, both diagonals) for a grid. */
export const getWinningLines = (gridSize: number): number[][] => {
  const lines: number[][] = [];

  for (let row = 0; row < gridSize; row++) {
    lines.push(
      Array.from({ length: gridSize }, (_, col) => row * gridSize + col)
    );
  }
  for (let col = 0; col < gridSize; col++) {
    lines.push(
      Array.from({ length: gridSize }, (_, row) => row * gridSize + col)
    );
  }
  lines.push(
    Array.from({ length: gridSize }, (_, i) => i * (gridSize + 1))
  );
  lines.push(
    Array.from(
      { length: gridSize },
      (_, i) => (gridSize - 1) + i * (gridSize - 1)
    )
  );

  return lines;
};

/** Memoized winning-line tables, keyed by grid size. */
const winningLinesCache = new Map<number, number[][]>();

const getCachedWinningLines = (gridSize: number): number[][] => {
  let lines = winningLinesCache.get(gridSize);
  if (!lines) {
    lines = getWinningLines(gridSize);
    winningLinesCache.set(gridSize, lines);
  }
  return lines;
};

/**
 * Checks for a winning combination on an N×N board.
 * Time complexity: O(N^2) — 2N + 2 lines of N cells each.
 */
export const checkWin = (
  board: Player[],
  gridSize: number
): WinResult | null => {
  for (const line of getCachedWinningLines(gridSize)) {
    const first = board[line[0]];
    if (first && line.every((idx) => board[idx] === first)) {
      return { winner: first, line };
    }
  }
  return null;
};

export const isBoardFull = (board: Player[]): boolean =>
  !board.includes(null);

const getEmptyIndices = (board: Player[]): number[] => {
  const empty: number[] = [];
  for (let idx = 0; idx < board.length; idx++) {
    if (board[idx] === null) empty.push(idx);
  }
  return empty;
};

/**
 * Orders candidate moves center-outward. Central cells participate in more
 * winning lines, so trying them first massively improves alpha-beta pruning.
 */
const orderMovesCenterFirst = (
  moves: number[],
  gridSize: number
): number[] => {
  const center = (gridSize - 1) / 2;
  return [...moves].sort((a, b) => {
    const distA =
      Math.abs(Math.floor(a / gridSize) - center) +
      Math.abs((a % gridSize) - center);
    const distB =
      Math.abs(Math.floor(b / gridSize) - center) +
      Math.abs((b % gridSize) - center);
    return distA - distB;
  });
};

/**
 * Heuristic for non-terminal cutoffs: rewards lines that only the given
 * player occupies, scaled exponentially by how many marks are already placed.
 */
const evaluateBoard = (
  board: Player[],
  gridSize: number,
  aiPlayer: Mark,
  humanPlayer: Mark
): number => {
  let score = 0;
  for (const line of getCachedWinningLines(gridSize)) {
    let aiMarks = 0;
    let humanMarks = 0;
    for (const idx of line) {
      if (board[idx] === aiPlayer) aiMarks++;
      else if (board[idx] === humanPlayer) humanMarks++;
    }
    if (aiMarks > 0 && humanMarks === 0) {
      score += OPEN_LINE_MARK_SCORE ** aiMarks;
    } else if (humanMarks > 0 && aiMarks === 0) {
      score -= OPEN_LINE_MARK_SCORE ** humanMarks;
    }
  }
  return score;
};

const minimax = (
  board: Player[],
  gridSize: number,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Mark,
  humanPlayer: Mark,
  depthLimit: number
): number => {
  const winState = checkWin(board, gridSize);
  if (winState?.winner === aiPlayer) return WIN_SCORE - depth;
  if (winState?.winner === humanPlayer) return depth - WIN_SCORE;
  if (isBoardFull(board)) return 0;
  if (depth >= depthLimit) {
    return evaluateBoard(board, gridSize, aiPlayer, humanPlayer);
  }

  const moves = orderMovesCenterFirst(getEmptyIndices(board), gridSize);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      board[move] = aiPlayer;
      const evaluation = minimax(
        board, gridSize, depth + 1, false,
        alpha, beta, aiPlayer, humanPlayer, depthLimit
      );
      board[move] = null;
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Alpha-beta prune
    }
    return maxEval;
  }

  let minEval = Infinity;
  for (const move of moves) {
    board[move] = humanPlayer;
    const evaluation = minimax(
      board, gridSize, depth + 1, true,
      alpha, beta, aiPlayer, humanPlayer, depthLimit
    );
    board[move] = null;
    minEval = Math.min(minEval, evaluation);
    beta = Math.min(beta, evaluation);
    if (beta <= alpha) break; // Alpha-beta prune
  }
  return minEval;
};

const getDepthLimit = (difficulty: Difficulty, gridSize: number): number => {
  if (difficulty === 'MEDIUM') return MEDIUM_DEPTH_LIMIT;
  return gridSize === FULL_SEARCH_GRID_SIZE
    ? FULL_SEARCH_DEPTH
    : LARGE_GRID_DEPTH_LIMIT;
};

/**
 * Selects the AI's move for the given board, grid size, and difficulty.
 * Returns NO_MOVE when the board is full.
 */
export const getBestMove = (
  board: Player[],
  gridSize: number,
  aiPlayer: Mark,
  difficulty: Difficulty,
  random: () => number = Math.random
): number => {
  const emptyIndices = getEmptyIndices(board);
  if (emptyIndices.length === 0) return NO_MOVE;

  // EASY: intentionally fallible — sometimes plays a random open cell.
  if (difficulty === 'EASY' && random() < EASY_MISTAKE_PROBABILITY) {
    return emptyIndices[Math.floor(random() * emptyIndices.length)];
  }

  const searchBoard = [...board];
  const depthLimit = getDepthLimit(difficulty, gridSize);
  const humanPlayer: Mark = aiPlayer === 'X' ? 'O' : 'X';
  const moves = orderMovesCenterFirst(emptyIndices, gridSize);

  let bestScore = -Infinity;
  let optimalMove = moves[0];

  for (const move of moves) {
    searchBoard[move] = aiPlayer;
    const score = minimax(
      searchBoard, gridSize, 0, false,
      -Infinity, Infinity, aiPlayer, humanPlayer, depthLimit
    );
    searchBoard[move] = null;

    if (score > bestScore) {
      bestScore = score;
      optimalMove = move;
    }
  }

  return optimalMove;
};
