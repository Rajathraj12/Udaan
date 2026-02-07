import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RiskIndicator = ({ level = 'low' }) => {
  const getRiskColor = () => {
    switch (level.toLowerCase()) {
      case 'high':
        return '#EF4444';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
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
