import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { TOKENS } from '../theme/tokens';

interface StatCellProps {
  label: string;
  value: number;
  color: string;
}

const StatCell = ({ label, value, color }: StatCellProps) => (
  <View
    style={styles.statCell}
    accessibilityLabel={`${label}: ${value}`}
    accessible
  >
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

/** Persistent session record: wins / draws / losses. */
export const ScoreBoard = () => {
  const stats = useGameStore((state) => state.stats);

  return (
    <View style={styles.container}>
      <StatCell label="WINS" value={stats.wins} color={TOKENS.colors.playerX} />
      <StatCell
        label="DRAWS"
        value={stats.draws}
        color={TOKENS.colors.textMuted}
      />
      <StatCell
        label="LOSSES"
        value={stats.losses}
        color={TOKENS.colors.playerO}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignSelf: 'stretch',
    justifyContent: 'space-evenly',
    backgroundColor: TOKENS.colors.surface,
    borderColor: TOKENS.colors.surfaceBorder,
    borderWidth: TOKENS.board.cellBorderWidth,
    borderRadius: TOKENS.radius.lg,
    paddingVertical: TOKENS.spacing.md,
    marginHorizontal: TOKENS.spacing.screenPadding,
  },
  statCell: {
    alignItems: 'center',
    gap: TOKENS.spacing.xs,
  },
  statValue: {
    fontSize: TOKENS.typography.sizes.statValue,
    fontWeight: TOKENS.typography.weights.bold,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: TOKENS.typography.sizes.labelSm,
    letterSpacing: TOKENS.typography.letterSpacing.caps,
    color: TOKENS.colors.textMuted,
    fontWeight: TOKENS.typography.weights.semibold,
  },
});
