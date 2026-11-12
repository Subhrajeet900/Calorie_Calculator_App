import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

export default function Header({
  date,
  onPrevDate,
  onNextDate,
  onToday,
  onQuickSearch,
  onOpenProfile,
  user,
}) {
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return 'Today';
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return 'Today';

    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const firstName = user?.name ? user.name.trim().split(' ')[0] : 'Athlete';
  const dateLabel = formatDateDisplay(date);
  const isToday = dateLabel === 'Today';

  return (
    <View style={styles.container}>
      {/* Left: Greeting + Compact Date Stepper */}
      <View style={styles.leftCol}>
        <Text style={styles.greeting} numberOfLines={1}>
          Hello, {firstName}
        </Text>

        <View style={styles.datePill}>
          <TouchableOpacity
            onPress={onPrevDate}
            style={styles.dateArrow}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}
          >
            <Ionicons name="chevron-back" size={12} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          <TouchableOpacity onPress={onToday} activeOpacity={0.75}>
            <Text style={styles.dateText}>{isToday ? 'Today' : dateLabel}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onNextDate}
            style={styles.dateArrow}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          >
            <Ionicons name="chevron-forward" size={12} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Right: Frosted Glass Action Circles */}
      <View style={styles.rightActions}>
        <TouchableOpacity
          style={styles.glassCircle}
          onPress={onQuickSearch}
          activeOpacity={0.75}
        >
          <Ionicons name="search-outline" size={19} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.glassCircle}
          onPress={onOpenProfile}
          activeOpacity={0.75}
        >
          <Ionicons
            name={user ? 'person-outline' : 'log-in-outline'}
            size={19}
            color="#FFFFFF"
          />
          {user && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  leftCol: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  greeting: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  datePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    gap: 6,
  },
  dateArrow: {
    paddingHorizontal: 2,
  },
  dateText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.92)',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  glassCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  activeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.primary,
    borderWidth: 1,
    borderColor: '#1F1A2B',
  },
});
