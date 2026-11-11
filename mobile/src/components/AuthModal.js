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
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { api } from '../api/client';
import { storage } from '../utils/storage';
import MuscleLogo from './MuscleLogo';

export default function AuthModal({ visible, onAuthSuccess }) {
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

  const handleSubmit = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required', 'Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      let res;
      if (mode === 'login') {
        res = await api.login({ email: email.trim(), password });
      } else {
        res = await api.register({
          name: name.trim() || 'User',
          email: email.trim(),
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
      Alert.alert('Authentication Failed', e.message || 'Check your credentials and try again.');
    } finally {
      setLoading(false);
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

      // Seed a couple of initial sample meals in demo mode
      const today = new Date().toISOString().split('T')[0];
      await api.logMeal({
        meal_type: 'breakfast',
        date: today,
        items: [
          { food_id: 2, quantity: 100 }, // 2 eggs
          { food_id: 3, quantity: 60 },  // oats
        ],
      });

      onAuthSuccess(demoUser);
    } catch (e) {
      console.warn('Demo login error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.cardContainer}>
          {/* Header & Logo */}
          <View style={styles.logoRow}>
            <MuscleLogo size={56} iconSize={30} style={{ marginBottom: SPACING.sm }} />
            <Text style={styles.appTitle}>CalCalc</Text>
            <Text style={styles.appSubtitle}>
              Elite Body Fuel & Nutrition Engine • Zero Clutter
            </Text>
          </View>

          {/* Mode Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, mode === 'login' && styles.tabBtnActive]}
              onPress={() => setMode('login')}
            >
              <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, mode === 'register' && styles.tabBtnActive]}
              onPress={() => setMode('register')}
            >
              <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            {mode === 'register' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your Name"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {mode === 'register' && (
              <>
                <View style={styles.statsRow}>
                  <View style={styles.statsCol}>
                    <Text style={styles.label}>Age</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={age}
                      onChangeText={setAge}
                      maxLength={3}
                    />
                  </View>

                  <View style={styles.statsCol}>
                    <Text style={styles.label}>Height (cm)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={height}
                      onChangeText={setHeight}
                      maxLength={3}
                    />
                  </View>

                  <View style={styles.statsCol}>
                    <Text style={styles.label}>Weight (kg)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      value={weight}
                      onChangeText={setWeight}
                      maxLength={3}
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Goal</Text>
                  <View style={styles.goalRow}>
                    {[
                      { id: 'lose', label: 'Lose' },
                      { id: 'maintain', label: 'Maintain' },
                      { id: 'gain', label: 'Gain' },
                    ].map((g) => (
                      <TouchableOpacity
                        key={g.id}
                        style={[styles.goalBtn, goal === g.id && styles.goalBtnActive]}
                        onPress={() => setGoal(g.id)}
                      >
                        <Text
                          style={[
                            styles.goalBtnText,
                            goal === g.id && styles.goalBtnTextActive,
                          ]}
                        >
                          {g.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </>
            )}

            {/* Primary Action Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.submitBtnText}>
                  {mode === 'login' ? 'Sign In' : 'Create & Calculate'}
                </Text>
              )}
            </TouchableOpacity>

            {/* Quick Demo Mode */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR QUICK TEST</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.demoBtn}
              onPress={handleDemoMode}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Ionicons name="sparkles" size={16} color={COLORS.primary} />
              <Text style={styles.demoBtnText}>One-Click Instant Preview (Guest)</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 15, 0.92)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  cardContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    maxHeight: '88%',
  },
  logoRow: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryAlpha,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  appSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: SPACING.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: 3,
    marginBottom: SPACING.lg,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  tabBtnActive: {
    backgroundColor: COLORS.surface,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabTextActive: {
    color: COLORS.text,
    fontWeight: '700',
  },
  formScroll: {
    maxHeight: 360,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  statsCol: {
    flex: 1,
  },
  goalRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  goalBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  goalBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  goalBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  goalBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginVertical: SPACING.md,
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
    letterSpacing: 0.5,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryAlpha,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: SPACING.md,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

