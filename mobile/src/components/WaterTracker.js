import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { StatusPill } from './VisualWidgets';

export default function WaterTracker({ date, userEmail, refreshTrigger = 0 }) {
  const [waterMl, setWaterMl] = useState(0);
  const dailyGoal = 2500;
  const scopedKey = userEmail
    ? `@water_${String(userEmail).trim().toLowerCase()}_${date}`
    : `@water_${date}`;

  useEffect(() => {
    loadWater();
  }, [date, userEmail, refreshTrigger]);

  const loadWater = async () => {
    try {
      let saved = await AsyncStorage.getItem(scopedKey);
      if (saved === null && userEmail) {
        saved = await AsyncStorage.getItem(`@water_${date}`);
      }
      setWaterMl(saved ? parseInt(saved, 10) : 0);
    } catch (e) {
      console.warn('Water load error:', e);
    }
  };

  const updateWater = async (delta) => {
    const nextValue = Math.max(0, waterMl + delta);
    setWaterMl(nextValue);
    try {
      await AsyncStorage.setItem(scopedKey, String(nextValue));
    } catch (e) {
      console.warn('Water save error:', e);
    }
  };

  const pct = Math.min(100, Math.round((waterMl / dailyGoal) * 100));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="water-outline" size={20} color={COLORS.water} />
          </View>
          <View>
            <Text style={styles.title}>Hydration</Text>
            <Text style={styles.valueText}>
              {(waterMl / 1000).toFixed(2)}L{' '}
              <Text style={styles.goalText}>/ {(dailyGoal / 1000).toFixed(1)}L</Text>
            </Text>
          </View>
        </View>

        <StatusPill text={`${pct}%`} positive={pct >= 50} />
      </View>

      <View style={styles.barContainer}>
        <View style={[styles.barFill, { width: `${pct}%` }]} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnMinus}
          onPress={() => updateWater(-250)}
          activeOpacity={0.75}
        >
          <Ionicons name="remove" size={16} color={COLORS.textSecondary} />
          <Text style={styles.btnMinusText}>250 ml</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnAddWhite}
          onPress={() => updateWater(250)}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={16} color={COLORS.ctaWhiteText} />
          <Text style={styles.btnAddText}>250 ml</Text>
        </TouchableOpacity>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1B1D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  valueText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.water,
    marginTop: 2,
  },
  goalText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  barContainer: {
    height: 8,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  barFill: {
    height: '100%',
    backgroundColor: COLORS.water,
    borderRadius: RADIUS.full,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  btnMinus: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
  },
  btnMinusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  btnAddWhite: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.ctaWhite,
    paddingVertical: 10,
    borderRadius: RADIUS.full,
  },
  btnAddText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.ctaWhiteText,
  },
});
