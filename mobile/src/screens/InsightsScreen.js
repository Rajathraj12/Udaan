import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { suggestionsAPI } from '../services/api';

const InsightsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      const response = await suggestionsAPI.getSuggestions();
      setInsights(response.data.suggestions || []);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInsights();
  };

  const insightIcons = ['bulb', 'telescope', 'rocket', 'trending-up', 'people'];

  if (loading) {
    return <Loader />;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Ionicons name="analytics" size={32} color="#2563EB" />
        <Text style={styles.headerTitle}>AI-Powered Insights</Text>
        <Text style={styles.headerSubtitle}>
          Actionable recommendations for your startup
        </Text>
      </View>

      {insights.length === 0 ? (
        <EmptyState icon="bulb-outline" message="No insights available yet" />
      ) : (
        insights.slice(0, 2).map((insight, index) => (
          <Card key={index} style={styles.insightCard}>
            <View style={styles.insightHeader}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={insightIcons[index % insightIcons.length]}
                  size={24}
                  color="#2563EB"
                />
              </View>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Action {index + 1}</Text>
                <Text style={styles.insightText}>{insight.action || insight.description}</Text>
              </View>
            </View>
          </Card>
        ))
      )}

      {/* Helper Text */}
      <Card style={styles.helperCard}>
        <Ionicons name="information-circle" size={20} color="#6B7280" />
        <Text style={styles.helperText}>
          These insights are generated based on your startup's current health,
          tasks, and milestones. Check back regularly for updated recommendations.
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F3F4F6',
    marginTop: 12,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  insightCard: {
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#60A5FA',
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#60A5FA',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  insightText: {
    fontSize: 16,
    color: '#E5E7EB',
    lineHeight: 24,
  },
  helperCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1F2937',
    marginTop: 8,
  },
  helperText: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 18,
    marginLeft: 12,
  },
});

export default InsightsScreen;
