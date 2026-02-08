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
import { investorReadinessAPI } from '../services/api';
import colors from '../theme/colors';

const InvestorReadinessScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [readinessData, setReadinessData] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await investorReadinessAPI.getReadinessStatus();
      setReadinessData(response.data);
    } catch (error) {
      console.error('Error loading readiness data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const stages = [
    { id: 'idea', name: 'Idea Validated', icon: 'bulb' },
    { id: 'mvp', name: 'MVP Ready', icon: 'construct' },
    { id: 'traction', name: 'Traction Signals', icon: 'trending-up' },
    { id: 'investor', name: 'Investor Ready', icon: 'wallet' },
  ];

  if (loading) {
    return <Loader />;
  }

  const currentStageIndex = stages.findIndex(
    (s) => s.id === (readinessData?.currentStage || 'idea')
  );

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.headerCard}>
        <Text style={styles.headerTitle}>Investor Readiness Journey</Text>
        <Text style={styles.headerSubtitle}>
          Complete validation and milestones to unlock next stage
        </Text>
      </Card>

      <View style={styles.timeline}>
        {stages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;
          const isLocked = index > currentStageIndex;

          return (
            <View key={stage.id} style={styles.stageContainer}>
              {/* Timeline Line */}
              {index > 0 && (
                <View
                  style={[
                    styles.timelineLine,
                    isCompleted && styles.timelineLineCompleted,
                  ]}
                />
              )}

              {/* Stage Card */}
              <Card
                style={[
                  styles.stageCard,
                  isCurrent && styles.stageCardCurrent,
                  isLocked && styles.stageCardLocked,
                ]}
              >
                <View style={styles.stageHeader}>
                  <View
                    style={[
                      styles.stageIcon,
                      isCompleted && styles.stageIconCompleted,
                      isCurrent && styles.stageIconCurrent,
                      isLocked && styles.stageIconLocked,
                    ]}
                  >
                    <Ionicons
                      name={stage.icon}
                      size={24}
                      color={isLocked ? colors.textMuted : colors.textLight}
                    />
                  </View>
                  <View style={styles.stageInfo}>
                    <Text
                      style={[
                        styles.stageName,
                        isLocked && styles.stageNameLocked,
                      ]}
                    >
                      {stage.name}
                    </Text>
                    {isCompleted && (
                      <Text style={styles.stageStatus}>✓ Completed</Text>
                    )}
                    {isCurrent && (
                      <Text style={styles.stageStatusCurrent}>In Progress</Text>
                    )}
                    {isLocked && (
                      <Text style={styles.stageStatusLocked}>🔒 Locked</Text>
                    )}
                  </View>
                </View>
              </Card>
            </View>
          );
        })}
      </View>
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
    backgroundColor: 'rgba(37, 99, 235, 0.2)',
    borderWidth: 1,
    borderColor: colors.primaryBlue,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textLight,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.neonBlue,
  },
  timeline: {
    paddingBottom: 24,
  },
  stageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  timelineLine: {
    position: 'absolute',
    left: 32,
    top: -16,
    width: 2,
    height: 16,
    backgroundColor: colors.borderLight,
  },
  timelineLineCompleted: {
    backgroundColor: colors.neonGreen,
  },
  stageCard: {
    marginBottom: 0,
  },
  stageCardCurrent: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryBlue,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  stageCardLocked: {
    opacity: 0.5,
  },
  stageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stageIconCompleted: {
    backgroundColor: colors.neonGreen,
  },
  stageIconCurrent: {
    backgroundColor: colors.primaryBlue,
  },
  stageIconLocked: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  stageInfo: {
    flex: 1,
  },
  stageName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 4,
  },
  stageNameLocked: {
    color: colors.textGray,
  },
  stageStatus: {
    fontSize: 12,
    color: colors.neonGreen,
    fontWeight: '500',
  },
  stageStatusCurrent: {
    fontSize: 12,
    color: colors.neonBlue,
    fontWeight: '500',
  },
  stageStatusLocked: {
    fontSize: 12,
    color: colors.textGray,
  },
});

export default InvestorReadinessScreen;
