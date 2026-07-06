import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { triggerHaptic } from '../utils/haptics';
import { TOKENS } from '../theme/tokens';

export interface SegmentOption<T> {
  value: T;
  label: string;
}

interface SegmentedSelectorProps<T> {
  title: string;
  options: readonly SegmentOption<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

/**
 * Reusable pill selector used for both difficulty and grid size —
 * one component, zero duplicated styling.
 */
export const SegmentedSelector = <T extends string | number>({
  title,
  options,
  selected,
  onSelect,
}: SegmentedSelectorProps<T>) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <View style={styles.pillRow}>
      {options.map((option) => {
        const isActive = option.value === selected;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => {
              triggerHaptic.light();
              onSelect(option.value);
            }}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${title}: ${option.label}`}
            style={[styles.pill, isActive && styles.pillActive]}
          >
            <Text style={[styles.pillLabel, isActive && styles.pillLabelActive]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: TOKENS.spacing.sm,
  },
  title: {
    fontSize: TOKENS.typography.sizes.labelSm,
    letterSpacing: TOKENS.typography.letterSpacing.caps,
    color: TOKENS.colors.textMuted,
    fontWeight: TOKENS.typography.weights.semibold,
  },
  pillRow: {
    flexDirection: 'row',
    gap: TOKENS.spacing.sm,
  },
  pill: {
    paddingVertical: TOKENS.spacing.sm,
    paddingHorizontal: TOKENS.spacing.lg,
    borderRadius: TOKENS.radius.full,
    borderWidth: TOKENS.board.cellBorderWidth,
    borderColor: TOKENS.colors.surfaceBorder,
    backgroundColor: TOKENS.colors.cellIdle,
  },
  pillActive: {
    borderColor: TOKENS.colors.playerX,
    backgroundColor: TOKENS.colors.surface,
  },
  pillLabel: {
    fontSize: TOKENS.typography.sizes.labelCaps,
    letterSpacing: TOKENS.typography.letterSpacing.caps,
    color: TOKENS.colors.textMuted,
    fontWeight: TOKENS.typography.weights.semibold,
  },
  pillLabelActive: {
    color: TOKENS.colors.playerX,
  },
});
