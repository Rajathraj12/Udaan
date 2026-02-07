import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import RiskIndicator from '../components/RiskIndicator';
import Loader from '../components/Loader';
import { healthAPI, suggestionsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FounderHomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const { logout } = useAuth();

  useEffect(() => {
    loadData();
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

  const healthScore = healthData?.score || 0;
  const riskLevel = healthData?.riskLevel || 'medium';
  const stage = healthData?.stage || 'Idea';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Startup Health Score Card */}
      <Card style={styles.healthCard}>
        <Text style={styles.healthLabel}>Startup Health</Text>
        <Text style={styles.healthScore}>{healthScore}</Text>
        <View style={styles.healthMeta}>
          <RiskIndicator level={riskLevel} />
          <Badge variant="info" style={styles.stageBadge}>
            {stage}
          </Badge>
        </View>
      </Card>

      {/* Next Best Action Card */}
      {suggestions.length > 0 && (
        <Card style={styles.actionCard}>
          <View style={styles.actionHeader}>
            <Ionicons name="bulb" size={24} color="#F59E0B" />
            <Text style={styles.actionTitle}>Next Best Action</Text>
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionIcon}>{suggestions[0].icon || '⚠️'}</Text>
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

      {/* Additional Insights */}
      {suggestions.slice(1, 3).map((suggestion, index) => (
        <Card key={index} style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Ionicons name="analytics" size={20} color="#2563EB" />
            <Text style={styles.insightTitle}>Insight</Text>
          </View>
          <Text style={styles.insightText}>{suggestion.action || suggestion.description}</Text>
          {suggestion.priority && (
            <Badge variant="info" style={{ marginTop: 8 }}>
              Priority: {suggestion.priority}
            </Badge>
          )}
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 16,
  },
  healthCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  healthLabel: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  healthScore: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#60A5FA',
  },
  healthMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  stageBadge: {
    marginLeft: 12,
  },
  actionCard: {
    backgroundColor: '#1F2937',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F3F4F6',
    marginLeft: 8,
  },
  actionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#D1D5DB',
    lineHeight: 24,
  },
  insightCard: {
    backgroundColor: '#1F2937',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#60A5FA',
    marginLeft: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
});

export default FounderHomeScreen;
