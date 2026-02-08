import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import colors from '../theme/colors';

const Logo = ({ size = 64, showText = true, textSize = 24 }) => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={{ width: size, height: size, borderRadius: 8 }}
        resizeMode="contain"
      />
      
      {showText && (
        <Text style={[styles.logoText, { fontSize: textSize }]}>Udaan</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontWeight: 'bold',
    color: colors.primaryBlue,
    marginLeft: 8,
  },
});

export default Logo;
