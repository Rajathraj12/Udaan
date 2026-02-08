import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import Loader from '../components/Loader';
import { tasksAPI } from '../services/api';
import colors from '../theme/colors';

const { width } = Dimensions.get('window');

const TeamMemberHomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    loadTasks();
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getTasks();
      const allTasks = response.data.tasks || [];
      // Filter only tasks assigned to this user
      setTasks(allTasks.filter((task) => task.status !== 'done'));
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateTaskStatus = async (taskId, currentStatus) => {
    const statusFlow = { todo: 'in-progress', 'in-progress': 'done' };
    const newStatus = statusFlow[currentStatus];
    if (!newStatus) return;

    try {
      await tasksAPI.updateTaskStatus(taskId, newStatus);
      loadTasks(); // Reload tasks
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const todayTasks = tasks.filter((task) => {
    if (!task.dueDate) return true;
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate.toDateString() === today.toDateString();
  });

  const inProgressTasks = tasks.filter((task) => task.status === 'in-progress');
  const todoTasks = tasks.filter((task) => task.status === 'todo');
  
  // Mock stats - in production, fetch from API
  const completedThisWeek = 8;
  const weeklyGoal = 12;
  const productivity = Math.round((completedThisWeek / weeklyGoal) * 100);

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
      {/* Live Status */}
      <View style={styles.liveIndicator}>
        <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
        <Text style={styles.liveText}>You're doing great!</Text>
      </View>

      {/* Productivity Overview */}
      <Card style={styles.productivityCard}>
        <View style={styles.productivityHeader}>
          <View>
            <Text style={styles.productivityLabel}>Weekly Productivity</Text>
            <Text style={styles.productivityValue}>{productivity}%</Text>
          </View>
          <View style={styles.trophyContainer}>
            <Ionicons name="trophy" size={32} color={colors.warning} />
          </View>
        </View>
        <ProgressBar progress={productivity / 100} style={{ marginTop: 12 }} />
        <View style={styles.productivityMeta}>
          <Text style={styles.productivityMetaText}>
            {completedThisWeek} of {weeklyGoal} tasks completed
          </Text>
        </View>
      </Card>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <Card style={styles.miniStatCard}>
          <Ionicons name="checkmark-circle" size={28} color={colors.neonGreen} />
          <Text style={styles.miniStatValue}>{inProgressTasks.length}</Text>
          <Text style={styles.miniStatLabel}>In Progress</Text>
        </Card>
        
        <Card style={styles.miniStatCard}>
          <Ionicons name="time" size={28} color={colors.neonBlue} />
          <Text style={styles.miniStatValue}>{todoTasks.length}</Text>
          <Text style={styles.miniStatLabel}>To Do</Text>
        </Card>
        
        <Card style={styles.miniStatCard}>
          <Ionicons name="flame" size={28} color={colors.warning} />
          <Text style={styles.miniStatValue}>5</Text>
          <Text style={styles.miniStatLabel}>Day Streak</Text>
        </Card>
      </View>

      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>Your Tasks</Text>
          <Badge variant="info">{tasks.length} total</Badge>
        </View>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{todayTasks.length}</Text>
            <Text style={styles.statLabel}>Due Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{completedThisWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>
        </View>
      </Card>

      {/* Today's Tasks */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Tasks</Text>
        {todayTasks.length > 0 && (
          <Badge variant="warning">{todayTasks.length} pending</Badge>
        )}
      </View>
      {todayTasks.length === 0 ? (
        <Card>
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done" size={48} color={colors.neonGreen} />
            <Text style={styles.emptyText}>All caught up!</Text>
            <Text style={styles.emptySubtext}>Great job completing your tasks</Text>
          </View>
        </Card>
      ) : (
        todayTasks.map((task) => (
          <Card key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Badge variant={task.status === 'in-progress' ? 'info' : 'default'}>
                {task.status === 'todo' ? 'TODO' : 'IN PROGRESS'}
              </Badge>
              {task.priority && (
                <Badge variant="warning" style={{ marginLeft: 8 }}>
                  {task.priority}
                </Badge>
              )}
            </View>
            <Text style={styles.taskTitle}>{task.title}</Text>
            {task.description && (
              <Text style={styles.taskDescription}>{task.description}</Text>
            )}
            <View style={styles.taskActions}>
              {task.status === 'todo' && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => updateTaskStatus(task.id, 'todo')}
                >
                  <Ionicons name="play" size={16} color={colors.textLight} style={{ marginRight: 4 }} />
                  <Text style={styles.actionButtonText}>Start Task</Text>
                </TouchableOpacity>
              )}
              {task.status === 'in-progress' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSuccess]}
                  onPress={() => updateTaskStatus(task.id, 'in-progress')}
                >
                  <Ionicons name="checkmark" size={16} color={colors.textLight} style={{ marginRight: 4 }} />
                  <Text style={styles.actionButtonText}>Complete</Text>
                </TouchableOpacity>
              )}
            </View>
          </Card>
        ))
      )}

      {/* Recent Achievements */}
      {completedThisWeek > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <Card style={styles.achievementCard}>
            <View style={styles.achievementItem}>
              <Ionicons name="star" size={24} color={colors.warning} />
              <Text style={styles.achievementText}>Completed {completedThisWeek} tasks this week!</Text>
            </View>
            <View style={styles.achievementItem}>
              <Ionicons name="flame" size={24} color={colors.danger} />
              <Text style={styles.achievementText}>5-day productivity streak 🔥</Text>
            </View>
          </Card>
        </>
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
    fontSize: 13,
    fontWeight: '600',
    color: colors.textLight,
  },
  productivityCard: {
    marginBottom: 16,
  },
  productivityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productivityLabel: {
    fontSize: 14,
    color: colors.textGray,
    marginBottom: 4,
  },
  productivityValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.neonBlue,
  },
  trophyContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productivityMeta: {
    marginTop: 8,
  },
  productivityMetaText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  miniStatCard: {
    width: (width - 48) / 3,
    alignItems: 'center',
    paddingVertical: 12,
  },
  miniStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textLight,
    marginTop: 6,
  },
  miniStatLabel: {
    fontSize: 11,
    color: colors.textGray,
    marginTop: 2,
  },
  summaryCard: {
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textLight,
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.neonBlue,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textGray,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 12,
    marginTop: 8,
  },
  taskCard: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textGray,
    marginBottom: 12,
    lineHeight: 20,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: colors.primaryBlue,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonSuccess: {
    backgroundColor: colors.neonGreen,
  },
  actionButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 18,
    color: colors.neonGreen,
    marginTop: 12,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textGray,
    marginTop: 4,
  },
  achievementCard: {
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
    borderLeftWidth: 3,
    borderLeftColor: colors.neonBlue,
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  achievementText: {
    fontSize: 14,
    color: colors.textLight,
    marginLeft: 12,
    fontWeight: '500',
  },
});

export default TeamMemberHomeScreen;
