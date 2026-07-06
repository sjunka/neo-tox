import React, { useEffect } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { TOKENS } from '../theme/tokens';

interface PopInProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const POP_IN_TARGET = 1;

/**
 * Spring-driven scale/fade-in wrapper. Uses an explicit shared value rather
 * than a preset `entering` animation: presets animate through the CSS-style
 * entering pipeline, while this drives the UI-thread worklet path directly —
 * deterministic on the New Architecture, and it degrades gracefully (jumps
 * straight to the final state) when the user has Reduce Motion enabled.
 */
export const PopIn = ({ children, style }: PopInProps) => {
  const progress = useSharedValue<number>(TOKENS.animation.popInFromScale);

  useEffect(() => {
    progress.value = withSpring(POP_IN_TARGET, {
      damping: TOKENS.animation.springDamping,
      stiffness: TOKENS.animation.springStiffness,
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: progress.value }],
  }));

  return (
    <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
  );
};
