import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { getLocalDateStr } from '../utils/calculator';

export default function Header({
  date,
  onPrevDate,
  onNextDate,
  onToday,
  onOpenWelcome,
  onOpenProfile,
  user,
}) {
  const isToday = () => date === getLocalDateStr();

  const formatDateDisplay = () => {
    if (isToday()) return 'Today';
    try {
      const d = new Date(date + 'T12:00:00');
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const initial = user?.name ? user.name.trim().charAt(0).toUpperCase() : null;

  return (
    <View style={styles.container}>
      {/* Left Circular Glass Button: CalCalc Emblem / Welcome Cover */}
      <TouchableOpacity
        style={styles.circleBtn}
        onPress={onOpenWelcome}
        activeOpacity={0.75}
        accessibilityLabel="Open CalCalc Cover"
      >
        <MaterialCommunityIcons name="arm-flex" size={18} color={COLORS.accent} />
      </TouchableOpacity>

      {/* Center Obsidian Date Pill (< Today >) */}
      <View style={styles.datePill}>
        <TouchableOpacity
          style={styles.pillChevron}
          onPress={onPrevDate}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 6 }}
        >
          <Ionicons name="chevron-back" size={15} color={COLORS.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pillCenter}
          onPress={onToday}
          activeOpacity={0.75}
        >
          <Text style={styles.dateText}>{formatDateDisplay()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pillChevron}
          onPress={onNextDate}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 6, right: 10 }}
        >
          <Ionicons name="chevron-forward" size={15} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Right Circular Glass Button: Profile & Targets */}
      <TouchableOpacity
        style={styles.circleBtn}
        onPress={onOpenProfile}
        activeOpacity={0.75}
        accessibilityLabel="Profile and Goals"
      >
        {initial ? (
          <Text style={styles.initialText}>{initial}</Text>
        ) : (
          <Ionicons name="person-outline" size={17} color={COLORS.text} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
    backgroundColor: 'transparent',
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(20, 26, 37, 0.72)',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 24, 34, 0.78)',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    height: 36,
    minWidth: 136,
    justifyContent: 'space-between',
  },
  pillChevron: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  pillCenter: {
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: COLORS.text,
    letterSpacing: 0.2,
  },
});
