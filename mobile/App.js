import React, { useState, useEffect, useCallback } from 'react';
import {
  StatusBar,
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from './src/constants/theme';
import { storage } from './src/utils/storage';
import { getLocalDateStr } from './src/utils/calculator';
import { api } from './src/api/client';

// Core Components
import Header from './src/components/Header';
import WelcomeCover from './src/components/WelcomeCover';
import OverviewBento from './src/components/OverviewBento';
import InsightsTab from './src/components/InsightsTab';
import CalorieRing from './src/components/CalorieRing';
import MacroCard from './src/components/MacroCard';
import WaterTracker from './src/components/WaterTracker';
import MealCard from './src/components/MealCard';
import { DuskMeshBackdrop } from './src/components/VisualWidgets';

// Modals
import FoodSearchModal from './src/components/FoodSearchModal';
import WeeklyProgressModal from './src/components/WeeklyProgressModal';
import ProfileModal from './src/components/ProfileModal';
import AuthModal from './src/components/AuthModal';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'meals', label: 'Meals' },
  { id: 'insights', label: 'Insights' },
];

function computeFuelScore(daySummary, user, activeDays) {
  const targetKcal = Math.max(1, daySummary?.target_calories || user?.target_calories || 2000);
  const consumedKcal = daySummary?.total_calories || 0;
  const targetProt = Math.max(1, daySummary?.target_protein || user?.target_protein || 150);
  const consumedProt = daySummary?.total_protein || 0;

  if (consumedKcal === 0) {
    return Math.min(92, 74 + Math.min(12, activeDays));
  }

  const calRatio = consumedKcal / targetKcal;
  const calScore =
    calRatio <= 1.05
      ? Math.min(1, calRatio) * 20
      : Math.max(0, 20 - (calRatio - 1.05) * 40);
  const protScore = Math.min(1, consumedProt / targetProt) * 14;
  const consistencyBonus = Math.min(10, activeDays);
  return Math.max(45, Math.min(100, Math.round(56 + calScore + protScore + consistencyBonus)));
}

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

