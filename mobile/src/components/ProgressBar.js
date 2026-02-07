import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBar = ({ progress = 0, color = '#2563EB', height = 8, showPercentage = false }) => {
  const percentage = Math.min(Math.max(progress, 0), 100);

  return (
    <View>
      <View style={[styles.container, { height }]}>
        <View
          style={[
            styles.progress,
            {
              width: `${percentage}%`,
              backgroundColor: color,
              height,
            },
          ]}
        />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>{Math.round(percentage)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'right',
  },
});

export default ProgressBar;
