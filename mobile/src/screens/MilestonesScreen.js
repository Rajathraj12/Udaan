import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { milestonesAPI } from '../services/api';
import colors from '../theme/colors';

const MilestonesScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [milestones, setMilestones] = useState([]);

  useEffect(() => {
    loadMilestones();
  }, []);

  const loadMilestones = async () => {
    try {
      const response = await milestonesAPI.getMilestones();
      setMilestones(response.data.milestones || []);
    } catch (error) {
      console.error('Error loading milestones:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMilestones();
  };

  const getStatusVariant = (status) => {
    if (status === 'On Track') return 'success';
    if (status === 'At Risk') return 'danger';
    return 'default';
  };

  const getProgressColor = (status) => {
    if (status === 'On Track') return colors.neonGreen;
    if (status === 'At Risk') return colors.error;
    return colors.textMuted;
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
      {milestones.length === 0 ? (
        <EmptyState icon="flag-outline" message="No milestones yet" />
      ) : (
        milestones.map((milestone) => (
          <Card key={milestone.id} style={styles.milestoneCard}>
            <View style={styles.milestoneHeader}>
              <Text style={styles.milestoneTitle}>{milestone.name}</Text>
              <Badge variant={getStatusVariant(milestone.status)}>
                {milestone.status}
              </Badge>
            </View>

            {milestone.description && (
              <Text style={styles.milestoneDescription}>
                {milestone.description}
              </Text>
            )}

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Progress</Text>
                <Text style={styles.progressPercentage}>
                  {milestone.progress || 0}%
                </Text>
              </View>
              <ProgressBar
                progress={milestone.progress || 0}
                color={getProgressColor(milestone.status)}
              />
            </View>

            {milestone.dueDate && (
              <Text style={styles.dueDate}>
                Due: {new Date(milestone.dueDate).toLocaleDateString()}
              </Text>
            )}
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgDark,
    padding: 16,
  },
  milestoneCard: {
    marginBottom: 16,
  },
  milestoneHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  milestoneTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
    marginRight: 8,
  },
  milestoneDescription: {
    fontSize: 14,
    color: colors.textGray,
    marginBottom: 16,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textGray,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neonBlue,
  },
  dueDate: {
    fontSize: 12,
    color: colors.textGray,
  },
});

export default MilestonesScreen;
