import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import {
  StatusPill,
  SmoothSparkCurve,
  WaveformBars,
  ActivityTileMatrix,
  DualWaveCurve,
} from './VisualWidgets';

export default function OverviewBento({
  date,
  user,
  daySummary,
  activeDays = 1,
  matrixFlags = [],
  waterRefresh = 0,
  onWaterChanged,
  onQuickLog,
  onOpenProfile,
  onSwitchToMeals,
}) {
  const [waterMl, setWaterMl] = useState(0);
  const waterGoal = 2500;
  const scopedWaterKey = user?.email
    ? `@water_${String(user.email).trim().toLowerCase()}_${date}`
    : `@water_${date}`;

  useEffect(() => {
    loadWater();
  }, [date, user?.email, waterRefresh]);

  const loadWater = async () => {
    try {
      let saved = await AsyncStorage.getItem(scopedWaterKey);
      if (saved === null && user?.email) {
        saved = await AsyncStorage.getItem(`@water_${date}`);
      }
      setWaterMl(saved ? Number(saved) : 0);
    } catch {
      setWaterMl(0);
    }
  };

  const addWater = async (delta = 250) => {
    const next = Math.max(0, waterMl + delta);
    setWaterMl(next);
    try {
      await AsyncStorage.setItem(scopedWaterKey, String(next));
      if (onWaterChanged) onWaterChanged();
    } catch {}
  };

  const consumedKcal = Math.round(daySummary?.total_calories || 0);
  const targetKcal = Math.round(
    daySummary?.target_calories || user?.target_calories || 2000
  );
  const kcalPct = Math.round((consumedKcal / Math.max(1, targetKcal)) * 100);
  const isOverKcal = consumedKcal > targetKcal;

  const consumedProt = Math.round(daySummary?.total_protein || 0);
  const targetProt = Math.round(
    daySummary?.target_protein || user?.target_protein || 150
  );
  const protPct = Math.round((consumedProt / Math.max(1, targetProt)) * 100);

  const waterPct = Math.round((waterMl / waterGoal) * 100);
  const weightKg = Math.round(Number(user?.weight) || 70);
  const heightM = (Number(user?.height) || 175) / 100;
  const healthyLow = Math.round(18.5 * heightM * heightM);
  const healthyHigh = Math.round(24.9 * heightM * heightM);

  const goalText =
    user?.goal === 'lose'
      ? '-500 kcal'
      : user?.goal === 'gain'
      ? '+300 kcal'
      : 'Maintain';

  return (
    <View style={styles.container}>
      {/* 2x2 Bento Matrix */}
      <View style={styles.gridRow}>
        {/* Top-Left: Calories */}
        <TouchableOpacity
          style={styles.bentoCard}
          onPress={onSwitchToMeals}
          activeOpacity={0.85}
        >
          <Text style={styles.cardEyebrow}>CALORIES</Text>
          <View style={styles.metricLine}>
            <Text style={styles.cardNumber}>
              {consumedKcal.toLocaleString()}
            </Text>
            <StatusPill
              text={`${kcalPct}%`}
              positive={!isOverKcal}
            />
          </View>
          <Text style={styles.cardSubHint}>of {targetKcal.toLocaleString()} kcal</Text>
          <View style={styles.visualArea}>
            <SmoothSparkCurve
              variant="ascending"
              progress={consumedKcal / Math.max(1, targetKcal)}
              height={52}
            />
          </View>
        </TouchableOpacity>

        {/* Top-Right: Protein */}
        <TouchableOpacity
          style={styles.bentoCard}
          onPress={onSwitchToMeals}
          activeOpacity={0.85}
        >
          <Text style={styles.cardEyebrow}>PROTEIN</Text>
          <View style={styles.metricLine}>
            <Text style={styles.cardNumber}>
              {consumedProt}
              <Text style={styles.unitInline}> g</Text>
            </Text>
            <StatusPill text={`${protPct}%`} positive />
          </View>
          <Text style={styles.cardSubHint}>Target {targetProt}g daily</Text>
          <View style={styles.visualArea}>
            <WaveformBars
              fillRatio={consumedProt / Math.max(1, targetProt)}
              height={52}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.gridRow}>
        {/* Bottom-Left: Active Days Heatmap */}
        <View style={styles.bentoCard}>
          <Text style={styles.cardEyebrow}>ACTIVE DAYS</Text>
          <View style={styles.metricLine}>
            <Text style={styles.cardNumber}>
              {activeDays}
              <Text style={styles.unitInline}> days</Text>
            </Text>
            <StatusPill text="28d" positive={activeDays > 0} />
          </View>
          <View style={[styles.visualArea, { marginTop: SPACING.sm }]}>
            <ActivityTileMatrix activeFlags={matrixFlags} />
          </View>
        </View>

        {/* Bottom-Right: Hydration */}
        <TouchableOpacity
          style={styles.bentoCard}
          onPress={() => addWater(250)}
          activeOpacity={0.85}
        >
          <View style={styles.cardHeaderInline}>
            <Text style={styles.cardEyebrow}>HYDRATION</Text>
            <View style={styles.microAddBadge}>
              <Ionicons name="add" size={11} color={COLORS.accent} />
              <Text style={styles.microAddText}>250ml</Text>
            </View>
          </View>

          <View style={styles.metricLine}>
            <Text style={styles.cardNumber}>
              {waterMl}
              <Text style={styles.unitInline}> ml</Text>
            </Text>
            <StatusPill text={`${waterPct}%`} positive={waterPct >= 40} />
          </View>

          <View style={styles.visualArea}>
            <SmoothSparkCurve
              variant="descending"
              progress={Math.max(0.25, waterMl / waterGoal)}
              height={52}
              lineColor={COLORS.water}
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Full-Width Bottom Bento Card: Weight & Targets */}
      <TouchableOpacity
        style={styles.wideCard}
        onPress={onOpenProfile}
        activeOpacity={0.85}
      >
        <View style={styles.wideLeft}>
          <Text style={styles.cardEyebrow}>BODY WEIGHT</Text>
          <View style={styles.metricLine}>
            <Text style={styles.cardNumber}>
              {weightKg}
              <Text style={styles.unitInline}> kg</Text>
            </Text>
            <StatusPill text={goalText} positive={user?.goal !== 'lose'} />
          </View>
          <Text style={styles.healthyRangeText}>
            Healthy weight is {healthyLow}kg - {healthyHigh}kg
          </Text>
        </View>

        <View style={styles.wideRight}>
          <DualWaveCurve height={64} nodeProgress={0.62} />
        </View>
      </TouchableOpacity>

      {/* Quick Action Bar matching Charcoal Card + Pill CTA */}
      <TouchableOpacity
        style={styles.quickLogBar}
        onPress={() => onQuickLog && onQuickLog('breakfast')}
        activeOpacity={0.85}
      >
        <View style={styles.quickLogLeft}>
          <View style={styles.quickLogIcon}>
            <Ionicons name="add" size={20} color={COLORS.primaryText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickLogTitle}>Log Food or Meal</Text>
            <Text style={styles.quickLogSub} numberOfLines={1}>
              129+ foods · piece/count or grams
            </Text>
          </View>
        </View>
        <View style={styles.logBadgePill}>
          <Text style={styles.logBadgeText}>LOG</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  gridRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  bentoCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    minHeight: 158,
    justifyContent: 'space-between',
  },
  cardHeaderInline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardEyebrow: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1.1,
    marginBottom: 6,
  },
  microAddBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryAlpha,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginBottom: 6,
    gap: 2,
  },
  microAddText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.accent,
  },
  metricLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    flexWrap: 'wrap',
  },
  cardNumber: {
    fontSize: 25,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  unitInline: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  cardSubHint: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  visualArea: {
    marginTop: SPACING.xs,
    justifyContent: 'flex-end',
  },
  wideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  wideLeft: {
    flex: 1.15,
    paddingRight: SPACING.sm,
  },
  wideRight: {
    flex: 0.85,
  },
  healthyRangeText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  quickLogBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  quickLogLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  quickLogIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLogTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  quickLogSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logBadgePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
  },
  logBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
});

