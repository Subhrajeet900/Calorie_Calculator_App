import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function MacroCard({
  targetProtein = 150,
  targetCarbs = 225,
  targetFat = 55.6,
  consumedProtein = 0,
  consumedCarbs = 0,
  consumedFat = 0,
}) {
  const renderMacroRow = (label, consumed, target, color, alphaColor, unit = 'g') => {
    const safeTarget = Math.max(1, target);
    const pct = Math.min(100, Math.round((consumed / safeTarget) * 100));
    const isExceeded = consumed > target;

    return (
      <View style={styles.macroRow} key={label}>
        <View style={styles.labelRow}>
          <View style={styles.nameGroup}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={styles.macroName}>{label}</Text>
          </View>
          <Text style={styles.macroValues}>
            <Text style={[styles.consumedVal, { color }]}>{Math.round(consumed)}</Text>
            <Text style={styles.targetVal}> / {Math.round(target)}{unit}</Text>
          </Text>
        </View>

        {/* Bar */}
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              {
                width: `${pct}%`,
                backgroundColor: isExceeded ? COLORS.danger : color,
              },
            ]}
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>MACRO BREAKDOWN</Text>
        <Text style={styles.subtitle}>P: 30% • C: 45% • F: 25%</Text>
      </View>

      <View style={styles.macrosList}>
        {renderMacroRow('Protein', consumedProtein, targetProtein, COLORS.protein, COLORS.proteinAlpha)}
        {renderMacroRow('Carbs', consumedCarbs, targetCarbs, COLORS.carbs, COLORS.carbsAlpha)}
        {renderMacroRow('Fat', consumedFat, targetFat, COLORS.fat, COLORS.fatAlpha)}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  macrosList: {
    gap: SPACING.md,
  },
  macroRow: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  macroValues: {
    fontSize: 13,
  },
  consumedVal: {
    fontWeight: '700',
  },
  targetVal: {
    color: COLORS.textMuted,
  },
  track: {
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
});

