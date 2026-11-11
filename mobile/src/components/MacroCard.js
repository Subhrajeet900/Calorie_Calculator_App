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
  const renderMacroCapsule = (label, consumed, target, color, unit = 'g') => {
    const safeTarget = Math.max(1, target);
    const pct = Math.min(100, Math.round((consumed / safeTarget) * 100));
    const remaining = Math.max(0, Math.round(target - consumed));
    const isExceeded = consumed > target;

    return (
      <View style={styles.macroCapsule} key={label}>
        <View style={styles.capsuleTop}>
          <View style={styles.capsuleLabelGroup}>
            <View style={[styles.glowDot, { backgroundColor: color }]} />
            <Text style={styles.macroLabel}>{label.toUpperCase()}</Text>
          </View>
          <Text style={styles.macroFraction}>
            <Text style={[styles.consumedBold, { color }]}>{Math.round(consumed)}</Text>
            <Text style={styles.targetMuted}> / {Math.round(target)}{unit}</Text>
          </Text>
        </View>

        {/* Progress Meter */}
        <View style={styles.meterTrack}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${pct}%`,
                backgroundColor: isExceeded ? COLORS.danger : color,
              },
            ]}
          />
        </View>

        <View style={styles.capsuleBottom}>
          <Text style={styles.pctText}>{pct}%</Text>
          <Text style={styles.remainingText}>
            {isExceeded ? 'Target hit' : `${remaining}g left`}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>MACRO FUEL SPLIT</Text>
        <Text style={styles.ratioText}>P: 30% • C: 45% • F: 25%</Text>
      </View>

      <View style={styles.capsulesList}>
        {renderMacroCapsule('Protein', consumedProtein, targetProtein, COLORS.protein)}
        {renderMacroCapsule('Carbohydrates', consumedCarbs, targetCarbs, COLORS.carbs)}
        {renderMacroCapsule('Healthy Fats', consumedFat, targetFat, COLORS.fat)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
  },
  ratioText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  capsulesList: {
    gap: SPACING.sm,
  },
  macroCapsule: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  capsuleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  capsuleLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  glowDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 0.8,
  },
  macroFraction: {
    fontSize: 12,
  },
  consumedBold: {
    fontWeight: '800',
  },
  targetMuted: {
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  meterTrack: {
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    marginBottom: 6,
  },
  meterFill: {
    height: '100%',
    borderRadius: RADIUS.full,
  },
  capsuleBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pctText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textSecondary,
  },
  remainingText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
});
