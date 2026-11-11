import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function MuscleLogo({
  size = 44,
  iconSize,
  glow = true,
  style,
}) {
  const finalIconSize = iconSize || size * 0.56;

  return (
    <View
      style={[
        styles.outerGlow,
        {
          width: size,
          height: size,
          borderRadius: size * 0.34,
        },
        glow && styles.glowStyle,
        style,
      ]}
    >
      <View
        style={[
          styles.innerBadge,
          {
            width: size - 3,
            height: size - 3,
            borderRadius: (size - 3) * 0.34,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="arm-flex"
          size={finalIconSize}
          color={COLORS.accent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerGlow: {
    backgroundColor: 'rgba(91, 181, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(91, 181, 255, 0.32)',
  },
  glowStyle: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  innerBadge: {
    backgroundColor: '#0A0F18',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
