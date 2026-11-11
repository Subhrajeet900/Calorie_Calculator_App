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
import { AmbientAurora, LaurelScore } from './VisualWidgets';

const SCREEN_HEIGHT = Dimensions.get('window').height;

function getGreeting() {
  const hr = new Date().getHours();
  if (hr < 12) return 'GOOD MORNING';
  if (hr < 17) return 'GOOD AFTERNOON';
  return 'GOOD EVENING';
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
          toValue: -8,
          duration: 950,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 950,
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

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.coverContainer,
        {
          paddingTop: Math.max(insets.top + 14, 34),
          paddingBottom: Math.max(insets.bottom + 24, 34),
          transform: [{ translateY }],
          opacity: overlayOpacity,
        },
      ]}
    >
      <AmbientAurora height={440} intensity={1.15} />

      {/* Top Subtle Brand Pill */}
      <View style={styles.topPill}>
        <View style={styles.liveDot} />
        <Text style={styles.topPillText}>CALCALC • BODY FUEL</Text>
      </View>

      {/* Center Hero Showcase */}
      <View style={styles.centerBlock}>
        <MuscleLogo size={68} />

        <Text style={styles.greetingLabel}>
          {getGreeting()}
          {firstName ? `, ${firstName.toUpperCase()}` : ''}
        </Text>

        <Text style={styles.heroHeadline}>
          {user ? 'Daily Readiness' : 'Precision Nutrition'}
        </Text>

        {user ? (
          <View style={styles.scoreWrap}>
            <LaurelScore score={fuelScore} label="Your Wellness & Fuel Score" />
          </View>
        ) : (
          <Text style={styles.guestSub}>
            Track calories, macros, and everyday meals with studio-grade clarity.
          </Text>
        )}

        {/* Obsidian Glass Quick Telemetry Strip */}
        <View style={styles.metricsStrip}>
          <View style={styles.metricPill}>
            <Text style={styles.metricLabel}>INTAKE</Text>
            <Text style={styles.metricVal}>{Math.round(consumedKcal)}</Text>
            <Text style={styles.metricUnit}>kcal</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricPill}>
            <Text style={styles.metricLabel}>TARGET</Text>
            <Text style={styles.metricVal}>{Math.round(targetKcal)}</Text>
            <Text style={styles.metricUnit}>kcal</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricPill}>
            <Text style={styles.metricLabel}>ACTIVE</Text>
            <Text style={[styles.metricVal, { color: COLORS.accent }]}>
              {activeDays}
            </Text>
            <Text style={styles.metricUnit}>days</Text>
          </View>
        </View>
      </View>

      {/* Bottom Swipe-Up Handle Prompt */}
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
            color="rgba(91, 181, 255, 0.55)"
            style={{ marginBottom: -8 }}
          />
          <Ionicons name="chevron-up" size={22} color={COLORS.accent} />
        </Animated.View>

        <View style={styles.swipePill}>
          <Text style={styles.swipePillText}>
            {user ? 'Scroll Up to Enter Dashboard' : 'Scroll Up to Get Started'}
          </Text>
        </View>

        <View style={styles.dragBar} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  coverContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 50,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  topPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(20, 26, 37, 0.72)',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: RADIUS.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.accent,
  },
  topPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
    letterSpacing: 1.4,
  },
  centerBlock: {
    width: '100%',
    alignItems: 'center',
  },
  greetingLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.accent,
    letterSpacing: 1.8,
    marginTop: SPACING.lg,
  },
  heroHeadline: {
    fontSize: 28,
    fontWeight: '500',
    color: COLORS.text,
    marginTop: 6,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  scoreWrap: {
    marginTop: SPACING.md,
  },
  guestSub: {
    fontSize: 13.5,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.sm,
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },
  metricsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(14, 18, 26, 0.9)',
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    width: '100%',
  },
  metricPill: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricVal: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.text,
  },
  metricUnit: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.surfaceBorder,
  },
  swipePromptArea: {
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    width: '100%',
  },
  chevronsWrap: {
    alignItems: 'center',
    marginBottom: 6,
  },
  swipePill: {
    backgroundColor: 'rgba(22, 28, 38, 0.9)',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorderBright,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: RADIUS.full,
  },
  swipePillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    letterSpacing: 0.3,
  },
  dragBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: SPACING.md,
  },
});
