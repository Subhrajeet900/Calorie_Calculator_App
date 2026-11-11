import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { getServingMeta } from '../constants/defaultFoods';

function formatItemQuantity(item) {
  const qty = Number(item?.quantity) || 0;
  const meta = getServingMeta(item?.food);
  if (meta.hasCountUnit && meta.servingSize > 0) {
    const count = qty / meta.servingSize;
    const roundedHalf = Math.round(count * 2) / 2;
    if (roundedHalf > 0 && Math.abs(count - roundedHalf) < 0.08) {
      const unitWord =
        roundedHalf === 1 || meta.unitLabel.endsWith('s')
          ? meta.unitLabel
          : `${meta.unitLabel}s`;
      return `${roundedHalf} ${unitWord} (${Math.round(qty)}g)`;
    }
  }
  return `${Math.round(qty)}g`;
}

const MEAL_CONFIG = {
  breakfast: {
    title: 'Breakfast',
    sub: 'Morning Fuel',
    icon: 'sunny-outline',
  },
  lunch: {
    title: 'Lunch',
    sub: 'Midday Power',
    icon: 'restaurant-outline',
  },
  dinner: {
    title: 'Dinner',
    sub: 'Night Recovery',
    icon: 'moon-outline',
  },
  snack: {
    title: 'Snacks',
    sub: 'Micro Energy',
    icon: 'flash-outline',
  },
};

export default function MealCard({
  mealType = 'breakfast',
  meal = null,
  totals = { calories: 0, protein: 0, carbs: 0, fat: 0, item_count: 0 },
  onAddFood,
  onDeleteItem,
}) {
  const items = meal?.items || [];
  const config = MEAL_CONFIG[mealType] || MEAL_CONFIG.breakfast;

  return (
    <View style={styles.card}>
      {/* Meal Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name={config.icon} size={16} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.mealTitle}>{config.title}</Text>
            <Text style={styles.mealSub}>{config.sub}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.totalKcal}>{Math.round(totals.calories || 0)}</Text>
          <Text style={styles.kcalUnit}>kcal</Text>
        </View>
      </View>

      {/* Logged Items List */}
      {items.length > 0 && (
        <View style={styles.itemsList}>
          {items.map((item) => (
            <View style={styles.itemRow} key={item.id}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.food?.name || 'Logged Food'}
                </Text>
                <View style={styles.itemMeta}>
                  <Text style={styles.itemQuantity}>{formatItemQuantity(item)}</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.itemKcal}>{Math.round(item.calories)} kcal</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={[styles.macroPill, { color: COLORS.protein }]}>
                    P: {Math.round(item.protein)}g
                  </Text>
                  <Text style={[styles.macroPill, { color: COLORS.carbs }]}>
                    C: {Math.round(item.carbs)}g
                  </Text>
                  <Text style={[styles.macroPill, { color: COLORS.fat }]}>
                    F: {Math.round(item.fat)}g
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={() => onDeleteItem && onDeleteItem(item.id)}
                activeOpacity={0.6}
                accessibilityLabel="Delete item"
              >
                <Ionicons name="trash-outline" size={15} color={COLORS.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Add Food Button */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => onAddFood(mealType)}
        activeOpacity={0.7}
      >
        <Ionicons name="add-circle" size={16} color={COLORS.primary} />
        <Text style={styles.addBtnText}>+ Log to {config.title}</Text>
      </TouchableOpacity>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryAlpha,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 245, 155, 0.2)',
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },
  mealSub: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 0.4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
  },
  totalKcal: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.text,
  },
  kcalUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    paddingTop: SPACING.xs,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  itemInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  itemQuantity: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  metaDot: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  itemKcal: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '700',
  },
  macroPill: {
    fontSize: 10,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.3,
  },
});
