import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function MuscleLogo({
  size = 36,
  iconSize = 20,
  glow = true,
  style,
}) {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.32,
        },
        glow && styles.glowStyle,
        style,
      ]}
    >
      <View
        style={[
          styles.innerBadge,
          {
            width: size - 4,
            height: size - 4,
            borderRadius: (size - 4) * 0.32,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="arm-flex"
          size={iconSize}
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  innerBadge: {
    backgroundColor: '#0F1626',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
