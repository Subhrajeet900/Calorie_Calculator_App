import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { api } from '../api/client';
import MuscleLogo from './MuscleLogo';

export default function WeeklyProgressModal({ visible, onClose, selectedDate }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (visible) {
      loadWeeklyData();
    }
  }, [visible, selectedDate]);

  const loadWeeklyData = async () => {
    setLoading(true);
    try {
      const res = await api.getWeeklyProgress(selectedDate);
      setData(res);
    } catch (e) {
      console.warn('Failed to load weekly progress:', e);
    } finally {
      setLoading(false);
    }
  };

  const days = data?.days || [];
  const targetKcal = data?.target_daily_kcal || 2000;
  const maxKcal = Math.max(targetKcal * 1.25, ...days.map((d) => d.consumed_kcal || 0), 1000);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MuscleLogo size={36} iconSize={20} />
              <View>
                <Text style={styles.sheetTitle}>Weekly Trajectory</Text>
                <Text style={styles.sheetSubtitle}>7-Day Intake & Consistency Trends</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
          ) : (
            <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* 7-Day Bar Chart */}
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <Text style={styles.chartTitle}>DAILY CALORIE INTAKE</Text>
                  <View style={styles.targetLegend}>
                    <View style={styles.legendDot} />
                    <Text style={styles.legendText}>Target: {Math.round(targetKcal)} kcal</Text>
                  </View>
                </View>

                {/* Bars Row */}
                <View style={styles.barsContainer}>
                  {days.map((d) => {
                    const heightPct = Math.min(100, Math.round((d.consumed_kcal / maxKcal) * 100));
                    const isOver = d.consumed_kcal > targetKcal;
                    const isToday = d.date === selectedDate;

                    return (
                      <View style={styles.barColumn} key={d.date}>
                        {/* Value label on top of bar */}
                        <Text style={styles.barValueText}>
                          {d.consumed_kcal > 0 ? Math.round(d.consumed_kcal) : '-'}
                        </Text>

                        {/* Bar Track */}
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

                        {/* Day label */}
                        <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                          {d.day_name}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {/* Weekly Summary Cards */}
              <View style={styles.summaryGrid}>
                <View style={styles.summaryCard}>
                  <Ionicons name="flame-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.summaryValue}>
                    {Math.round(data?.average_daily_kcal || 0)}
                  </Text>
                  <Text style={styles.summaryLabel}>Avg Daily Calories</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.carbs} />
                  <Text style={styles.summaryValue}>
                    {data?.days_logged || 0} / 7
                  </Text>
                  <Text style={styles.summaryLabel}>Days Logged</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Ionicons name="trending-down-outline" size={18} color={COLORS.protein} />
                  <Text
                    style={[
                      styles.summaryValue,
                      (data?.weekly_deficit || 0) > 0 && { color: COLORS.danger },
                    ]}
                  >
                    {data?.weekly_deficit > 0 ? `+${data.weekly_deficit}` : data?.weekly_deficit || 0}
                  </Text>
                  <Text style={styles.summaryLabel}>Daily Net Balance</Text>
                </View>

                <View style={styles.summaryCard}>
                  <Ionicons name="fitness-outline" size={18} color={COLORS.fat} />
                  <Text style={styles.summaryValue}>
                    {Math.round(data?.average_protein || 0)}g
                  </Text>
                  <Text style={styles.summaryLabel}>Avg Protein / Day</Text>
                </View>
              </View>

              {/* Privacy Notice Banner */}
              <View style={styles.privacyBanner}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
                <View style={styles.privacyContent}>
                  <Text style={styles.privacyTitle}>100% On-Device & Private</Text>
                  <Text style={styles.privacyDesc}>
                    Your health numbers and food logs are strictly yours. No tracking pixels, no behavioral ads, ever.
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    borderTopWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
    maxHeight: '85%',
    paddingBottom: SPACING.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  sheetSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: SPACING.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  chartCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    marginBottom: SPACING.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  targetLegend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  legendText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: SPACING.md,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: '100%',
  },
  barValueText: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginBottom: 4,
    fontWeight: '600',
  },
  barTrack: {
    width: 22,
    height: 90,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: RADIUS.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: RADIUS.sm,
  },
  barNormal: {
    backgroundColor: COLORS.primary,
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
    fontWeight: '600',
  },
  dayLabelToday: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primaryAlpha,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderActive,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  privacyDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});

