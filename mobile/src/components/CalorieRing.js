import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function CalorieRing({
  target = 2000,
  consumed = 0,
  remaining = 2000,
}) {
  const safeTarget = Math.max(1, target);
  const percentage = Math.min(100, Math.round((consumed / safeTarget) * 100));
  const isOver = consumed > target;

  const getStatusText = () => {
    if (consumed === 0) return 'Log your first meal of the day';
    if (isOver) {
      const overBy = Math.round(consumed - target);
      return `${overBy} kcal over daily budget`;
    }
    return `${Math.round(remaining)} kcal remaining today`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleBadge}>
          <Ionicons name="flash" size={14} color={COLORS.primary} />
          <Text style={styles.titleText}>DAILY CALORIE TARGET</Text>
        </View>
        <Text style={[styles.percentageText, isOver && styles.percentageOver]}>
          {percentage}%
        </Text>
      </View>

      {/* Main Numbers Row */}
      <View style={styles.numbersRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Consumed</Text>
          <Text style={styles.statValueConsumed}>{Math.round(consumed)}</Text>
          <Text style={styles.statUnit}>kcal</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Target</Text>
          <Text style={styles.statValueTarget}>{Math.round(target)}</Text>
          <Text style={styles.statUnit}>kcal</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{isOver ? 'Over by' : 'Remaining'}</Text>
          <Text style={[styles.statValueRemaining, isOver && styles.statValueOver]}>
            {Math.abs(Math.round(remaining))}
          </Text>
          <Text style={styles.statUnit}>kcal</Text>
        </View>
      </View>

      {/* Modern Progress Bar */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%` },
            isOver && styles.progressBarOver,
          ]}
        />
      </View>

      {/* Status Bar */}
      <View style={styles.statusRow}>
        <Ionicons
          name={isOver ? 'alert-circle' : 'checkmark-circle'}
          size={14}
          color={isOver ? COLORS.danger : COLORS.primary}
        />
        <Text style={[styles.statusText, isOver && styles.statusTextOver]}>
          {getStatusText()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  titleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },
  percentageOver: {
    color: COLORS.danger,
  },
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  statValueConsumed: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
  },
  statValueTarget: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  statValueRemaining: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statValueOver: {
    color: COLORS.danger,
  },
  statUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 36,
    backgroundColor: COLORS.surfaceBorder,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  progressBarOver: {
    backgroundColor: COLORS.danger,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  statusTextOver: {
    color: COLORS.danger,
  },
});

