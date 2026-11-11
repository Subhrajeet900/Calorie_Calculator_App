
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function MuscleLogo({
  size = 48,
  iconSize,
  glow = true,
  style,
}) {
  const finalIconSize = iconSize || size * 0.58;

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
        },
        glow && styles.glowStyle,
        style,
      ]}
    >
      <View
        style={[
          styles.innerBadge,
          {
            width: size * 0.88,
            height: size * 0.88,
            borderRadius: size * 0.23,
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
  container: {
    backgroundColor: 'rgba(0, 245, 155, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(0, 245, 155, 0.4)',
  },

  glowStyle: {
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },

  innerBadge: {
    backgroundColor: '#0F1626',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
