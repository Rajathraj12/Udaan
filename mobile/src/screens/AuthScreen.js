import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import colors from '../theme/colors';

const AuthScreen = () => {
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    startupName: '',
    role: 'founder',
  });

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isLogin && !formData.startupName) {
      Alert.alert('Error', 'Please enter your startup name');
      return;
    }

    setLoading(true);
    let result;

    if (isLogin) {
      result = await login(formData.email, formData.password);
    } else {
      result = await signup(
        formData.email,
        formData.password,
        formData.role,
        formData.startupName
      );
    }

    setLoading(false);

    if (!result.success) {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo and App Name */}
        <View style={styles.header}>
          <Logo size={64} showText={false} />
          <Text style={styles.appName}>Udaan</Text>
          <Text style={styles.tagline}>Digital Infrastructure for Founders</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </Text>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => setFormData({ ...formData, password: text })}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Startup Name (Signup only) */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Ionicons name="briefcase-outline" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Startup Name"
                value={formData.startupName}
                onChangeText={(text) => setFormData({ ...formData, startupName: text })}
                editable={!loading}
              />
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Login' : 'Sign Up'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Login/Signup */}
          <TouchableOpacity
            onPress={() => setIsLogin(!isLogin)}
            disabled={loading}
            style={styles.toggleContainer}
          >
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <Text style={styles.toggleLink}>
                {isLogin ? 'Sign Up' : 'Login'}
              </Text>
            </Text>
          </TouchableOpacity>

          {/* Demo Credentials */}
          {isLogin && (
            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>Demo Account:</Text>
              <Text style={styles.demoText}>Email: founder@startup.com</Text>
              <Text style={styles.demoText}>Password: Founder123!</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.textLight,
    marginTop: 16,
  },
  tagline: {
    fontSize: 14,
    color: colors.textGray,
    marginTop: 8,
   textAlign: 'center',
  },
  form: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textLight,
  },
  button: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primaryBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#1E3A8A',
  },
  buttonText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: colors.textGray,
  },
  toggleLink: {
    color: colors.neonBlue,
    fontWeight: '600',
  },
  demoContainer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.neonBlue,
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neonBlue,
    marginBottom: 4,
  },
  demoText: {
    fontSize: 12,
    color: colors.textLight,
  },
});

export default AuthScreen;
