import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameStore } from '../store/useGameStore';
import type { Difficulty } from '../engine/GameEngine';
import { TOKENS } from '../theme/tokens';
import { ShaderBackground } from '../components/ShaderBackground';
import { ScoreBoard } from '../components/ScoreBoard';
import { GameBoard } from '../components/GameBoard';
import { StatusBanner } from '../components/StatusBanner';
import {
  SegmentedSelector,
  type SegmentOption,
} from '../components/SegmentedSelector';

const DIFFICULTY_OPTIONS: readonly SegmentOption<Difficulty>[] = [
  { value: 'EASY', label: 'EASY' },
  { value: 'MEDIUM', label: 'MEDIUM' },
  { value: 'IMPOSSIBLE', label: 'IMPOSSIBLE' },
];

const GRID_SIZE_OPTIONS: readonly SegmentOption<number>[] =
  TOKENS.game.gridSizeOptions.map((size) => ({
    value: size,
    label: `${size}×${size}`,
  }));

export const GameScreen = () => {
  const difficulty = useGameStore((state) => state.difficulty);
  const gridSize = useGameStore((state) => state.gridSize);
  const setDifficulty = useGameStore((state) => state.setDifficulty);
  const initializeGame = useGameStore((state) => state.initializeGame);

  return (
    <View style={styles.root}>
      <ShaderBackground />
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title} accessibilityRole="header">
          NEO&nbsp;TOX
        </Text>
        <ScoreBoard />
        <View style={styles.boardArea}>
          <GameBoard />
        </View>
        <StatusBanner />
        <View style={styles.controls}>
          <SegmentedSelector
            title="DIFFICULTY"
            options={DIFFICULTY_OPTIONS}
            selected={difficulty}
            onSelect={setDifficulty}
          />
          <SegmentedSelector
            title="GRID"
            options={GRID_SIZE_OPTIONS}
            selected={gridSize}
            onSelect={(size) => initializeGame(size)}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: TOKENS.colors.background,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: TOKENS.spacing.lg,
    gap: TOKENS.spacing.lg,
  },
  title: {
    fontSize: TOKENS.typography.sizes.headlineLg,
    fontWeight: TOKENS.typography.weights.black,
    letterSpacing: TOKENS.typography.letterSpacing.title,
    color: TOKENS.colors.textMain,
  },
  boardArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    gap: TOKENS.spacing.lg,
    paddingBottom: TOKENS.spacing.sm,
  },
});
