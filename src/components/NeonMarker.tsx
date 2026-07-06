import React, { useEffect } from 'react';
import { Canvas, Path, Shadow } from '@shopify/react-native-skia';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';
import { TOKENS } from '../theme/tokens';
import type { Mark } from '../engine/GameEngine';

interface NeonMarkerProps {
  type: Mark;
  size: number;
}

const { markerStrokeRatio, markerInsetRatio, markerRadiusRatio, markerGlowBlur } =
  TOKENS.board;
const { x1, y1, x2, y2 } = TOKENS.animation.markerEase;

/** Anchor ratios along a cell edge for building the marker paths. */
const NEAR_EDGE = markerInsetRatio;
const FAR_EDGE = 1 - markerInsetRatio;
const CENTER = 0.5;
const RING_TOP = CENTER - markerRadiusRatio;
const RING_BOTTOM = CENTER + markerRadiusRatio;

const buildMarkerPath = (type: Mark, size: number): string => {
  if (type === 'X') {
    return [
      `M ${size * NEAR_EDGE} ${size * NEAR_EDGE}`,
      `L ${size * FAR_EDGE} ${size * FAR_EDGE}`,
      `M ${size * FAR_EDGE} ${size * NEAR_EDGE}`,
      `L ${size * NEAR_EDGE} ${size * FAR_EDGE}`,
    ].join(' ');
  }
  const radius = size * markerRadiusRatio;
  return [
    `M ${size * CENTER} ${size * RING_TOP}`,
    `A ${radius} ${radius} 0 1 0 ${size * CENTER} ${size * RING_BOTTOM}`,
    `A ${radius} ${radius} 0 1 0 ${size * CENTER} ${size * RING_TOP}`,
  ].join(' ');
};

/**
 * A hardware-accelerated neon glyph that draws itself in with a stroked
 * path trim, glowing via a GPU shadow rather than CPU view shadows.
 */
export const NeonMarker = ({ type, size }: NeonMarkerProps) => {
  const drawProgress = useSharedValue(0);
  const color = type === 'X' ? TOKENS.colors.playerX : TOKENS.colors.playerO;
  const strokeWidth = size * markerStrokeRatio;

  useEffect(() => {
    drawProgress.value = withTiming(1, {
      duration: TOKENS.animation.drawLineMs,
      easing: Easing.bezier(x1, y1, x2, y2),
    });
  }, [drawProgress]);

  return (
    <Canvas style={{ width: size, height: size }} pointerEvents="none">
      <Path
        path={buildMarkerPath(type, size)}
        color={color}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
        end={drawProgress}
      >
        <Shadow dx={0} dy={0} blur={markerGlowBlur} color={color} />
      </Path>
    </Canvas>
  );
};
