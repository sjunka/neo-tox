import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';
import { TOKENS } from '../theme/tokens';

export interface BoardMetrics {
  /** Total board edge length, capped for tablets. */
  boardSize: number;
  /** Edge length of a single cell. */
  cellSize: number;
  /** Gap between adjacent cells. */
  gapSize: number;
  /** Center point of a cell, in board-local coordinates. */
  getCellCenter: (index: number) => { x: number; y: number };
}

/** A board is padded on both the left and right edges. */
const PADDED_SIDES = 2;
/** Divisor to find the midpoint of a length. */
const MIDPOINT_DIVISOR = 2;

/**
 * Single source of truth for board geometry. Both the touchable grid and the
 * Skia winning-strike overlay derive their layout from these numbers, so the
 * two can never drift apart.
 */
export const useBoardMetrics = (gridSize: number): BoardMetrics => {
  const { width } = useWindowDimensions();

  return useMemo(() => {
    const available = width - TOKENS.spacing.screenPadding * PADDED_SIDES;
    const boardSize = Math.min(available, TOKENS.board.maxBoardSize);
    const gapSize = TOKENS.spacing.md;
    const totalGapSpace = gapSize * (gridSize - 1);
    const cellSize = (boardSize - totalGapSpace) / gridSize;

    const getCellCenter = (index: number) => {
      const row = Math.floor(index / gridSize);
      const col = index % gridSize;
      const half = cellSize / MIDPOINT_DIVISOR;
      return {
        x: col * (cellSize + gapSize) + half,
        y: row * (cellSize + gapSize) + half,
      };
    };

    return { boardSize, cellSize, gapSize, getCellCenter };
  }, [width, gridSize]);
};
