import React, { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { BlurMask, Canvas, Path, Shadow } from '@shopify/react-native-skia';
import { useSharedValue, withSpring } from 'react-native-reanimated';
import { useGameStore } from '../store/useGameStore';
import { useBoardMetrics } from '../hooks/useBoardMetrics';
import { TOKENS } from '../theme/tokens';

const { strikeAuraWidth, strikeAuraBlur, strikeCoreWidth, strikeCoreGlowBlur } =
  TOKENS.board;

/**
 * The laser strike drawn across the winning line: a blurred neon aura in the
 * winner's color with a white-hot plasma core, animated with a spring trim.
 * Rendered as an absolute overlay inside the same wrapper as the grid, so it
 * shares board-local coordinates via useBoardMetrics.
 */
export const WinningStrike = () => {
  const winningLine = useGameStore((state) => state.winningLine);
  const winner = useGameStore((state) => state.winner);
  const gridSize = useGameStore((state) => state.gridSize);
  const { getCellCenter } = useBoardMetrics(gridSize);
  const progress = useSharedValue(0);

  const hasLine = winningLine.length > 0;

  useEffect(() => {
    if (hasLine) {
      progress.value = withSpring(1, {
        damping: TOKENS.animation.springDamping,
        stiffness: TOKENS.animation.springStiffness,
      });
    } else {
      progress.value = 0;
    }
  }, [hasLine, progress]);

  const linePath = useMemo(() => {
    if (!hasLine) return null;
    const start = getCellCenter(winningLine[0]);
    const end = getCellCenter(winningLine[winningLine.length - 1]);
    return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
  }, [hasLine, winningLine, getCellCenter]);

  if (!linePath) return null;

  const auraColor =
    winner === 'O' ? TOKENS.colors.playerO : TOKENS.colors.playerX;

  return (
    <Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Neon light-scattering aura */}
      <Path
        path={linePath}
        color={auraColor}
        style="stroke"
        strokeWidth={strikeAuraWidth}
        strokeCap="round"
        end={progress}
      >
        <BlurMask blur={strikeAuraBlur} style="normal" />
      </Path>
      {/* Plasma strike core */}
      <Path
        path={linePath}
        color={TOKENS.colors.strikeCore}
        style="stroke"
        strokeWidth={strikeCoreWidth}
        strokeCap="round"
        end={progress}
      >
        <Shadow dx={0} dy={0} blur={strikeCoreGlowBlur} color={auraColor} />
      </Path>
    </Canvas>
  );
};
