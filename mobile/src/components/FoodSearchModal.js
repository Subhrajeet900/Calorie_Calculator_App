import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { api } from '../api/client';
import { calculateItemNutrition } from '../utils/calculator';
import MuscleLogo from './MuscleLogo';

const CATEGORIES = [
  'All',
  'Meat & Poultry',
  'Seafood',
  'Eggs & Dairy',
  'Grains & Breads',
  'Vegetables',
  'Fruits',
  'Nuts & Seeds',
  'Legumes',
  'Supplements',
  'Snacks',
];

export default function FoodSearchModal({
  visible,
  onClose,
  initialMealType = 'breakfast',
  selectedDate,
  onFoodLogged,
}) {
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'custom'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(false);

  // Selected food for logging
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState('100');
  const [mealType, setMealType] = useState(initialMealType);
  const [logging, setLogging] = useState(false);

  // Custom food form
  const [customName, setCustomName] = useState('');
  const [customCalories, setCustomCalories] = useState('');
  const [customProtein, setCustomProtein] = useState('');
  const [customCarbs, setCustomCarbs] = useState('');
  const [customFat, setCustomFat] = useState('');
  const [customCategory, setCustomCategory] = useState('Custom');

  useEffect(() => {
    if (visible) {
      setMealType(initialMealType);
      fetchFoods(searchQuery, selectedCategory);
    } else {
      setSelectedFood(null);
      setSearchQuery('');
    }
  }, [visible, initialMealType]);

  const fetchFoods = async (q = '', cat = 'All') => {
    setLoading(true);
    try {
      const results = await api.searchFoods(q, cat);
      setFoods(results || []);
    } catch (e) {
      console.warn('Failed to load foods:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    fetchFoods(text, selectedCategory);
  };

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    fetchFoods(searchQuery, cat);
  };

  const handleSelectFood = (food) => {
    setSelectedFood(food);
    setQuantity(String(food.serving_size || 100));
  };

  const handleQuickAddQty = (delta) => {
    const current = Number(quantity) || 0;
    const next = Math.max(10, current + delta);
    setQuantity(String(next));
  };

  const handleConfirmLog = async () => {
    if (!selectedFood) return;
    const qty = Number(quantity);
    if (!qty || qty <= 0) return;

    setLogging(true);
    try {
      await api.logMeal({
        meal_type: mealType,
        date: selectedDate,
        items: [{ food_id: selectedFood.id, quantity: qty }],
      });
      if (onFoodLogged) onFoodLogged();
      onClose();
    } catch (e) {
      console.warn('Failed to log meal:', e);
    } finally {
      setLogging(false);
    }
  };

  const handleCreateCustomFood = async () => {
    if (!customName.trim() || !customCalories) return;

    setLogging(true);
    try {
      const newFood = await api.createCustomFood({
        name: customName.trim(),
        category: customCategory,
        serving_unit: 'g',
        serving_size: 100,
        calories_per_100g: Number(customCalories) || 0,
        protein_per_100g: Number(customProtein) || 0,
        carbs_per_100g: Number(customCarbs) || 0,
        fat_per_100g: Number(customFat) || 0,
      });

      // Automatically select and switch to log
      setSelectedFood(newFood);
      setQuantity('100');
      setActiveTab('search');
      setSearchQuery('');
      fetchFoods('', 'All');
    } catch (e) {
      console.warn('Failed to create custom food:', e);
    } finally {
      setLogging(false);
    }
  };

  // Preview nutrition for selected food
  const preview = selectedFood
    ? calculateItemNutrition(selectedFood, Number(quantity) || 0)
    : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.sheetContainer}>
          {/* Sheet Header */}
          <View style={styles.sheetHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <MuscleLogo size={36} iconSize={20} />
              <View>
                <Text style={styles.sheetTitle}>Fuel Selection</Text>
                <Text style={styles.sheetSubtitle}>
                  Logging to {mealType.charAt(0).toUpperCase() + mealType.slice(1)} • {selectedDate}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Navigation Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'search' && styles.tabItemActive]}
              onPress={() => setActiveTab('search')}
            >
              <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
                Search Database
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'custom' && styles.tabItemActive]}
              onPress={() => setActiveTab('custom')}
            >
              <Text style={[styles.tabText, activeTab === 'custom' && styles.tabTextActive]}>
                + Custom Food
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'search' ? (
            <>
              {/* Search Box */}
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={COLORS.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search chicken, rice, banana, eggs..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => handleSearchChange('')}>
                    <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Categories Scroll */}
              <View style={styles.categoriesWrapper}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.categoriesContainer}
                >
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        selectedCategory === cat && styles.categoryChipActive,
                      ]}
                      onPress={() => handleCategorySelect(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          selectedCategory === cat && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Foods List */}
              {loading ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : (
                <FlatList
                  data={foods}
                  keyExtractor={(item) => String(item.id)}
                  style={styles.foodsList}
                  contentContainerStyle={styles.foodsListContent}
                  renderItem={({ item }) => {
                    const isSelected = selectedFood?.id === item.id;
                    return (
                      <TouchableOpacity
                        style={[styles.foodCard, isSelected && styles.foodCardSelected]}
                        onPress={() => handleSelectFood(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.foodInfo}>
                          <Text style={styles.foodName}>{item.name}</Text>
                          <Text style={styles.foodCategory}>{item.category}</Text>
                        </View>

                        <View style={styles.foodNutrients}>
                          <Text style={styles.foodKcal}>
                            {Math.round(item.calories_per_100g)} kcal
                          </Text>
                          <Text style={styles.foodMacros}>
                            P: {Math.round(item.protein_per_100g)} • C: {Math.round(item.carbs_per_100g)} • F: {Math.round(item.fat_per_100g)}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <Ionicons name="search-outline" size={32} color={COLORS.textMuted} />
                      <Text style={styles.emptyText}>No matching foods found</Text>
                      <Text style={styles.emptySubtext}>Try another term or tap + Custom Food</Text>
                    </View>
                  }
                />
              )}

              {/* Bottom Drawer for Selected Food */}
              {selectedFood && (
                <View style={styles.drawer}>
                  <View style={styles.drawerTop}>
                    <View style={styles.drawerFoodNameBox}>
                      <Text style={styles.drawerFoodName} numberOfLines={1}>
                        {selectedFood.name}
                      </Text>
                      <Text style={styles.drawerFoodSub}>
                        {preview?.calories} kcal for {quantity}g
                      </Text>
                    </View>

                    <View style={styles.qtyInputBox}>
                      <TextInput
                        style={styles.qtyInput}
                        keyboardType="numeric"
                        value={quantity}
                        onChangeText={setQuantity}
                        maxLength={5}
                      />
                      <Text style={styles.qtyUnit}>grams</Text>
                    </View>
                  </View>

                  {/* Quick Quantity Chips */}
                  <View style={styles.quickChipsRow}>
                    {[+25, +50, +100].map((delta) => (
                      <TouchableOpacity
                        key={delta}
                        style={styles.quickChip}
                        onPress={() => handleQuickAddQty(delta)}
                      >
                        <Text style={styles.quickChipText}>+{delta}g</Text>
                      </TouchableOpacity>
                    ))}
                    {['50', '100', '150', '200'].map((preset) => (
                      <TouchableOpacity
                        key={preset}
                        style={[styles.quickChip, quantity === preset && styles.quickChipActive]}
                        onPress={() => setQuantity(preset)}
                      >
                        <Text
                          style={[
                            styles.quickChipText,
                            quantity === preset && styles.quickChipTextActive,
                          ]}
                        >
                          {preset}g
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Live Macro Preview Bar */}
                  {preview && (
                    <View style={styles.previewMacrosRow}>
                      <View style={styles.previewMacro}>
                        <Text style={[styles.previewVal, { color: COLORS.protein }]}>
                          {preview.protein}g
                        </Text>
                        <Text style={styles.previewLbl}>Protein</Text>
                      </View>
                      <View style={styles.previewMacro}>
                        <Text style={[styles.previewVal, { color: COLORS.carbs }]}>
                          {preview.carbs}g
                        </Text>
                        <Text style={styles.previewLbl}>Carbs</Text>
                      </View>
                      <View style={styles.previewMacro}>
                        <Text style={[styles.previewVal, { color: COLORS.fat }]}>
                          {preview.fat}g
                        </Text>
                        <Text style={styles.previewLbl}>Fat</Text>
                      </View>
                    </View>
                  )}

                  {/* Meal Selector Tabs */}
                  <View style={styles.mealSelectorRow}>
                    {['breakfast', 'lunch', 'dinner', 'snack'].map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.mealSelectBtn,
                          mealType === m && styles.mealSelectBtnActive,
                        ]}
                        onPress={() => setMealType(m)}
                      >
                        <Text
                          style={[
                            styles.mealSelectText,
                            mealType === m && styles.mealSelectTextActive,
                          ]}
                        >
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Log Button */}
                  <TouchableOpacity
                    style={styles.logBtn}
                    onPress={handleConfirmLog}
                    disabled={logging}
                    activeOpacity={0.8}
                  >
                    {logging ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                        <Text style={styles.logBtnText}>
                          Add {quantity}g to {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            /* Custom Food Form */
            <ScrollView style={styles.customForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.formSectionTitle}>Create Custom Food</Text>
              <Text style={styles.formSectionDesc}>
                Add nutritional details per 100 grams to save to your local library.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Food Name *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="e.g. Grandma's Protein Shake"
                  placeholderTextColor={COLORS.textMuted}
                  value={customName}
                  onChangeText={setCustomName}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Calories (per 100g) *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 250"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={customCalories}
                    onChangeText={setCustomCalories}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Protein (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 20"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={customProtein}
                    onChangeText={setCustomProtein}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Carbohydrates (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 30"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={customCarbs}
                    onChangeText={setCustomCarbs}
                  />
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Fat (g)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. 5"
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType="numeric"
                    value={customFat}
                    onChangeText={setCustomFat}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.saveCustomBtn}
                onPress={handleCreateCustomFood}
                disabled={logging || !customName.trim() || !customCalories}
                activeOpacity={0.8}
              >
                {logging ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveCustomBtnText}>Save and Select Food</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '90%',
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
    width: 32,
    height: 32,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surfaceBorder,
  },
  tabItem: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADIUS.sm,
  },
  tabItemActive: {
    backgroundColor: COLORS.primaryAlpha,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    gap: SPACING.sm,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 14,
  },
  categoriesWrapper: {
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  categoriesContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.xs,
  },
  categoryChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  foodsList: {
    maxHeight: 280,
  },
  foodsListContent: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
  },
  foodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  foodCardSelected: {
    backgroundColor: COLORS.primaryAlpha,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.sm,
  },
  foodInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  foodCategory: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  foodNutrients: {
    alignItems: 'flex-end',
  },
  foodKcal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  foodMacros: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  centerContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    gap: 6,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  emptySubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  drawer: {
    backgroundColor: COLORS.surfaceLight,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  drawerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  drawerFoodNameBox: {
    flex: 1,
    paddingRight: SPACING.md,
  },
  drawerFoodName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  drawerFoodSub: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  qtyInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: 6,
  },
  qtyInput: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    width: 48,
    textAlign: 'center',
  },
  qtyUnit: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: SPACING.md,
  },
  quickChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  quickChipActive: {
    backgroundColor: COLORS.primaryAlpha,
    borderColor: COLORS.primary,
  },
  quickChipText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  quickChipTextActive: {
    color: COLORS.primary,
  },
  previewMacrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md,
  },
  previewMacro: {
    alignItems: 'center',
  },
  previewVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  previewLbl: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  mealSelectorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: SPACING.md,
  },
  mealSelectBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  mealSelectBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  mealSelectText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  mealSelectTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  logBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    gap: 8,
  },
  logBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  customForm: {
    padding: SPACING.lg,
    maxHeight: 380,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  formSectionDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 42,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  formRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  saveCustomBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  saveCustomBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

