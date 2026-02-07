import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import { tasksAPI } from '../services/api';

const TeamMemberHomeScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
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
      {/* Summary Card */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Your Tasks</Text>
        <View style={styles.summaryStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{tasks.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{todayTasks.length}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>
      </Card>

      {/* Today's Tasks */}
      <Text style={styles.sectionTitle}>Today's Tasks</Text>
      {todayTasks.length === 0 ? (
        <Card>
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-done" size={48} color="#10B981" />
            <Text style={styles.emptyText}>All caught up!</Text>
          </View>
        </Card>
      ) : (
        todayTasks.map((task) => (
          <Card key={task.id} style={styles.taskCard}>
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
                  <Text style={styles.actionButtonText}>Start</Text>
                </TouchableOpacity>
              )}
              {task.status === 'in-progress' && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSuccess]}
                  onPress={() => updateTaskStatus(task.id, 'in-progress')}
                >
                  <Text style={styles.actionButtonText}>Complete</Text>
                </TouchableOpacity>
              )}
              <Badge
                variant={task.status === 'in-progress' ? 'info' : 'default'}
                style={styles.statusBadge}
              >
                {task.status === 'todo' ? 'TODO' : 'IN PROGRESS'}
              </Badge>
            </View>
          </Card>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
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
    fontSize: 36,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  taskCard: {
    marginBottom: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  taskDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  actionButtonSuccess: {
    backgroundColor: '#10B981',
  },
  actionButtonText: {
    color: '#FFFFFF',
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
    fontSize: 16,
    color: '#10B981',
    marginTop: 12,
    fontWeight: '500',
  },
});

export default TeamMemberHomeScreen;
