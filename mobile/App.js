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
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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
import { AmbientAurora, LaurelScore } from './src/components/VisualWidgets';

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
  const fuelScore = computeFuelScore(daySummary, user, consistency.activeDays);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Top Steel-Blue Aurora Wash */}
      <AmbientAurora height={350} intensity={1} />

      {/* Minimal Flagship Header */}
      <Header
        date={selectedDate}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
        onToday={handleToday}
        onOpenWelcome={() => setShowWelcome(true)}
        onOpenProfile={() => (user ? setProfileVisible(true) : setAuthVisible(true))}
        user={user}
      />

      {loading && !daySummary && user ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.accent} />
          <Text style={styles.loadingText}>Syncing Body Fuel Data...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
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
          {/* Centered Laurel Fuel Score */}
          <View style={styles.scoreSection}>
            <LaurelScore score={fuelScore} label="Your Nutrition Score" />
            <Text style={styles.scoreSubtext}>
              {isOverKcal
                ? `${Math.abs(remainingKcal)} kcal over daily budget`
                : `${remainingKcal.toLocaleString()} kcal left`}{' '}
              • Target {targetKcal.toLocaleString()} kcal
            </Text>
          </View>

          {/* Segmented Pill Tabs: Overview | Meals | Insights */}
          <View style={styles.tabBar}>
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[styles.tabPill, isActive && styles.tabPillActive]}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.75}
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
              <OverviewBento
                date={selectedDate}
                user={user}
                daySummary={daySummary}
                activeDays={consistency.activeDays}
                matrixFlags={consistency.matrixFlags}
                onQuickLog={(m) => handleOpenAddFood(m)}
                onOpenProfile={() => (user ? setProfileVisible(true) : setAuthVisible(true))}
                onSwitchToMeals={() => setActiveTab('meals')}
              />

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

              <WaterTracker date={selectedDate} userEmail={user?.email} />

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

          <View style={{ height: 64 }} />
        </ScrollView>
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
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
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
    letterSpacing: 0.4,
  },
  scoreSection: {
    alignItems: 'center',
    paddingTop: SPACING.xs,
    paddingBottom: SPACING.md,
  },
  scoreSubtext: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 6,
    letterSpacing: 0.2,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  tabPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabPillActive: {
    backgroundColor: 'rgba(18, 24, 34, 0.85)',
    borderColor: COLORS.surfaceBorderBright,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '400',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.text,
    fontWeight: '500',
  },
  mealsSection: {
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1.4,
    paddingHorizontal: SPACING.lg,
    marginBottom: 4,
  },
});
