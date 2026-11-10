import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

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
          <View style={styles.logoBadge}>
            <Ionicons name="flame" size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.appName}>CalorieCalc</Text>
            <Text style={styles.appTagline}>Privacy-First Tracker</Text>
          </View>
        </View>

        <View style={styles.iconButtons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={onOpenWeekly}
            activeOpacity={0.7}
            accessibilityLabel="Weekly Progress"
          >
            <Ionicons name="bar-chart-outline" size={20} color={COLORS.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.profileBtn]}
            onPress={onOpenProfile}
            activeOpacity={0.7}
            accessibilityLabel="Profile & Calculator"
          >
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom row: Date Navigator */}
      <View style={styles.dateNavigator}>
        <TouchableOpacity
          style={styles.dateArrow}
          onPress={onPrevDate}
          activeOpacity={0.6}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateBadge}
          onPress={onToday}
          activeOpacity={0.7}
        >
          <Ionicons name="calendar-outline" size={15} color={COLORS.primary} />
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
          <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryAlpha,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  appTagline: {
    fontSize: 11,
    color: COLORS.textMuted,
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
    backgroundColor: COLORS.primaryAlpha,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  dateNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  dateArrow: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: RADIUS.md,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  dateText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  todayIndicator: {
    backgroundColor: COLORS.surfaceBorder,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    marginLeft: SPACING.xs,
  },
  todayIndicatorText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '600',
  },
});

