import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { StatusPill } from './VisualWidgets';

export default function CalorieRing({ target = 2000, consumed = 0, remaining = 2000 }) {
  const safeTarget = Math.max(target, 1);
  const percentage = Math.min(100, Math.max(0, Math.round((consumed / safeTarget) * 100)));
  const isOver = consumed > target;

  const displayRemaining = Math.abs(Math.round(remaining));
  const fillColor = isOver ? COLORS.danger : COLORS.primary;

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.iconCircle}>
          <Ionicons
            name="flame-outline"
            size={20}
            color={isOver ? COLORS.danger : COLORS.primary}
          />
        </View>

        <View style={styles.headlineMeta}>
          <Text style={styles.eyebrow}>DAILY ENERGY</Text>
          <View style={styles.numberRow}>
            <Text style={styles.bigValue}>{Math.round(consumed).toLocaleString()}</Text>
            <Text style={styles.unitText}> / {Math.round(target).toLocaleString()} kcal</Text>
          </View>
        </View>

        <StatusPill
          text={isOver ? 'OVER' : `${percentage}%`}
          positive={!isOver}
        />
      </View>

      {/* Progress Track */}
      <View style={styles.trackBg}>
        <View
          style={[
            styles.trackFill,
            {
              width: `${percentage}%`,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>

      <View style={styles.bottomRow}>
        <Text style={styles.bottomLabel}>
          {isOver ? 'Surplus beyond target' : 'Remaining allowance'}
        </Text>
        <Text
          style={[
            styles.bottomVal,
            { color: isOver ? COLORS.danger : COLORS.success },
          ]}
        >
          {isOver ? '+' : ''}
          {displayRemaining.toLocaleString()} kcal {isOver ? 'over' : 'left'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1B1D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headlineMeta: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.1,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  bigValue: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  unitText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  trackBg: {
    height: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    overflow: 'hidden',
    marginBottom: SPACING.sm + 2,
  },
  trackFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  bottomVal: {
    fontSize: 12,
    fontWeight: '700',
  },
});
