import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const ProgressBar = ({ progress = 0, color = colors.primaryBlue, height = 8, showPercentage = false }) => {
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 4,
  },
  percentage: {
    fontSize: 12,
    color: colors.textGray,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default ProgressBar;
