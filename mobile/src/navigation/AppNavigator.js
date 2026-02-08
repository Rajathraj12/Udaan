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
import colors from '../theme/colors';

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
        tabBarActiveTintColor: colors.neonBlue,
        tabBarInactiveTintColor: colors.textGray,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.bgCard,
          borderBottomColor: colors.borderLight,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.textLight,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={FounderHomeScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen}
        options={{ title: 'Tasks' }}
      />
      <Tab.Screen 
        name="Milestones" 
        component={MilestonesScreen}
        options={{ title: 'Milestones' }}
      />
      <Tab.Screen 
        name="Readiness" 
        component={InvestorReadinessScreen}
        options={{ title: 'Readiness' }}
      />
      <Tab.Screen 
        name="Insights" 
        component={InsightsScreen}
        options={{ title: 'Insights' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
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
        tabBarActiveTintColor: colors.neonBlue,
        tabBarInactiveTintColor: colors.textGray,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.bgCard,
          borderBottomColor: colors.borderLight,
          borderBottomWidth: 1,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.textLight,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
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

  const darkTheme = {
    dark: true,
    colors: {
      primary: colors.neonBlue,
      background: colors.bgDark,
      card: colors.bgCard,
      text: colors.textLight,
      border: colors.borderLight,
      notification: colors.neonBlue,
    },
  };

  return (
    <NavigationContainer theme={darkTheme}>
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
