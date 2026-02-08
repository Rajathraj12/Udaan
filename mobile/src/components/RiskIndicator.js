import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const RiskIndicator = ({ level = 'low' }) => {
  const getRiskColor = () => {
    switch (level.toLowerCase()) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.neonGreen;
      default:
        return colors.textMuted;
    }
  };

  const getRiskLabel = () => {
    return level.charAt(0).toUpperCase() + level.slice(1) + ' Risk';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: getRiskColor() }]} />
      <Text style={[styles.text, { color: getRiskColor() }]}>
        {getRiskLabel()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RiskIndicator;
