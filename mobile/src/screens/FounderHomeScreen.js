import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import RiskIndicator from '../components/RiskIndicator';
import ProgressBar from '../components/ProgressBar';
import Loader from '../components/Loader';
import { healthAPI, suggestionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

const FounderHomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [pulseAnim] = useState(new Animated.Value(1));
  const { logout } = useAuth();

  useEffect(() => {
    loadData();
    // Pulse animation for live indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadData = async () => {
    try {
      const [healthRes, suggestionsRes] = await Promise.all([
        healthAPI.getHealthScore(),
        suggestionsAPI.getSuggestions(),
      ]);

      setHealthData(healthRes.data);
      setSuggestions(suggestionsRes.data.suggestions || []);
    } catch (error) {
      console.error('Error loading data:', error);
      
      // If unauthorized, show alert and logout
      if (error.response?.status === 401) {
        Alert.alert(
          'Session Expired',
          'Your session has expired. Please login again.',
          [
            { 
              text: 'OK', 
              onPress: async () => {
                await logout();
              }
            }
          ]
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return <Loader />;
  }

  const healthScore = healthData?.healthScore || 0;
  const riskLevel = healthData?.riskLevel || 'Moderate Risk';
  const stage = 'Pre-Seed';
  
  // Mock dynamic stats - in production, fetch from API
  const stats = {
    activeTasks: 12,
    completedTasks: 8,
    upcomingMilestones: 3,
    teamMembers: 5,
    daysToNextMilestone: 7,
    weeklyProgress: 68,
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Live Status Indicator */}
      <View style={styles.liveIndicator}>
        <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
        <Text style={styles.liveText}>Live Dashboard</Text>
        <Text style={styles.updateTime}>Updated just now</Text>
      </View>

      {/* Startup Health Score Card with Gradient */}
      <Card style={styles.healthCard}>
        <View style={styles.healthHeader}>
          <View>
            <Text style={styles.healthLabel}>Startup Health</Text>
            <View style={styles.healthScoreRow}>
              <Text style={styles.healthScore}>{healthScore}</Text>
              <View style={styles.scoreChange}>
                <Ionicons name="trending-up" size={20} color={colors.neonGreen} />
                <Text style={styles.scoreChangeText}>+5%</Text>
              </View>
            </View>
          </View>
          <View style={styles.circularProgress}>
            <Text style={styles.circularProgressText}>{healthScore}%</Text>
          </View>
        </View>
        <View style={styles.healthMeta}>
          <RiskIndicator level={riskLevel} />
          <Badge variant="info" style={styles.stageBadge}>
            {stage}
          </Badge>
        </View>
      </Card>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="checkmark-circle" size={24} color={colors.neonGreen} />
          </View>
          <Text style={styles.statValue}>{stats.activeTasks}</Text>
          <Text style={styles.statLabel}>Active Tasks</Text>
          <ProgressBar progress={stats.activeTasks / (stats.activeTasks + stats.completedTasks)} />
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="flag" size={24} color={colors.neonBlue} />
          </View>
          <Text style={styles.statValue}>{stats.upcomingMilestones}</Text>
          <Text style={styles.statLabel}>Milestones</Text>
          <Badge variant="info" style={styles.miniChip}>{stats.daysToNextMilestone}d left</Badge>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="people" size={24} color={colors.neonPurple} />
          </View>
          <Text style={styles.statValue}>{stats.teamMembers}</Text>
          <Text style={styles.statLabel}>Team Size</Text>
          <Badge variant="success" style={styles.miniChip}>Active</Badge>
        </Card>
        
        <Card style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trending-up" size={24} color={colors.warning} />
          </View>
          <Text style={styles.statValue}>{stats.weeklyProgress}%</Text>
          <Text style={styles.statLabel}>This Week</Text>
          <ProgressBar progress={stats.weeklyProgress / 100} />
        </Card>
      </View>

      {/* Next Best Action Card */}
      {suggestions.length > 0 && (
        <Card style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <View style={styles.actionHeaderLeft}>
              <Ionicons name="bulb" size={24} color="#F59E0B" />
              <Text style={styles.actionTitle}>Next Best Action</Text>
            </View>
            <Badge variant="warning" style={styles.priorityBadge}>High Priority</Badge>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionIcon}>{suggestions[0].icon || '⚡'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionText}>{suggestions[0].action || suggestions[0].description}</Text>
              {suggestions[0].category && (
                <Badge variant="warning" style={{ marginTop: 8 }}>
                  {suggestions[0].category}
                </Badge>
              )}
            </View>
          </View>
        </Card>
      )}

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>Recent Activity</Text>
      <Card style={styles.activityCard}>
        <View style={styles.activityItem}>
          <View style={styles.activityDot} />
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>Milestone "MVP Launch" completed</Text>
            <Text style={styles.activityTime}>2 hours ago</Text>
          </View>
        </View>
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: colors.neonBlue }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>New feedback received from 3 users</Text>
            <Text style={styles.activityTime}>5 hours ago</Text>
          </View>
        </View>
        <View style={styles.activityItem}>
          <View style={[styles.activityDot, { backgroundColor: colors.neonPurple }]} />
          <View style={styles.activityContent}>
            <Text style={styles.activityText}>Team member completed 5 tasks</Text>
            <Text style={styles.activityTime}>1 day ago</Text>
          </View>
        </View>
      </Card>

      {/* Additional Insights */}
      {suggestions.slice(1, 3).map((suggestion, index) => (
        <Card key={index} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="analytics" size={20} color={colors.neonBlue} />
            <Text style={styles.insightTitle}>Insight</Text>
            <Badge variant="info" style={{ marginLeft: 'auto' }}>
              P{index + 2}
            </Badge>
          </View>
          <Text style={styles.insightText}>{suggestion.action || suggestion.description}</Text>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
    padding: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.neonGreen,
    marginRight: 8,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neonGreen,
    marginRight: 8,
  },
  updateTime: {
    fontSize: 11,
    color: colors.textMuted,
  },
  healthCard: {
    marginBottom: 20,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  healthLabel: {
    fontSize: 14,
    color: colors.textGray,
    marginBottom: 8,
  },
  healthScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.neonBlue,
    marginRight: 12,
  },
  scoreChange: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreChangeText: {
    fontSize: 12,
    color: colors.neonGreen,
    fontWeight: '600',
    marginLeft: 4,
  },
  circularProgress: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: colors.neonBlue,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.neonBlue,
  },
  healthMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stageBadge: {
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: (width - 48) / 2,
    marginBottom: 12,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textGray,
    marginBottom: 8,
  },
  miniChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 12,
    marginTop: 8,
  },
  actionCard: {
    backgroundColor: colors.bgCard,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
    marginBottom: 20,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginLeft: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  actionText: {
    flex: 1,
    fontSize: 15,
    color: colors.textGray,
    lineHeight: 22,
  },
  activityCard: {
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.neonGreen,
    marginTop: 4,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: colors.textLight,
    lineHeight: 20,
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  insightCard: {
    backgroundColor: colors.bgCard,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neonBlue,
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: colors.textGray,
    lineHeight: 20,
  },
});

export default FounderHomeScreen;
