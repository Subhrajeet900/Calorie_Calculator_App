import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import MuscleLogo from './MuscleLogo';
import { DuskMeshBackdrop } from './VisualWidgets';

const SCREEN_HEIGHT = Dimensions.get('window').height;

function getGreeting() {
  const hr = new Date().getHours();
  if (hr < 12) return 'Good morning';
  if (hr < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function WelcomeCover({
  visible,
  user,
  fuelScore = 86,
  consumedKcal = 0,
  targetKcal = 2000,
  activeDays = 1,
  onDismiss,
}) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateY.setValue(0);
    }
  }, [visible]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -7,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const triggerOpen = () => {
    Animated.timing(translateY, {
      toValue: -SCREEN_HEIGHT - 40,
      duration: 320,
      useNativeDriver: true,
    }).start(() => {
      if (onDismiss) onDismiss();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        gesture.dy < -8 && Math.abs(gesture.dy) > Math.abs(gesture.dx),
      onPanResponderMove: (_, gesture) => {
        if (gesture.dy < 0) {
          translateY.setValue(gesture.dy);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dy < -75 || gesture.vy < -0.55) {
          triggerOpen();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            tension: 70,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  if (!visible) return null;

  const firstName = user?.name ? user.name.trim().split(' ')[0] : null;
  const overlayOpacity = translateY.interpolate({
    inputRange: [-SCREEN_HEIGHT * 0.75, 0],
    outputRange: [0.15, 1],
    extrapolate: 'clamp',
  });

  const remaining = Math.max(0, Math.round(targetKcal - consumedKcal));
  const pct = Math.min(100, Math.round((consumedKcal / Math.max(1, targetKcal)) * 100));

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.coverContainer,
        {
          transform: [{ translateY }],
          opacity: overlayOpacity,
        },
      ]}
    >
      {/* Top Curved Dusk Violet -> Sunset Peach Hero Section */}
      <View
        style={[
          styles.heroCard,
          { paddingTop: Math.max(insets.top + 16, 44) },
        ]}
      >
        <DuskMeshBackdrop />

        <View style={styles.heroTopBar}>
          <Text style={styles.greetingText}>
            {firstName ? `Hello, ${firstName}` : `${getGreeting()}, Athlete`}
          </Text>
          <View style={styles.brandCircle}>
            <MuscleLogo size={38} glow={false} />
          </View>
        </View>

        <View style={styles.heroCenter}>
          <Text style={styles.heroEyebrow}>
            {user ? 'Daily Balance (kcal)' : 'CalCalc Body Fuel'}
          </Text>
          <Text style={styles.heroBigValue}>
            {user ? remaining.toLocaleString() : '129+ Foods'}
          </Text>
          <View style={styles.heroPill}>
            <Text style={styles.heroPillText}>
              {user ? `${pct}% logged • Score ${fuelScore}` : 'Smart Macro & Unit Engine'}
            </Text>
          </View>
        </View>
      </View>

      {/* Pitch-Black Lower Section with Charcoal Cards & Swipe-Up Lime CTA */}
      <View
        style={[
          styles.lowerBody,
          { paddingBottom: Math.max(insets.bottom + 24, 34) },
        ]}
      >
        <View style={styles.telemetryCards}>
          <View style={styles.infoRowCard}>
            <View style={styles.iconCircleDark}>
              <Ionicons name="flame-outline" size={20} color={COLORS.text} />
            </View>
            <View style={styles.infoRowMid}>
              <Text style={styles.infoRowTitle}>Daily Calorie Intake</Text>
              <Text style={styles.infoRowSub}>
                {Math.round(consumedKcal)} kcal{' '}
                <Text style={{ color: COLORS.success }}>• {pct}%</Text>
              </Text>
            </View>
            <View style={styles.outlineTag}>
              <Text style={styles.outlineTagText}>TODAY</Text>
            </View>
          </View>

          <View style={styles.infoRowCard}>
            <View style={styles.iconCircleDark}>
              <Ionicons name="trophy-outline" size={20} color={COLORS.primary} />
            </View>
            <View style={styles.infoRowMid}>
              <Text style={styles.infoRowTitle}>Active Consistency</Text>
              <Text style={styles.infoRowSub}>
                {activeDays} active days{' '}
                <Text style={{ color: COLORS.success }}>• Synced</Text>
              </Text>
            </View>
            <View style={styles.outlineTag}>
              <Text style={styles.outlineTagText}>28D</Text>
            </View>
          </View>
        </View>

        {/* Bottom Interactive Scroll-Up Handle */}
        <TouchableOpacity
          style={styles.swipePromptArea}
          onPress={triggerOpen}
          activeOpacity={0.85}
        >
          <Animated.View
            style={[
              styles.chevronsWrap,
              { transform: [{ translateY: bounceAnim }] },
            ]}
          >
            <Ionicons
              name="chevron-up"
              size={18}
              color="rgba(235, 248, 138, 0.5)"
              style={{ marginBottom: -8 }}
            />
            <Ionicons name="chevron-up" size={22} color={COLORS.primary} />
          </Animated.View>

          <View style={styles.limeStartPill}>
            <Text style={styles.limeStartText}>
              {user ? 'Scroll Up to Start App' : 'Scroll Up to Sign In'}
            </Text>
            <Ionicons name="arrow-up" size={16} color={COLORS.primaryText} />
          </View>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  coverContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  heroCard: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
    paddingHorizontal: SPACING.xl,
    paddingBottom: 42,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 34,
  },
  greetingText: {
    fontSize: 17,
    fontWeight: '400',
    color: COLORS.text,
  },
  brandCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroCenter: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  heroEyebrow: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.72)',
    marginBottom: 8,
  },
  heroBigValue: {
    fontSize: 44,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -1,
  },
  heroPill: {
    marginTop: SPACING.md,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  heroPillText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text,
  },
  lowerBody: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    justifyContent: 'space-between',
  },
  telemetryCards: {
    gap: SPACING.md,
  },
  infoRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.md + 2,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    gap: SPACING.md,
  },
  iconCircleDark: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRowMid: {
    flex: 1,
  },
  infoRowTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text,
  },
  infoRowSub: {
    fontSize: 12.5,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  outlineTag: {
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
  },
  outlineTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  swipePromptArea: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  chevronsWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  limeStartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 15,
    borderRadius: RADIUS.full,
    width: '100%',
  },
  limeStartText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primaryText,
  },
});
