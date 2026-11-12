import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { api } from '../api/client';
import { storage } from '../utils/storage';
import { getLocalDateStr } from '../utils/calculator';
import { DEFAULT_FOODS } from '../constants/defaultFoods';
import MuscleLogo from './MuscleLogo';
import { DuskMeshBackdrop } from './VisualWidgets';

export default function AuthModal({ visible, onAuthSuccess }) {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Initial stats for register
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [goal, setGoal] = useState('maintain');

  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = async () => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      Alert.alert('Required', 'Please enter your email address and password.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (mode === 'register' && password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setStatusMsg('Signing in...');
    const slowTimer = setTimeout(() => {
      setStatusMsg('Waking cloud server (first load may take ~30-50s)...');
    }, 3500);

    try {
      let res;
      if (mode === 'login') {
        res = await api.login({ email: cleanEmail, password });
      } else {
        setStatusMsg('Creating account...');
        res = await api.register({
          name: name.trim() || 'User',
          email: cleanEmail,
          password,
          gender,
          age: Number(age) || 25,
          height: Number(height) || 175,
          weight: Number(weight) || 70,
          activity_level: 'moderate',
          goal,
        });
      }

      if (res?.token) {
        await storage.saveToken(res.token);
      }
      if (res?.user) {
        await storage.saveUser(res.user);
      }

      onAuthSuccess(res.user);
    } catch (e) {
      Alert.alert(
        'Authentication Failed',
        e.message || 'Check your email & password and try again.'
      );
    } finally {
      clearTimeout(slowTimer);
      setLoading(false);
      setStatusMsg('');
    }
  };

  const handleDemoMode = async () => {
    setLoading(true);
    try {
      const demoUser = {
        id: 1,
        name: 'Alex Mercer',
        email: 'alex@example.com',
        gender: 'male',
        age: 26,
        height: 178,
        weight: 75,
        activity_level: 'moderate',
        goal: 'maintain',
        bmr: 1740,
        tdee: 2697,
        target_calories: 2200,
        target_protein: 165,
        target_carbs: 247,
        target_fat: 61,
      };

      await storage.saveToken('mock-demo-token');
      await storage.saveUser(demoUser);

      const today = getLocalDateStr();
      const existingMeals = await storage.getMealsForDate(demoUser.email, today);
      if (existingMeals.length === 0) {
        const wholeEgg = DEFAULT_FOODS.find((f) => f.name === 'Whole Egg');
        const oats = DEFAULT_FOODS.find((f) => f.name.includes('Oatmeal'));
        await api.logMeal({
          meal_type: 'breakfast',
          date: today,
          items: [
            { food_id: wholeEgg?.id || 13, food_name: 'Whole Egg', food: wholeEgg, quantity: 100 },
            { food_id: oats?.id || 32, food_name: 'Oatmeal / Rolled Oats', food: oats, quantity: 60 },
          ],
        });
      }

      onAuthSuccess(demoUser);
    } catch (e) {
      console.warn('Demo login error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Top Curved Dusk Violet -> Sunset Peach Mesh Hero Card */}
        <View
          style={[
            styles.heroCard,
            { paddingTop: Math.max(insets.top + 14, 38) },
          ]}
        >
          <DuskMeshBackdrop />

          <View style={styles.heroHeaderRow}>
            <View style={styles.brandRow}>
              <MuscleLogo size={40} glow={false} />
              <View>
                <Text style={styles.brandName}>CalCalc</Text>
                <Text style={styles.brandTag}>Body Fuel Wallet</Text>
              </View>
            </View>

            <View style={styles.frostedBadge}>
              <Text style={styles.frostedBadgeText}>129+ Foods</Text>
            </View>
          </View>

          <View style={styles.heroCenter}>
            <Text style={styles.heroTitle}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={styles.heroSub}>
              {mode === 'login'
                ? 'Sign in to access your lifetime nutrition & meal history'
                : 'Set up your profile & custom calorie budget in seconds'}
            </Text>
          </View>
        </View>

        {/* Dark Body Section */}
        <ScrollView
          style={styles.bodyScroll}
          contentContainerStyle={[
            styles.bodyContent,
            { paddingBottom: Math.max(insets.bottom + 24, 32) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Exact Outlined Segmented Tab Pill with Butter-Lime Active Fill */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, mode === 'login' && styles.tabBtnActive]}
              onPress={() => setMode('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, mode === 'register' && styles.tabBtnActive]}
              onPress={() => setMode('register')}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Charcoal Input Cards */}
          {mode === 'register' && (
            <View style={styles.inputCard}>
              <View style={styles.inputIconCircle}>
                <Ionicons name="person-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.inputCol}>
                <Text style={styles.inputLabel}>FULL NAME</Text>
                <TextInput
                  style={styles.inputField}
                  placeholder="Alex Mercer"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>
          )}

          <View style={styles.inputCard}>
            <View style={styles.inputIconCircle}>
              <Ionicons name="mail-outline" size={18} color={COLORS.text} />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.inputField}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputCard}>
            <View style={styles.inputIconCircle}>
              <Ionicons name="lock-closed-outline" size={18} color={COLORS.text} />
            </View>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.inputField}
                placeholder={mode === 'register' ? 'Minimum 6 characters' : '••••••••'}
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          {mode === 'register' && (
            <>
              {/* Gender Toggle Pills */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>BIOLOGICAL SEX</Text>
                <View style={styles.pillRow}>
                  {[
                    { id: 'male', label: 'Male', icon: 'male' },
                    { id: 'female', label: 'Female', icon: 'female' },
                  ].map((g) => {
                    const active = gender === g.id;
                    return (
                      <TouchableOpacity
                        key={g.id}
                        style={[styles.choicePill, active && styles.choicePillActive]}
                        onPress={() => setGender(g.id)}
                      >
                        <Ionicons
                          name={g.icon}
                          size={15}
                          color={active ? COLORS.primaryText : COLORS.textSecondary}
                        />
                        <Text
                          style={[
                            styles.choicePillText,
                            active && styles.choicePillTextActive,
                          ]}
                        >
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Age, Height, Weight Bento Trio */}
              <View style={styles.statsRow}>
                <View style={styles.miniInputCard}>
                  <Text style={styles.inputLabel}>AGE</Text>
                  <TextInput
                    style={styles.miniInputVal}
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                    maxLength={3}
                  />
                </View>

                <View style={styles.miniInputCard}>
                  <Text style={styles.inputLabel}>HEIGHT (CM)</Text>
                  <TextInput
                    style={styles.miniInputVal}
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                    maxLength={3}
                  />
                </View>

                <View style={styles.miniInputCard}>
                  <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
                  <TextInput
                    style={styles.miniInputVal}
                    keyboardType="numeric"
                    value={weight}
                    onChangeText={setWeight}
                    maxLength={3}
                  />
                </View>
              </View>

              {/* Goal Selector Pills */}
              <View style={styles.sectionBlock}>
                <Text style={styles.sectionLabel}>TARGET GOAL</Text>
                <View style={styles.pillRow}>
                  {[
                    { id: 'lose', label: 'Lose Fat' },
                    { id: 'maintain', label: 'Maintain' },
                    { id: 'gain', label: 'Build Muscle' },
                  ].map((g) => {
                    const active = goal === g.id;
                    return (
                      <TouchableOpacity
                        key={g.id}
                        style={[styles.choicePill, active && styles.choicePillActive]}
                        onPress={() => setGoal(g.id)}
                      >
                        <Text
                          style={[
                            styles.choicePillText,
                            active && styles.choicePillTextActive,
                          ]}
                        >
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </>
          )}

          {/* Crisp Pure White Primary Action Pill (Matching + White Button in Reference) */}
          <TouchableOpacity
            style={styles.whiteCtaBtn}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator size="small" color={COLORS.ctaWhiteText} />
                <Text style={styles.whiteCtaText}>Please wait...</Text>
              </View>
            ) : (
              <>
                <Text style={styles.whiteCtaText}>
                  {mode === 'login' ? 'Sign In to CalCalc' : 'Create & Start Tracking'}
                </Text>
                <Ionicons name="arrow-forward" size={18} color={COLORS.ctaWhiteText} />
              </>
            )}
          </TouchableOpacity>

          {!!statusMsg && (
            <Text style={styles.statusHint}>{statusMsg}</Text>
          )}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR QUICK PREVIEW</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.demoBtn}
            onPress={handleDemoMode}
            disabled={loading}
            activeOpacity={0.75}
          >
            <Ionicons name="sparkles" size={16} color={COLORS.primary} />
            <Text style={styles.demoBtnText}>One-Click Guest Preview</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  heroCard: {
    borderBottomLeftRadius: 34,
    borderBottomRightRadius: 34,
    overflow: 'hidden',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  brandTag: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.68)',
  },
  frostedBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  frostedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.text,
  },
  heroCenter: {
    paddingVertical: SPACING.xs,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -0.6,
  },
  heroSub: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.72)',
    marginTop: 4,
    lineHeight: 18,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
    backgroundColor: COLORS.backgroundElevated,
    padding: 4,
    marginBottom: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderRadius: RADIUS.full,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: 13.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.primaryText,
    fontWeight: '700',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: SPACING.md,
  },
  inputIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  inputField: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 2,
  },
  sectionBlock: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    paddingHorizontal: 4,
  },
  pillRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  choicePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  choicePillActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  choicePillText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  choicePillTextActive: {
    color: COLORS.primaryText,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  miniInputCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  miniInputVal: {
    fontSize: 18,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 4,
  },
  whiteCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.ctaWhite,
    borderRadius: RADIUS.full,
    height: 54,
    marginTop: 6,
  },
  whiteCtaText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.ctaWhiteText,
  },
  statusHint: {
    fontSize: 11.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.surfaceBorder,
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
  },
  demoBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
