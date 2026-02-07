import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set a timeout to ensure loading doesn't hang
    const timeout = setTimeout(() => {
      console.log('Loading timeout - forcing loading to false');
      setLoading(false);
    }, 3000); // 3 second timeout

    // Clear any old/invalid tokens on app start
    loadStoredUser().finally(() => {
      clearTimeout(timeout);
    });

    return () => clearTimeout(timeout);
  }, []);

  const loadStoredUser = async () => {
    try {
      console.log('Loading stored user...');
      const userData = await AsyncStorage.getItem('userData');
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (userData && userToken) {
        console.log('Found stored user data');
        const parsedUser = JSON.parse(userData);
        
        // Validate token format (JWT should have 3 parts separated by dots)
        const tokenParts = userToken.split('.');
        if (tokenParts.length !== 3) {
          console.log('Invalid token format detected, clearing...');
          await AsyncStorage.removeItem('userData');
          await AsyncStorage.removeItem('userToken');
          setUser(null);
        } else {
          setUser(parsedUser);
        }
      } else {
        console.log('No stored user data found');
      }
    } catch (error) {
      console.error('Error loading user:', error);
      // Clear potentially corrupted data
      try {
        await AsyncStorage.removeItem('userData');
        await AsyncStorage.removeItem('userToken');
      } catch (clearError) {
        console.error('Error clearing storage:', clearError);
      }
    } finally {
      console.log('Setting loading to false');
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login...');
      const response = await authAPI.login(email, password);
      const { token, user: userData } = response.data;
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      
      console.log('Login successful');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Login failed. Check if backend is running.' 
      };
    }
  };

  const signup = async (email, password, role, startupName) => {
    try {
      console.log('Attempting signup...');
      const response = await authAPI.signup(email, password, role, startupName);
      const { token, user: userData } = response.data;
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      
      console.log('Signup successful');
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error.message);
      return { 
        success: false, 
        error: error.response?.data?.error || error.message || 'Signup failed. Check if backend is running.' 
      };
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
