import React, { useState, useEffect, useCallback } from 'react';
import {
  StatusBar,
  ScrollView,
  RefreshControl,
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  Platform,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from './src/constants/theme';
import { storage } from './src/utils/storage';
import { api } from './src/api/client';

// Components
import Header from './src/components/Header';
import CalorieRing from './src/components/CalorieRing';
import MacroCard from './src/components/MacroCard';
import WaterTracker from './src/components/WaterTracker';
import MealCard from './src/components/MealCard';
import FoodSearchModal from './src/components/FoodSearchModal';
import WeeklyProgressModal from './src/components/WeeklyProgressModal';
import ProfileModal from './src/components/ProfileModal';
import AuthModal from './src/components/AuthModal';

export default function App() {
  return (
    <SafeAreaProvider>
      <MainApp />
    </SafeAreaProvider>
  );
}

function MainApp() {
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [daySummary, setDaySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [authVisible, setAuthVisible] = useState(false);
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [weeklyVisible, setWeeklyVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);

  // Initial load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setLoading(true);
    try {
      const savedUser = await storage.getUser();
      const token = await storage.getToken();

      if (token && savedUser) {
        setUser(savedUser);
        loadDayData(selectedDate);
      } else {
        setAuthVisible(true);
      }
    } catch (e) {
      console.warn('CheckAuth error:', e);
      setAuthVisible(true);
    } finally {
      setLoading(false);
    }
  };

  const loadDayData = async (date) => {
    try {
      const summary = await api.getMealsForDay(date);
      setDaySummary(summary);
    } catch (e) {
      console.warn('Failed to load day data:', e);
    }
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDayData(selectedDate);
    setRefreshing(false);
  }, [selectedDate]);

  // Date Navigators
  const changeDate = (days) => {
    const current = new Date(selectedDate + 'T00:00:00');
    current.setDate(current.getDate() + days);
    const newDateStr = current.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
    loadDayData(newDateStr);
  };

  const handlePrevDate = () => changeDate(-1);
  const handleNextDate = () => changeDate(1);
  const handleToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    loadDayData(today);
  };

  // Actions
  const handleOpenAddFood = (mealType) => {
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
    setProfileVisible(false);
    setAuthVisible(true);
  };

  // Filter meals for day
  const meals = daySummary?.meals || [];
  const mealTotals = daySummary?.meal_totals || {};

  const getMeal = (type) => meals.find((m) => m.meal_type === type);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header Bar */}
      <Header
        date={selectedDate}
        onPrevDate={handlePrevDate}
        onNextDate={handleNextDate}
        onToday={handleToday}
        onOpenWeekly={() => setWeeklyVisible(true)}
        onOpenProfile={() => setProfileVisible(true)}
        user={user}
      />

      {loading && !daySummary ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
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
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {/* Calorie Target Hero Widget */}
          <CalorieRing
            target={daySummary?.target_calories || user?.target_calories || 2000}
            consumed={daySummary?.total_calories || 0}
            remaining={daySummary?.remaining_calories ?? (user?.target_calories || 2000)}
          />

          {/* Macro Breakdown Capsules */}
          <MacroCard
            targetProtein={daySummary?.target_protein || user?.target_protein || 150}
            targetCarbs={daySummary?.target_carbs || user?.target_carbs || 225}
            targetFat={daySummary?.target_fat || user?.target_fat || 55.6}
            consumedProtein={daySummary?.total_protein || 0}
            consumedCarbs={daySummary?.total_carbs || 0}
            consumedFat={daySummary?.total_fat || 0}
          />

          {/* Daily Hydration Cockpit */}
          <WaterTracker date={selectedDate} />

          {/* 4 Fuel Sections */}
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

          <View style={{ height: 60 }} />
        </ScrollView>
      )}

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
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  mealsSection: {
    marginTop: SPACING.md,
  },
  sectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginHorizontal: SPACING.lg,
    marginBottom: 2,
  },
});
