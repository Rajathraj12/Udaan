import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const Badge = ({ children, variant = 'default', style }) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'success':
        return styles.success;
      case 'warning':
        return styles.warning;
      case 'danger':
        return styles.danger;
      case 'info':
        return styles.info;
      default:
        return styles.default;
    }
  };

  return (
    <View style={[styles.badge, getVariantStyle(), style]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textLight,
  },
  default: {
    backgroundColor: colors.textMuted,
  },
  success: {
    backgroundColor: colors.neonGreen,
  },
  warning: {
    backgroundColor: colors.warning,
  },
  danger: {
    backgroundColor: colors.error,
  },
  info: {
    backgroundColor: colors.neonBlue,
  },
});

export default Badge;
