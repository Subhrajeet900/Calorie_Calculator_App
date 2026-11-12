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
  const macros = [
    {
      label: 'PROTEIN',
      consumed: consumedProtein,
      target: targetProtein,
      color: COLORS.protein,
    },
    {
      label: 'CARBS',
      consumed: consumedCarbs,
      target: targetCarbs,
      color: COLORS.carbs,
    },
    {
      label: 'FATS',
      consumed: consumedFat,
      target: targetFat,
      color: COLORS.fat,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>MACRONUTRIENT SPLIT</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>G / DAY</Text>
        </View>
      </View>

      <View style={styles.capsulesList}>
        {macros.map((m) => {
          const safeTarget = Math.max(m.target, 1);
          const pct = Math.min(100, Math.round((m.consumed / safeTarget) * 100));
          const rem = Math.max(0, Math.round(m.target - m.consumed));
          return (
            <View key={m.label} style={styles.macroCapsule}>
              <View style={styles.capsuleTop}>
                <View style={styles.capsuleLabelGroup}>
                  <View style={[styles.glowDot, { backgroundColor: m.color }]} />
                  <Text style={styles.macroLabel}>{m.label}</Text>
                </View>

                <Text style={styles.macroFraction}>
                  <Text style={[styles.consumedBold, { color: COLORS.text }]}>
                    {Math.round(m.consumed)}g
                  </Text>
                  <Text style={styles.targetMuted}> / {Math.round(m.target)}g</Text>
                </Text>
              </View>

              <View style={styles.meterTrack}>
                <View
                  style={[
                    styles.meterFill,
                    { width: `${pct}%`, backgroundColor: m.color },
                  ]}
                />
              </View>

              <View style={styles.capsuleBottom}>
                <Text style={styles.pctText}>{pct}%</Text>
                <Text style={styles.remainingText}>{rem}g left</Text>
              </View>
            </View>
          );
        })}
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
    letterSpacing: 1.2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
  },
  capsulesList: {
    gap: SPACING.sm,
  },
  macroCapsule: {
    backgroundColor: '#161820',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
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
