import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function WaterTracker({ date, userEmail }) {
  const [waterMl, setWaterMl] = useState(0);
  const goalMl = 2500;
  const scopedKey = userEmail
    ? `@water_${String(userEmail).trim().toLowerCase()}_${date}`
    : `@water_${date}`;

  useEffect(() => {
    loadWater();
  }, [date, userEmail]);

  const loadWater = async () => {
    try {
      let saved = await AsyncStorage.getItem(scopedKey);
      if (saved === null && userEmail) {
        saved = await AsyncStorage.getItem(`@water_${date}`);
      }
      setWaterMl(saved ? Number(saved) : 0);
    } catch {
      setWaterMl(0);
    }
  };

  const updateWater = async (delta) => {
    const next = Math.max(0, waterMl + delta);
    setWaterMl(next);
    try {
      await AsyncStorage.setItem(scopedKey, String(next));
    } catch {}
  };

  const percentage = Math.min(100, Math.round((waterMl / goalMl) * 100));
  const glasses = Math.round(waterMl / 250);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Ionicons name="water" size={14} color={COLORS.water} />
          <Text style={styles.title}>HYDRATION COCKPIT</Text>
        </View>
        <Text style={styles.pctText}>{percentage}%</Text>
      </View>

      <View style={styles.mainRow}>
        <View>
          <Text style={styles.valueText}>
            {waterMl}{' '}
            <Text style={styles.unitText}>/ {goalMl} ml</Text>
          </Text>
          <Text style={styles.glassesText}>
            💧 {glasses} of {Math.round(goalMl / 250)} glasses consumed
          </Text>
        </View>

        <View style={styles.actionBtns}>
          {waterMl > 0 && (
            <TouchableOpacity
              style={styles.btnSmall}
              onPress={() => updateWater(-250)}
              activeOpacity={0.7}
            >
              <Text style={styles.btnTextSub}>-250</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.btnAdd}
            onPress={() => updateWater(250)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={16} color="#05070B" />
            <Text style={styles.btnAddText}>+250ml</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percentage}%` }]} />
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
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.water,
    letterSpacing: 0.8,
  },
  pctText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.water,
  },
  mainRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  valueText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  unitText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  glassesText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  btnSmall: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  btnTextSub: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  btnAdd: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.water,
  },
  btnAddText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#05070B',
  },
  track: {
    height: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.water,
  },
});

