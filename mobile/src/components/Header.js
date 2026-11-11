import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import MuscleLogo from './MuscleLogo';

export default function Header({
  date,
  onPrevDate,
  onNextDate,
  onToday,
  onOpenWeekly,
  onOpenProfile,
  user,
}) {
  const isToday = () => {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const formatDateDisplay = () => {
    if (isToday()) return 'Today';
    try {
      const d = new Date(date + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  };

  return (
    <View style={styles.container}>
      {/* Top row: Brand & Action Icons */}
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <MuscleLogo size={38} iconSize={22} />
          <View style={styles.brandTextCol}>
            <View style={styles.titleWithBadge}>
              <Text style={styles.appName}>CalCalc</Text>
              <View style={styles.proPill}>
                <Text style={styles.proPillText}>PRO</Text>
              </View>
            </View>
            <Text style={styles.appTagline}>ELITE BODY FUEL</Text>
          </View>
        </View>

        <View style={styles.iconButtons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onOpenWeekly}
            activeOpacity={0.7}
            accessibilityLabel="Weekly Progress"
          >
            <Ionicons name="stats-chart" size={17} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.profileBtn]}
            onPress={onOpenProfile}
            activeOpacity={0.7}
            accessibilityLabel="Profile & Targets"
          >
            <Ionicons name="person" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date Navigator Bar */}
      <View style={styles.dateNavigator}>
        <TouchableOpacity
          style={styles.dateArrow}
          onPress={onPrevDate}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-back" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateBadge}
          onPress={onToday}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
          <Text style={styles.dateText}>{formatDateDisplay()}</Text>
          {!isToday() && (
            <View style={styles.todayIndicator}>
              <Text style={styles.todayIndicatorText}>Reset</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateArrow}
          onPress={onNextDate}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-forward" size={18} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  brandTextCol: {
    justifyContent: 'center',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  proPill: {
    backgroundColor: COLORS.primaryAlpha,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 155, 0.3)',
  },
  proPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.2,
    marginTop: 1,
  },
  iconButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  profileBtn: {
    backgroundColor: COLORS.primaryDark,
    borderColor: COLORS.primary,
  },
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  dateArrow: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  dateText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  todayIndicator: {
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.xs,
  },
  todayIndicatorText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
});
