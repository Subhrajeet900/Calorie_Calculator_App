import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MEAL_CONFIG = {
  breakfast: {
    title: 'Breakfast',
    icon: 'sunny-outline',
    tag: 'AM',
    tint: COLORS.primary,
  },
  lunch: {
    title: 'Lunch',
    icon: 'restaurant-outline',
    tag: 'MID',
    tint: COLORS.carbs,
  },
  dinner: {
    title: 'Dinner',
    icon: 'moon-outline',
    tag: 'PM',
    tint: COLORS.fat,
  },
  snack: {
    title: 'Snacks',
    icon: 'flash-outline',
    tag: 'FUEL',
    tint: COLORS.water,
  },
};

export default function MealCard({
  mealType,
  meal,
  totals,
  onAddFood,
  onDeleteItem,
}) {
  const [expanded, setExpanded] = useState(false);

  const config = MEAL_CONFIG[mealType] || MEAL_CONFIG.snack;
  const items = meal?.items || [];
  const totalCal = Math.round(totals?.calories || 0);
  const totalProt = Math.round(totals?.protein || 0);
  const totalCarbs = Math.round(totals?.carbs || 0);
  const totalFat = Math.round(totals?.fat || 0);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded((prev) => !prev);
  };

  return (
    <View style={[styles.card, expanded && styles.cardExpanded]}>
      {/* Main Horizontal Row matching Reference Charcoal Card */}
      <TouchableOpacity
        style={styles.headerRow}
        onPress={toggleExpand}
        activeOpacity={0.82}
      >
        <View style={styles.leftCircle}>
          <Ionicons name={config.icon} size={20} color="#F8FAFC" />
        </View>

        <View style={styles.centerMeta}>
          <Text style={styles.title}>{config.title}</Text>
          <View style={styles.subLine}>
            <Text style={styles.kcalText}>
              {totalCal.toLocaleString()} kcal
            </Text>
            {items.length > 0 ? (
              <Text style={styles.deltaMint}>
                +{totalProt}g P · {items.length}{' '}
                {items.length === 1 ? 'item' : 'items'}
              </Text>
            ) : (
              <Text style={styles.emptyHint}>Tap + Add</Text>
            )}
          </View>
        </View>

        {/* Outlined Oval Badge right — triggers Add Food directly */}
        <TouchableOpacity
          style={[styles.ovalBadge, items.length > 0 && styles.ovalBadgeActive]}
          onPress={() => onAddFood(mealType)}
          activeOpacity={0.75}
        >
          <Ionicons
            name="add"
            size={13}
            color={items.length > 0 ? COLORS.primary : COLORS.text}
          />
          <Text
            style={[
              styles.ovalBadgeText,
              items.length > 0 && styles.ovalBadgeTextActive,
            ]}
          >
            {config.tag}
          </Text>
        </TouchableOpacity>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={15}
          color={COLORS.textMuted}
          style={styles.chevron}
        />
      </TouchableOpacity>

      {/* Expanded Food Items List */}
      {expanded && (
        <View style={styles.itemsBody}>
          <View style={styles.hairline} />

          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No food logged for {config.title.toLowerCase()} yet.
              </Text>
              <TouchableOpacity
                style={styles.whiteAddPill}
                onPress={() => onAddFood(mealType)}
                activeOpacity={0.85}
              >
                <Ionicons name="add" size={15} color={COLORS.ctaWhiteText} />
                <Text style={styles.whiteAddPillText}>Add Food</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.itemsList}>
              <View style={styles.macroSummaryRow}>
                <Text style={styles.macroTag}>P {totalProt}g</Text>
                <Text style={styles.macroTag}>C {totalCarbs}g</Text>
                <Text style={styles.macroTag}>F {totalFat}g</Text>
              </View>

              {items.map((item, idx) => (
                <View
                  key={item.id || `${mealType}_${idx}`}
                  style={[
                    styles.itemRow,
                    idx === items.length - 1 && styles.itemRowLast,
                  ]}
                >
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.food_name || 'Logged Food'}
                    </Text>
                    <Text style={styles.itemSub}>
                      {Math.round(item.quantity_grams || 0)}g  •  P:{Math.round(item.protein || 0)}g  C:{Math.round(item.carbs || 0)}g  F:{Math.round(item.fat || 0)}g
                    </Text>
                  </View>

                  <View style={styles.itemRight}>
                    <Text style={styles.itemCal}>{Math.round(item.calories || 0)}</Text>
                    <Text style={styles.itemUnit}>kcal</Text>
                    <TouchableOpacity
                      style={styles.delBtn}
                      onPress={() => onDeleteItem(item.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={15} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.limeInlineBtn}
                onPress={() => onAddFood(mealType)}
                activeOpacity={0.85}
              >
                <Ionicons name="add-circle-outline" size={15} color={COLORS.primaryText} />
                <Text style={styles.limeInlineBtnText}>Add More to {config.title}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 14,
    marginBottom: 10,
  },
  cardExpanded: {
    borderColor: COLORS.surfaceBorderBright,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1B1D26',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  centerMeta: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.2,
  },
  subLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  kcalText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  deltaMint: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.success,
  },
  emptyHint: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  ovalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  ovalBadgeActive: {
    borderColor: COLORS.surfaceBorderActive,
    backgroundColor: COLORS.primaryAlpha,
  },
  ovalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: 0.4,
  },
  ovalBadgeTextActive: {
    color: COLORS.primary,
  },
  chevron: {
    marginLeft: 8,
  },
  itemsBody: {
    marginTop: 12,
  },
  hairline: {
    height: 1,
    backgroundColor: COLORS.surfaceBorder,
    marginBottom: 10,
  },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 4,
  },
  emptyStateText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textMuted,
  },
  whiteAddPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.ctaWhite,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  whiteAddPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.ctaWhiteText,
  },
  itemsList: {
    gap: 4,
  },
  macroSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  macroTag: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  itemRowLast: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flex: 1,
    paddingRight: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemCal: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },
  itemUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginRight: 6,
  },
  delBtn: {
    padding: 4,
  },
  limeInlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
    paddingVertical: 9,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
  },
  limeInlineBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryText,
  },
});
