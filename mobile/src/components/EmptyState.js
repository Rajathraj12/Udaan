import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';

const EmptyState = ({ icon = 'folder-open-outline', message = 'No data available' }) => {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={64} color={colors.textGray} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textGray,
    textAlign: 'center',
  },
});

export default EmptyState;
