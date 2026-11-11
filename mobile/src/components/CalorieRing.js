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

  const getStatusBadge = () => {
    if (consumed === 0) {
      return {
        label: 'READY TO FUEL',
        icon: 'flash-outline',
        color: COLORS.primary,
        bg: COLORS.primaryAlpha,
      };
    }
    if (isOver) {
      const overKcal = Math.round(consumed - target);
      return {
        label: `+${overKcal} KCAL OVER BUDGET`,
        icon: 'alert-circle',
        color: COLORS.danger,
        bg: COLORS.dangerAlpha,
      };
    }
    if (percentage >= 85) {
      return {
        label: 'TARGET LOCKED IN',
        icon: 'checkmark-circle',
        color: COLORS.successLight,
        bg: COLORS.successAlpha,
      };
    }
    return {
      label: 'OPTIMAL FUEL ZONE',
      icon: 'flame',
      color: COLORS.accent,
      bg: COLORS.primaryAlpha,
    };
  };

  const status = getStatusBadge();

  return (
    <View style={styles.card}>
      {/* Top Header Badge */}
      <View style={styles.topRow}>
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon} size={12} color={status.color} />
          <Text style={[styles.statusBadgeText, { color: status.color }]}>
            {status.label}
          </Text>
        </View>

        <Text style={[styles.percentageText, isOver && styles.percentageOver]}>
          {percentage}%
        </Text>
      </View>

      {/* Hero Remaining Display */}
      <View style={styles.heroCenter}>
        <Text style={styles.heroSub}>REMAINING FUEL</Text>
        <Text style={[styles.heroNumber, isOver && styles.heroNumberOver]}>
          {isOver ? `-${Math.round(consumed - target)}` : Math.round(remaining)}
        </Text>
        <Text style={styles.heroUnit}>KCAL TO GO TODAY</Text>
      </View>

      {/* Progress Track with Glow */}
      <View style={styles.progressBarTrack}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%` },
            isOver && styles.progressBarOver,
          ]}
        />
      </View>

      {/* Bottom Numbers Row */}
      <View style={styles.numbersRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>CONSUMED</Text>
          <Text style={styles.statValue}>{Math.round(consumed)}</Text>
          <Text style={styles.statUnit}>kcal</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>DAILY TARGET</Text>
          <Text style={styles.statValueMuted}>{Math.round(target)}</Text>
          <Text style={styles.statUnit}>kcal</Text>
        </View>

        <View style={styles.statDivider} />

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>STATUS</Text>
          <Text
            style={[
              styles.statValue,
              { color: isOver ? COLORS.dangerLight : COLORS.accent },
            ]}
          >
            {isOver ? 'Exceeded' : 'On Track'}
          </Text>
          <Text style={styles.statUnit}>{isOver ? 'Adjust Dinner' : 'Paced Well'}</Text>
        </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.accent,
  },
  percentageOver: {
    color: COLORS.dangerLight,
  },
  heroCenter: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.md,
  },
  heroSub: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  heroNumber: {
    fontSize: 48,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -1,
  },
  heroNumberOver: {
    color: COLORS.dangerLight,
  },
  heroUnit: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 1.2,
    marginTop: 2,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.accent,
  },
  progressBarOver: {
    backgroundColor: COLORS.danger,
  },
  numbersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  statValueMuted: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  statUnit: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.surfaceBorder,
  },
});
