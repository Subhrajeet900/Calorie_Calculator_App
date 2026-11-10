import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

const MEAL_ICONS = {
  breakfast: 'sunny-outline',
  lunch: 'restaurant-outline',
  dinner: 'moon-outline',
  snack: 'cafe-outline',
};

const MEAL_NAMES = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

export default function MealCard({
  mealType = 'breakfast',
  meal = null,
  totals = { calories: 0, protein: 0, carbs: 0, fat: 0, item_count: 0 },
  onAddFood,
  onDeleteItem,
}) {
  const items = meal?.items || [];
  const iconName = MEAL_ICONS[mealType] || 'fast-food-outline';
  const displayName = MEAL_NAMES[mealType] || mealType;

  return (
    <View style={styles.card}>
      {/* Meal Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.iconCircle}>
            <Ionicons name={iconName} size={18} color={COLORS.primary} />
          </View>
          <View>
            <Text style={styles.mealTitle}>{displayName}</Text>
            <Text style={styles.itemCountText}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </Text>
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
                  <Text style={styles.itemQuantity}>{Math.round(item.quantity)}g</Text>
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
                <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
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
        <Ionicons name="add" size={16} color={COLORS.primary} />
        <Text style={styles.addBtnText}>Add Food</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryAlpha,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemCountText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  totalKcal: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  kcalUnit: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.surfaceBorder,
    paddingTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.03)',
  },
  itemInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
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
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  itemKcal: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: '600',
  },
  macroPill: {
    fontSize: 10,
    fontWeight: '600',
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
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    marginTop: SPACING.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

