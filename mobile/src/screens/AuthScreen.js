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
          <Ionicons name="rocket" size={64} color="#2563EB" />
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
    backgroundColor: '#111827',
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
    color: '#F3F4F6',
    marginTop: 16,
  },
  tagline: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
   textAlign: 'center',
  },
  form: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#374151',
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#F3F4F6',
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#1E3A8A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  toggleLink: {
    color: '#60A5FA',
    fontWeight: '600',
  },
  demoContainer: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#1F2937',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#60A5FA',
  },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#60A5FA',
    marginBottom: 4,
  },
  demoText: {
    fontSize: 12,
    color: '#93C5FD',
  },
});

export default AuthScreen;
