import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { PopIn } from './PopIn';
import { useGameStore } from '../store/useGameStore';
import { useBoardMetrics } from '../hooks/useBoardMetrics';
import { TOKENS } from '../theme/tokens';
import { NeonMarker } from './NeonMarker';
import { WinningStrike } from './WinningStrike';

const describeCell = (
  row: number,
  col: number,
  marker: string | null
): string => {
  const contents = marker ?? 'empty';
  return `Row ${row + 1}, column ${col + 1}, ${contents}`;
};

/**
 * The N×N game matrix. Cells stagger in on mount, markers zoom + draw
 * themselves, and the winning strike overlays in shared board coordinates.
 */
export const GameBoard = () => {
  const board = useGameStore((state) => state.board);
  const gridSize = useGameStore((state) => state.gridSize);
  const makeMove = useGameStore((state) => state.makeMove);
  const winningLine = useGameStore((state) => state.winningLine);
  const winner = useGameStore((state) => state.winner);
  const isAiThinking = useGameStore((state) => state.isAiThinking);
  const { boardSize, cellSize, gapSize } = useBoardMetrics(gridSize);

  const isLocked = winner !== null || isAiThinking;

  return (
    <View style={{ width: boardSize, height: boardSize }}>
      <View style={[styles.grid, { gap: gapSize }]}>
        {Array.from({ length: gridSize }).map((_, rowIndex) => (
          <View key={`row-${rowIndex}`} style={[styles.row, { gap: gapSize }]}>
            {Array.from({ length: gridSize }).map((_, colIndex) => {
              const index = rowIndex * gridSize + colIndex;
              const marker = board[index];
              const isWinningCell = winningLine.includes(index);

              return (
                <Animated.View
                  key={`cell-${gridSize}-${index}`}
                  layout={LinearTransition.springify().damping(
                    TOKENS.animation.springDamping
                  )}
                  entering={FadeIn.delay(
                    index * TOKENS.animation.cellStaggerMs
                  )}
                >
                  <Pressable
                    onPress={() => makeMove(index)}
                    disabled={isLocked || marker !== null}
                    accessibilityRole="button"
                    accessibilityLabel={describeCell(rowIndex, colIndex, marker)}
                    style={({ pressed }) => [
                      styles.cell,
                      {
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: pressed
                          ? TOKENS.colors.cellPressed
                          : TOKENS.colors.cellIdle,
                        borderColor: isWinningCell
                          ? TOKENS.colors.winHighlight
                          : TOKENS.colors.surfaceBorder,
                      },
                    ]}
                  >
                    {marker && (
                      <PopIn>
                        <NeonMarker type={marker} size={cellSize} />
                      </PopIn>
                    )}
                  </Pressable>
                </Animated.View>
              );
            })}
          </View>
        ))}
      </View>
      <WinningStrike />
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    borderWidth: TOKENS.board.cellBorderWidth,
    borderRadius: TOKENS.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
