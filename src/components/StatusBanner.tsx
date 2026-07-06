import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { PopIn } from './PopIn';
import { useGameStore, HUMAN_PLAYER } from '../store/useGameStore';
import { triggerHaptic } from '../utils/haptics';
import { TOKENS } from '../theme/tokens';

const THINKING_OPACITY_LOW = 0.35;
const THINKING_OPACITY_HIGH = 1;
const INFINITE_REPEATS = -1;

/**
 * Live game status: whose turn it is, a pulsing "AI computing" state while
 * the opponent thinks, and the result + Play Again call to action.
 */
export const StatusBanner = () => {
  const winner = useGameStore((state) => state.winner);
  const isAiThinking = useGameStore((state) => state.isAiThinking);
  const initializeGame = useGameStore((state) => state.initializeGame);

  const pulse = useSharedValue(THINKING_OPACITY_HIGH);

  useEffect(() => {
    if (isAiThinking) {
      pulse.value = withRepeat(
        withTiming(THINKING_OPACITY_LOW, {
          duration: TOKENS.animation.thinkingPulseMs,
          easing: Easing.inOut(Easing.ease),
        }),
        INFINITE_REPEATS,
        true
      );
    } else {
      pulse.value = withTiming(THINKING_OPACITY_HIGH, {
        duration: TOKENS.animation.thinkingPulseMs,
      });
    }
  }, [isAiThinking, pulse]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  if (winner !== null) {
    const resultText =
      winner === 'DRAW'
        ? 'DRAW'
        : winner === HUMAN_PLAYER
          ? 'YOU WIN'
          : 'AI WINS';
    const resultColor =
      winner === 'DRAW'
        ? TOKENS.colors.textMuted
        : winner === HUMAN_PLAYER
          ? TOKENS.colors.playerX
          : TOKENS.colors.playerO;

    return (
      <PopIn style={styles.container}>
        <Text style={[styles.resultText, { color: resultColor }]}>
          {resultText}
        </Text>
        <Pressable
          onPress={() => {
            triggerHaptic.heavy();
            initializeGame();
          }}
          accessibilityRole="button"
          accessibilityLabel="Play again"
          style={({ pressed }) => [
            styles.playAgain,
            pressed && styles.playAgainPressed,
          ]}
        >
          <Text style={styles.playAgainLabel}>PLAY AGAIN</Text>
        </Pressable>
      </PopIn>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.turnText, pulseStyle]}>
        {isAiThinking ? 'AI COMPUTING…' : 'YOUR MOVE'}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: TOKENS.spacing.md,
    minHeight:
      TOKENS.typography.sizes.headlineLg +
      TOKENS.spacing.xxl +
      TOKENS.spacing.xl,
  },
  turnText: {
    fontSize: TOKENS.typography.sizes.bodyMd,
    letterSpacing: TOKENS.typography.letterSpacing.caps,
    color: TOKENS.colors.textMuted,
    fontWeight: TOKENS.typography.weights.semibold,
  },
  resultText: {
    fontSize: TOKENS.typography.sizes.headlineLg,
    letterSpacing: TOKENS.typography.letterSpacing.title,
    fontWeight: TOKENS.typography.weights.black,
  },
  playAgain: {
    paddingVertical: TOKENS.spacing.sm,
    paddingHorizontal: TOKENS.spacing.xl,
    borderRadius: TOKENS.radius.full,
    borderWidth: TOKENS.board.cellBorderWidth,
    borderColor: TOKENS.colors.playerX,
    backgroundColor: TOKENS.colors.surface,
  },
  playAgainPressed: {
    backgroundColor: TOKENS.colors.cellPressed,
  },
  playAgainLabel: {
    fontSize: TOKENS.typography.sizes.labelCaps,
    letterSpacing: TOKENS.typography.letterSpacing.caps,
    color: TOKENS.colors.playerX,
    fontWeight: TOKENS.typography.weights.bold,
  },
});
