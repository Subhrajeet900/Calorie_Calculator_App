import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import {
  ACTIVITY_LEVELS,
  GOALS,
  calculateAll,
} from '../utils/calculator';
import { api, setApiBaseUrl, getApiBaseUrl } from '../api/client';

export default function ProfileModal({
  visible,
  onClose,
  user,
  onProfileUpdated,
  onLogout,
}) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('male');
  const [age, setAge] = useState('25');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [activityLevel, setActivityLevel] = useState('moderate');
  const [goal, setGoal] = useState('maintain');

  const [serverUrl, setServerUrl] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setGender(user.gender || 'male');
      setAge(String(user.age || 25));
      setHeight(String(user.height || 175));
      setWeight(String(user.weight || 70));
      setActivityLevel(user.activity_level || 'moderate');
      setGoal(user.goal || 'maintain');
    }
    loadServerUrl();
  }, [user, visible]);

  const loadServerUrl = async () => {
    const url = await getApiBaseUrl();
    setServerUrl(url.replace(/\/api$/, ''));
  };

  // Live recalculate with Mifflin-St Jeor equation
  const preview = calculateAll({
    age: Number(age) || 25,
    gender,
    height: Number(height) || 175,
    weight: Number(weight) || 70,
    activityLevel,
    goal,
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      if (serverUrl.trim()) {
        await setApiBaseUrl(serverUrl.trim());
      }

      const updated = await api.updateProfile({
        name: name.trim(),
        gender,
        age: Number(age) || 25,
        height: Number(height) || 175,
        weight: Number(weight) || 70,
        activity_level: activityLevel,
        goal,
      });

      if (onProfileUpdated) onProfileUpdated(updated);
      onClose();
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetTitle}>Profile & Goals</Text>
              <Text style={styles.sheetSubtitle}>Mifflin-St Jeor Engine Setup</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Ionicons name="close" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Live Calculation Results Card */}
            <View style={styles.calcPreviewCard}>
              <View style={styles.calcTopRow}>
                <View>
                  <Text style={styles.calcPreviewLabel}>DAILY TARGET</Text>
                  <Text style={styles.calcTargetValue}>
                    {preview.targetCalories} <Text style={styles.calcTargetUnit}>kcal / day</Text>
                  </Text>
                </View>
                <View style={styles.bmrPill}>
                  <Text style={styles.bmrPillText}>BMR: {preview.bmr}</Text>
                  <Text style={styles.bmrPillSub}>TDEE: {preview.tdee}</Text>
                </View>
              </View>

              {/* Target Macro Split */}
              <View style={styles.macroPillsRow}>
                <View style={[styles.macroPill, { borderColor: COLORS.protein }]}>
                  <Text style={[styles.macroPillVal, { color: COLORS.protein }]}>
                    {preview.targetProtein}g
                  </Text>
                  <Text style={styles.macroPillLbl}>Protein (30%)</Text>
                </View>

                <View style={[styles.macroPill, { borderColor: COLORS.carbs }]}>
                  <Text style={[styles.macroPillVal, { color: COLORS.carbs }]}>
                    {preview.targetCarbs}g
                  </Text>
                  <Text style={styles.macroPillLbl}>Carbs (45%)</Text>
                </View>

                <View style={[styles.macroPill, { borderColor: COLORS.fat }]}>
                  <Text style={[styles.macroPillVal, { color: COLORS.fat }]}>
                    {preview.targetFat}g
                  </Text>
                  <Text style={styles.macroPillLbl}>Fat (25%)</Text>
                </View>
              </View>
            </View>

            {/* Personal Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Physical Stats</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Your Name"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              {/* Gender Toggle */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Biological Sex (for BMR Formula)</Text>
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, gender === 'male' && styles.toggleBtnActive]}
                    onPress={() => setGender('male')}
                  >
                    <Ionicons
                      name="male"
                      size={16}
                      color={gender === 'male' ? '#FFFFFF' : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.toggleBtnText,
                        gender === 'male' && styles.toggleBtnTextActive,
                      ]}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.toggleBtn, gender === 'female' && styles.toggleBtnActive]}
                    onPress={() => setGender('female')}
                  >
                    <Ionicons
                      name="female"
                      size={16}
                      color={gender === 'female' ? '#FFFFFF' : COLORS.textSecondary}
                    />
                    <Text
                      style={[
                        styles.toggleBtnText,
                        gender === 'female' && styles.toggleBtnTextActive,
                      ]}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Age, Height, Weight Row */}
              <View style={styles.triRow}>
                <View style={styles.triCol}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                    maxLength={3}
                  />
                </View>

                <View style={styles.triCol}>
                  <Text style={styles.label}>Height (cm)</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={height}
                    onChangeText={setHeight}
                    maxLength={3}
                  />
                </View>

                <View style={styles.triCol}>
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
            </View>

            {/* Activity Level */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Activity Level</Text>
              <View style={styles.optionsList}>
                {ACTIVITY_LEVELS.map((act) => (
                  <TouchableOpacity
                    key={act.id}
                    style={[
                      styles.optionCard,
                      activityLevel === act.id && styles.optionCardActive,
                    ]}
                    onPress={() => setActivityLevel(act.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionInfo}>
                      <Text
                        style={[
                          styles.optionTitle,
                          activityLevel === act.id && styles.optionTitleActive,
                        ]}
                      >
                        {act.label}
                      </Text>
                      <Text style={styles.optionDesc}>{act.desc}</Text>
                    </View>
                    <Text
                      style={[
                        styles.optionFactor,
                        activityLevel === act.id && styles.optionFactorActive,
                      ]}
                    >
                      x{act.factor}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Goal Planner */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Goal Planner</Text>
              <View style={styles.optionsList}>
                {GOALS.map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.optionCard, goal === g.id && styles.optionCardActive]}
                    onPress={() => setGoal(g.id)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionInfo}>
                      <Text
                        style={[styles.optionTitle, goal === g.id && styles.optionTitleActive]}
                      >
                        {g.label}
                      </Text>
                      <Text style={styles.optionDesc}>{g.desc}</Text>
                    </View>
                    <Text
                      style={[
                        styles.optionDelta,
                        g.delta > 0 && { color: COLORS.protein },
                        g.delta < 0 && { color: COLORS.primary },
                      ]}
                    >
                      {g.delta > 0 ? `+${g.delta}` : g.delta === 0 ? '±0' : g.delta} kcal
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Backend Server URL Setting */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>API Server Connection</Text>
              <Text style={styles.sectionDesc}>
                Connect to your local Go backend service.
              </Text>
              <TextInput
                style={styles.input}
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="http://localhost:8080"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
              />
            </View>

            {/* Actions */}
            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save Profile & Targets</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={onLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={16} color={COLORS.danger} />
              <Text style={styles.logoutBtnText}>Log Out / Switch Account</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </View>
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
  scrollContent: {
    padding: SPACING.lg,
  },
  calcPreviewCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    marginBottom: SPACING.lg,
  },
  calcTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  calcPreviewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 0.8,
  },
  calcTargetValue: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
  },
  calcTargetUnit: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  bmrPill: {
    alignItems: 'flex-end',
  },
  bmrPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  bmrPillSub: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  macroPillsRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  macroPill: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  macroPillVal: {
    fontSize: 13,
    fontWeight: '700',
  },
  macroPillLbl: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  sectionDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.sm,
  },
  formGroup: {
    marginBottom: SPACING.sm,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 42,
    color: COLORS.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceLight,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toggleBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  triRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  triCol: {
    flex: 1,
  },
  optionsList: {
    gap: SPACING.xs,
  },
  optionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceLight,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  optionCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryAlpha,
  },
  optionInfo: {
    flex: 1,
    paddingRight: SPACING.sm,
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  optionTitleActive: {
    color: COLORS.primary,
  },
  optionDesc: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  optionFactor: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  optionFactorActive: {
    color: COLORS.primary,
  },
  optionDelta: {
    fontSize: 12,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.md,
    marginTop: SPACING.sm,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.danger,
  },
});

