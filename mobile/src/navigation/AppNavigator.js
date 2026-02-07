import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import AuthScreen from '../screens/AuthScreen';
import FounderHomeScreen from '../screens/FounderHomeScreen';
import TeamMemberHomeScreen from '../screens/TeamMemberHomeScreen';
import TasksScreen from '../screens/TasksScreen';
import MilestonesScreen from '../screens/MilestonesScreen';
import InvestorReadinessScreen from '../screens/InvestorReadinessScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import Loader from '../components/Loader';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Founder Tab Navigator
const FounderTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tasks':
              iconName = focused ? 'checkmark-done' : 'checkmark-done-outline';
              break;
            case 'Milestones':
              iconName = focused ? 'flag' : 'flag-outline';
              break;
            case 'Readiness':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
              break;
            case 'Insights':
              iconName = focused ? 'bulb' : 'bulb-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        headerStyle: {
          backgroundColor: '#2563EB',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={FounderHomeScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Milestones" component={MilestonesScreen} />
      <Tab.Screen 
        name="Readiness" 
        component={InvestorReadinessScreen}
        options={{ title: 'Investor Readiness' }}
      />
      <Tab.Screen name="Insights" component={InsightsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Team Member Tab Navigator
const TeamMemberTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Tasks':
              iconName = focused ? 'checkmark-done' : 'checkmark-done-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#6B7280',
        headerStyle: {
          backgroundColor: '#2563EB',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={TeamMemberHomeScreen}
        options={{ title: 'My Tasks' }}
      />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          user.role === 'founder' ? (
            <Stack.Screen name="FounderApp" component={FounderTabs} />
          ) : (
            <Stack.Screen name="TeamMemberApp" component={TeamMemberTabs} />
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