function MainApp() {
  const insets = useSafeAreaInsets();

  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getLocalDateStr());
  const [daySummary, setDaySummary] = useState(null);
  const [consistency, setConsistency] = useState({ activeDays: 0, matrixFlags: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Navigation & Cover State
  const [showWelcome, setShowWelcome] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [insightsRefresh, setInsightsRefresh] = useState(0);
  const [waterRefresh, setWaterRefresh] = useState(0);

  // Modals
  const [authVisible, setAuthVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [weeklyVisible, setWeeklyVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);

  // Initial load & cloud wakeup
  useEffect(() => {
    checkAuth();
    api.wakeServer();
  }, []);

  const refreshConsistency = async () => {
    try {
      const stats = await api.getConsistencyStats();
      setConsistency(stats);
    } catch {}
  };

  const checkAuth = async () => {
    setLoading(true);
    try {
      const savedUser = await storage.getUser();
      const token = await storage.getToken();

      if (token && savedUser) {
        setUser(savedUser);
        const cached = await api.getCachedMealsForDay(selectedDate);
        setDaySummary(cached);
        await refreshConsistency();
        setLoading(false);
        loadDayData(selectedDate);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.warn('CheckAuth error:', e);
      setLoading(false);
    }
  };

  const loadDayData = async (date) => {
    try {
      const cached = await api.getCachedMealsForDay(date);
      setDaySummary(cached);
      await refreshConsistency();
      const summary = await api.getMealsForDay(date);
      setDaySummary(summary);
      await refreshConsistency();
      setInsightsRefresh((n) => n + 1);
    } catch (e) {
      console.warn('Failed to load day data:', e);
    }
  };

  const handleWelcomeDismiss = () => {
    setShowWelcome(false);
    if (!user) {
      setAuthVisible(true);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDayData(selectedDate);
    setRefreshing(false);
  }, [selectedDate]);

  // Date Navigators
  const changeDate = (days) => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + days);
    const newDateStr = getLocalDateStr(current);
    setSelectedDate(newDateStr);
    loadDayData(newDateStr);
  };

  const handlePrevDate = () => changeDate(-1);
  const handleNextDate = () => changeDate(1);
  const handleToday = () => {
    const today = getLocalDateStr();
    setSelectedDate(today);
    loadDayData(today);
  };

  // Actions
  const handleOpenAddFood = (mealType = 'breakfast') => {
    setSelectedMealType(mealType);
    setSearchModalVisible(true);
  };

  const handleQuickHeroWater = async () => {
    const key = user?.email
      ? `@water_${String(user.email).trim().toLowerCase()}_${selectedDate}`
      : `@water_${selectedDate}`;
    try {
      const saved = await AsyncStorage.getItem(key);
      const next = Math.max(0, Number(saved || 0) + 250);
      await AsyncStorage.setItem(key, String(next));
      setWaterRefresh((n) => n + 1);
    } catch {}
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await api.deleteMealItem(itemId);
      loadDayData(selectedDate);
    } catch (e) {
      console.warn('Delete item error:', e);
    }
  };

  const handleAuthSuccess = (authedUser) => {
    setUser(authedUser);
    setAuthVisible(false);
    loadDayData(selectedDate);
  };

  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
    loadDayData(selectedDate);
  };

  const handleLogout = async () => {
    await storage.clearAll();
    setUser(null);
    setDaySummary(null);
    setConsistency({ activeDays: 0, matrixFlags: [] });
    setProfileVisible(false);
    setShowWelcome(false);
    setAuthVisible(true);
  };

  // Derived Totals
  const meals = daySummary?.meals || [];
  const mealTotals = daySummary?.meal_totals || {};
  const getMeal = (type) => meals.find((m) => m.meal_type === type);

  const consumedKcal = Math.round(daySummary?.total_calories || 0);
  const targetKcal = Math.round(
    daySummary?.target_calories || user?.target_calories || 2000
  );
  const remainingKcal = Math.round(targetKcal - consumedKcal);
  const isOverKcal = consumedKcal > targetKcal;
  const kcalPct = Math.round((consumedKcal / Math.max(1, targetKcal)) * 100);
  const fuelScore = computeFuelScore(daySummary, user, consistency.activeDays);

  const openProfileOrAuth = () => (user ? setProfileVisible(true) : setAuthVisible(true));

  const renderHeroCard = () => (
    <View style={[styles.heroCard, { paddingTop: insets.top + 6 }]}>
      <DuskMeshBackdrop borderBottomRadius={34} />

      <Header
        date={selectedDate}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
        onToday={handleToday}
        onQuickSearch={() => handleOpenAddFood('breakfast')}
        onOpenProfile={openProfileOrAuth}
        user={user}
      />

      {/* Centered Balance Hero Readout */}
      <View style={styles.heroCenter}>
        <Text style={styles.heroLabel}>Daily Intake (kcal)</Text>
        <Text style={styles.heroValue} numberOfLines={1} adjustsFontSizeToFit>
          {consumedKcal.toLocaleString()}
        </Text>

        <View style={styles.heroDeltaPill}>
          <Text style={styles.heroDeltaText}>
            {isOverKcal
              ? `+${Math.abs(remainingKcal).toLocaleString()} over`
              : `${remainingKcal.toLocaleString()} left`}{' '}
            · {kcalPct}% · Score {fuelScore}
          </Text>
        </View>
      </View>

      {/* Signature 4-Button Strip: 3 Frosted Circles + Wide Pure White Pill CTA */}
      <View style={styles.actionStrip}>
        <TouchableOpacity
          style={styles.heroCircleBtn}
          onPress={() => setShowWelcome(true)}
          activeOpacity={0.78}
        >
          <Ionicons name="sparkles-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.heroCircleBtn}
          onPress={handleQuickHeroWater}
          activeOpacity={0.78}
        >
          <Ionicons name="water-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.heroCircleBtn}
          onPress={() => setWeeklyVisible(true)}
          activeOpacity={0.78}
        >
          <Ionicons name="stats-chart-outline" size={19} color="#FFFFFF" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.whiteAddPill}
          onPress={() => handleOpenAddFood('breakfast')}
          activeOpacity={0.86}
        >
          <Ionicons name="add" size={20} color={COLORS.ctaWhiteText} />
          <Text style={styles.whiteAddText}>Add Food</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.heroBase} />

      {loading && !daySummary && user ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Syncing CalCalc Data...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, 16) + 92 },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={true}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.accent}
              colors={[COLORS.accent]}
            />
          }
        >
          {renderHeroCard()}

          {/* Outlined Capsule Pill Tabs: Overview | Meals | Insights */}
          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabPill, isActive && styles.tabPillActive]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tab Views */}
          {activeTab === 'overview' && (
            <>
              <View style={styles.mealsSection}>
                <Text style={styles.sectionHeader}>TODAY'S MEALS</Text>

                <MealCard
                  mealType="breakfast"
                  meal={getMeal('breakfast')}
                  totals={mealTotals['breakfast']}
                  onAddFood={handleOpenAddFood}
                  onDeleteItem={handleDeleteItem}
                />

                <MealCard
                  mealType="lunch"
                  meal={getMeal('lunch')}
                  totals={mealTotals['lunch']}
                  onAddFood={handleOpenAddFood}
                  onDeleteItem={handleDeleteItem}
                />

                <MealCard
                  mealType="dinner"
                  meal={getMeal('dinner')}
                  totals={mealTotals['dinner']}
                  onAddFood={handleOpenAddFood}
                  onDeleteItem={handleDeleteItem}
                />

                <MealCard
                  mealType="snack"
                  meal={getMeal('snack')}
                  totals={mealTotals['snack']}
                  onAddFood={handleOpenAddFood}
                  onDeleteItem={handleDeleteItem}
                />
              </View>

              <OverviewBento
                date={selectedDate}
                user={user}
                daySummary={daySummary}
                activeDays={consistency.activeDays}
                matrixFlags={consistency.matrixFlags}
                waterRefresh={waterRefresh}
                onWaterChanged={() => setWaterRefresh((n) => n + 1)}
                onQuickLog={(m) => handleOpenAddFood(m)}
                onOpenProfile={openProfileOrAuth}
                onSwitchToMeals={() => setActiveTab('meals')}
              />
            </>
          )}

          {activeTab === 'meals' && (
            <>
              <CalorieRing
                target={targetKcal}
                consumed={consumedKcal}
                remaining={daySummary?.remaining_calories ?? remainingKcal}
              />

              <MacroCard
                targetProtein={daySummary?.target_protein || user?.target_protein || 150}
                targetCarbs={daySummary?.target_carbs || user?.target_carbs || 225}
                targetFat={daySummary?.target_fat || user?.target_fat || 55.6}
                consumedProtein={daySummary?.total_protein || 0}
                consumedCarbs={daySummary?.total_carbs || 0}
                consumedFat={daySummary?.total_fat || 0}
              />

              <WaterTracker
                date={selectedDate}
                userEmail={user?.email}
                refreshTrigger={waterRefresh}
              />

              <View style={styles.mealsSection}>
                <Text style={styles.sectionHeader}>FUEL LOGS</Text>

                <MealCard
                  mealType="breakfast"
                  meal={getMeal('breakfast')}
                  totals={mealTotals['breakfast']}
                  onAddFood={handleOpenAddFood}
                  onDeleteItem={handleDeleteItem}
                />

                <MealCard
                  mealType="lunch"
                  meal={getMeal('lunch')}
                  totals={mealTotals['lunch']}
                  onAddFood={handleOpenAddFood}
                  onDeleteItem={handleDeleteItem}
                />

                <MealCard
                  mealType="dinner"
                  meal={getMeal('dinner')}
                  totals={mealTotals['dinner']}
                  onAddFood={handleOpenAddFood}
                  onDeleteItem={handleDeleteItem}
                />

                <MealCard
                  mealType="snack"
                  meal={getMeal('snack')}
                  totals={mealTotals['snack']}
                  onAddFood={handleOpenAddFood}
                  onDeleteItem={handleDeleteItem}
                />
              </View>
            </>
          )}

          {activeTab === 'insights' && (
            <InsightsTab
              selectedDate={selectedDate}
              refreshTrigger={insightsRefresh}
              onOpenFullModal={() => setWeeklyVisible(true)}
            />
          )}
        </ScrollView>
      )}

      {/* Floating Frosted Bottom Navigation Pill Dock */}
      {!showWelcome && (
        <View
          style={[
            styles.bottomDockWrap,
            { bottom: Math.max(insets.bottom, 12) + 6 },
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.bottomDock}>
            <TouchableOpacity
              style={[
                styles.dockBtn,
                activeTab === 'overview' && styles.dockBtnActive,
              ]}
              onPress={() => setActiveTab('overview')}
              activeOpacity={0.85}
            >
              <Ionicons
                name={activeTab === 'overview' ? 'home' : 'home-outline'}
                size={20}
                color={
                  activeTab === 'overview'
                    ? COLORS.primaryText
                    : COLORS.textSecondary
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dockBtn,
                activeTab === 'meals' && styles.dockBtnActive,
              ]}
              onPress={() => setActiveTab('meals')}
              activeOpacity={0.85}
            >
              <Ionicons
                name={activeTab === 'meals' ? 'restaurant' : 'restaurant-outline'}
                size={20}
                color={
                  activeTab === 'meals'
                    ? COLORS.primaryText
                    : COLORS.textSecondary
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.dockBtn,
                activeTab === 'insights' && styles.dockBtnActive,
              ]}
              onPress={() => setActiveTab('insights')}
              activeOpacity={0.85}
            >
              <Ionicons
                name={activeTab === 'insights' ? 'analytics' : 'analytics-outline'}
                size={20}
                color={
                  activeTab === 'insights'
                    ? COLORS.primaryText
                    : COLORS.textSecondary
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dockBtn}
              onPress={openProfileOrAuth}
              activeOpacity={0.85}
            >
              <Ionicons
                name="person-outline"
                size={20}
                color={COLORS.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Interactive Swipe-Up Opening Section */}
      <WelcomeCover
        visible={showWelcome}
        user={user}
        fuelScore={fuelScore}
        consumedKcal={consumedKcal}
        targetKcal={targetKcal}
        activeDays={consistency.activeDays}
        onDismiss={handleWelcomeDismiss}
      />

      {/* Modals */}
      <FoodSearchModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        initialMealType={selectedMealType}
        selectedDate={selectedDate}
        onFoodLogged={() => loadDayData(selectedDate)}
      />

      <WeeklyProgressModal
        visible={weeklyVisible}
        onClose={() => setWeeklyVisible(false)}
        selectedDate={selectedDate}
      />

      <ProfileModal
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
        user={user}
        onProfileUpdated={handleProfileUpdated}
        onLogout={handleLogout}
      />

      <AuthModal
        visible={authVisible}
        onAuthSuccess={handleAuthSuccess}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 110,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  heroCard: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    paddingBottom: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  heroCenter: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg + 2,
  },
  heroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.78)',
    letterSpacing: 0.2,
  },
  heroValue: {
    fontSize: 50,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -1.4,
    marginTop: 2,
  },
  heroDeltaPill: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  heroDeltaText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.92)',
  },
  actionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    gap: 10,
  },
  heroCircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteAddPill: {
    flex: 1,
    height: 48,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.ctaWhite,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  whiteAddText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.ctaWhiteText,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    padding: 4,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
    backgroundColor: COLORS.background,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primaryText,
    fontWeight: '800',
  },
  mealsSection: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.4,
    marginBottom: SPACING.md,
    marginLeft: 2,
  },
  bottomDockWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 30,
  },
  bottomDock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(19, 20, 26, 0.94)',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
  },
  dockBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#1D1F28',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dockBtnActive: {
    backgroundColor: COLORS.primary,
  },
});
