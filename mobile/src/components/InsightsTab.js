import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { api } from '../api/client';
import { StatusPill } from './VisualWidgets';

export default function InsightsTab({ selectedDate, refreshTrigger, onOpenFullModal }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadWeeklyData();
  }, [selectedDate, refreshTrigger]);

  const loadWeeklyData = async () => {
    setLoading(true);
    try {
      const res = await api.getWeeklyProgress(selectedDate);
      setData(res);
    } catch (e) {
      console.warn('InsightsTab load error:', e);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="small" color={COLORS.accent} />
      </View>
    );
  }

  const days = data?.days || [];
  const targetKcal = data?.target_daily_kcal || 2000;
  const maxKcal = Math.max(
    targetKcal * 1.25,
    ...days.map((d) => d.consumed_kcal || 0),
    1000
  );

  const avgDaily = Math.round(data?.average_daily_kcal || 0);
  const avgDiffPct =
    targetKcal > 0 ? Math.round(((avgDaily - targetKcal) / targetKcal) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Weekly Bar Chart Bento */}
      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <View>
            <Text style={styles.eyebrow}>7-DAY INTAKE</Text>
            <View style={styles.headlineRow}>
              <Text style={styles.headlineNum}>{avgDaily.toLocaleString()}</Text>
              <Text style={styles.headlineUnit}> kcal avg</Text>
            </View>
          </View>

          <View style={styles.rightMeta}>
            <StatusPill
              text={`${Math.abs(avgDiffPct)}%`}
              positive={avgDaily <= targetKcal}
            />
            <Text style={styles.targetSub}>Target {Math.round(targetKcal)}</Text>
          </View>
        </View>

        <View style={styles.barsContainer}>
          {days.map((d) => {
            const heightPct = Math.min(
              100,
              Math.round(((d.consumed_kcal || 0) / maxKcal) * 100)
            );
            const isOver = d.consumed_kcal > targetKcal;
            const isToday = d.date === selectedDate;

            return (
              <View style={styles.barColumn} key={d.date}>
                <Text style={styles.barValueText}>
                  {d.consumed_kcal > 0 ? Math.round(d.consumed_kcal) : '-'}
                </Text>

                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      { height: `${heightPct}%` },
                      isOver
                        ? styles.barOver
                        : d.consumed_kcal > 0
                        ? styles.barNormal
                        : styles.barEmpty,
                    ]}
                  />
                </View>

                <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                  {d.day_name}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 2x2 Analytics Summary Bento */}
      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.eyebrow}>DAYS LOGGED</Text>
          <Text style={styles.summaryVal}>
            {data?.days_logged || 0} <Text style={styles.summaryUnit}>/ 7</Text>
          </Text>
          <Text style={styles.summaryHint}>Weekly adherence</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.eyebrow}>AVG PROTEIN</Text>
          <Text style={styles.summaryVal}>
            {Math.round(data?.average_protein || 0)}
            <Text style={styles.summaryUnit}> g</Text>
          </Text>
          <Text style={styles.summaryHint}>Daily muscle fuel</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.eyebrow}>AVG CARBS</Text>
          <Text style={styles.summaryVal}>
            {Math.round(data?.average_carbs || 0)}
            <Text style={styles.summaryUnit}> g</Text>
          </Text>
          <Text style={styles.summaryHint}>Glycogen energy</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.eyebrow}>NET DEFICIT</Text>
          <Text
            style={[
              styles.summaryVal,
              (data?.weekly_deficit || 0) < 0 && { color: COLORS.dangerLight },
            ]}
          >
            {data?.weekly_deficit > 0 ? `+${data.weekly_deficit}` : data?.weekly_deficit || 0}
          </Text>
          <Text style={styles.summaryHint}>kcal vs goal</Text>
        </View>
      </View>

      {/* Expand Detailed Trajectory Modal Button */}
      {onOpenFullModal && (
        <TouchableOpacity
          style={styles.detailBtn}
          onPress={onOpenFullModal}
          activeOpacity={0.85}
        >
          <View style={styles.detailLeft}>
            <View style={styles.detailCircle}>
              <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.accent} />
            </View>
            <View>
              <Text style={styles.detailTitle}>7-Day Trajectory</Text>
              <Text style={styles.detailText}>Local + cloud synced reports</Text>
            </View>
          </View>
          <View style={styles.detailPill}>
            <Text style={styles.detailPillText}>OPEN</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  loadingWrap: {
    padding: SPACING.xxxl,
    alignItems: 'center',
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1.1,
    marginBottom: 4,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  headlineNum: {
    fontSize: 28,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  headlineUnit: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  rightMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  targetSub: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 136,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barValueText: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontWeight: '500',
  },
  barTrack: {
    width: 18,
    height: 88,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 6,
  },
  barNormal: {
    backgroundColor: COLORS.accent,
  },
  barOver: {
    backgroundColor: COLORS.danger,
  },
  barEmpty: {
    backgroundColor: 'transparent',
  },
  dayLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    fontWeight: '500',
  },
  dayLabelToday: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  summaryVal: {
    fontSize: 24,
    fontWeight: '400',
    color: COLORS.text,
    marginTop: 2,
  },
  summaryUnit: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  summaryHint: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  detailBtn: {
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
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1B1D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    marginTop: 1,
  },
  detailPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
  },
  detailPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
});

