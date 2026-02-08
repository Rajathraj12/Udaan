import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const Loader = ({ size = 'large', color = colors.neonBlue }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Loader;
