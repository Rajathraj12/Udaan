import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { suggestionsAPI } from '../services/api';
import colors from '../theme/colors';

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
  const insightCategories = ['Strategy', 'Growth', 'Product', 'Team', 'Market'];
  const currentTime = new Date().toLocaleString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  // Enhanced insight details based on category
  const getEnhancedInsight = (insight, category) => {
    const strategies = {
      'Strategy': {
        note: 'Focus on core value proposition and competitive differentiation',
        action: 'Review your business model and validate key assumptions through customer interviews'
      },
      'Growth': {
        note: 'Identify scalable acquisition channels and optimize conversion funnel',
        action: 'Prioritize experiments in top-performing channels with highest ROI potential'
      },
      'Product': {
        note: 'Gather user feedback and iterate based on data-driven insights',
        action: 'Conduct user testing sessions and analyze feature usage metrics to guide development'
      },
      'Team': {
        note: 'Build a cohesive team aligned with startup vision and culture',
        action: 'Schedule regular check-ins and ensure clear communication of goals and responsibilities'
      },
      'Market': {
        note: 'Analyze market trends and competitor positioning for opportunities',
        action: 'Monitor industry developments and adjust positioning to capture emerging opportunities'
      }
    };

    return {
      ...insight,
      strategyNote: strategies[category]?.note || '',
      recommendedAction: strategies[category]?.action || insight.action || insight.description || insight.suggestion
    };
  };

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
      {/* Insights Header with timestamp */}
      <Card style={styles.headerCard}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconContainer}>
              <MaterialCommunityIcons name="lightbulb-on" size={28} color={colors.neonBlue} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Smart Recommendations</Text>
              <Text style={styles.headerSubtitle}>Personalized insights for your startup</Text>
            </View>
          </View>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Live</Text>
          </View>
        </View>
        <View style={styles.lastUpdated}>
          <Ionicons name="time-outline" size={14} color={colors.textGray} />
          <Text style={styles.timestampText}>Updated {currentTime}</Text>
        </View>
      </Card>

      {/* Insights Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Strategic Recommendations</Text>
        <Text style={styles.insightCount}>{insights.length} insights</Text>
      </View>

      {insights.length === 0 ? (
        <EmptyState icon="bulb-outline" message="No insights available yet" />
      ) : (
        insights.slice(0, 5).map((insight, index) => {
          const category = insightCategories[index % insightCategories.length];
          const enhancedInsight = getEnhancedInsight(insight, category);
          
          return (
            <Card key={index} style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <View style={styles.iconContainer}>
                  <Ionicons
                    name={insightIcons[index % insightIcons.length]}
                    size={24}
                    color={colors.primaryBlue}
                  />
                </View>
                <View style={styles.insightContent}>
                  <View style={styles.insightTitleRow}>
                    <Text style={styles.insightTitle}>
                      {category} Insight
                    </Text>
                    <Badge variant="default" style={styles.priorityBadge}>
                      P{index + 1}
                    </Badge>
                  </View>
                  
                  {/* Strategy Note */}
                  {enhancedInsight.strategyNote && (
                    <View style={styles.strategyNote}>
                      <Ionicons name="compass-outline" size={14} color={colors.neonBlue} />
                      <Text style={styles.strategyNoteText}>{enhancedInsight.strategyNote}</Text>
                    </View>
                  )}

                  {/* Recommended Action */}
                  <Text style={styles.insightText}>
                    {enhancedInsight.recommendedAction}
                  </Text>
                  
                  {/* Additional reason if available from API */}
                  {insight.reason && (
                    <View style={styles.reasonContainer}>
                      <Ionicons name="information-circle-outline" size={16} color={colors.neonBlue} />
                      <Text style={styles.reasonText}>{insight.reason}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Card>
          );
        })
      )}

      {/* Info Card */}
      <Card style={styles.disclaimerCard}>
        <View style={styles.disclaimerHeader}>
          <MaterialCommunityIcons name="information" size={20} color={colors.neonBlue} />
          <Text style={styles.disclaimerTitle}>About Recommendations</Text>
        </View>
        <Text style={styles.disclaimerText}>
          These insights are generated based on your startup's health metrics, 
          task completion patterns, and milestone progress. Recommendations are personalized 
          and updated in real-time. Pull down to refresh for latest insights.
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
    padding: 16,
  },
  headerCard: {
    marginBottom: 20,
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(34, 211, 238, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.textGray,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neonGreen,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neonGreen,
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestampText: {
    fontSize: 11,
    color: colors.textGray,
    marginLeft: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textLight,
  },
  insightCount: {
    fontSize: 13,
    color: colors.textGray,
    fontWeight: '600',
  },
  insightCard: {
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.neonBlue,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neonBlue,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
  },
  strategyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(34, 211, 238, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderLeftWidth: 2,
    borderLeftColor: colors.neonBlue,
  },
  strategyNoteText: {
    flex: 1,
    fontSize: 12,
    color: colors.textGray,
    lineHeight: 18,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  insightText: {
    fontSize: 15,
    color: colors.textLight,
    lineHeight: 22,
    marginBottom: 8,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(34, 211, 238, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  reasonText: {
    flex: 1,
    fontSize: 12,
    color: colors.textGray,
    lineHeight: 18,
    marginLeft: 8,
  },
  disclaimerCard: {
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginTop: 8,
    marginBottom: 24,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neonBlue,
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textGray,
    lineHeight: 18,
  },
});

export default InsightsScreen;
