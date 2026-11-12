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
          borderRadius: size * 0.36,
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
            borderRadius: (size - 3) * 0.36,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="arm-flex"
          size={finalIconSize}
          color={COLORS.primary}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerGlow: {
    backgroundColor: 'rgba(235, 248, 138, 0.14)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(235, 248, 138, 0.35)',
  },
  glowStyle: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  innerBadge: {
    backgroundColor: '#13111C',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
