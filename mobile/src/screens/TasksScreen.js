import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import Card from '../components/Card';
import Badge from '../components/Badge';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';
import { tasksAPI } from '../services/api';
import colors from '../theme/colors';

const TasksScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const response = await tasksAPI.getTasks();
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateTaskStatus = async (taskId, currentStatus) => {
    const statusFlow = { todo: 'in-progress', 'in-progress': 'done', done: 'todo' };
    const newStatus = statusFlow[currentStatus];

    try {
      await tasksAPI.updateTaskStatus(taskId, newStatus);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update task status');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTasks();
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'done':
        return 'success';
      case 'in-progress':
        return 'info';
      default:
        return 'default';
    }
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
      {tasks.length === 0 ? (
        <EmptyState icon="checkmark-done-outline" message="No tasks yet" />
      ) : (
        tasks.map((task) => (
          <Card key={task.id} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Badge variant={getStatusVariant(task.status)}>
                {task.status.replace('-', ' ').toUpperCase()}
              </Badge>
            </View>
            
            {task.description && (
              <Text style={styles.taskDescription}>{task.description}</Text>
            )}

            <View style={styles.taskMeta}>
              {task.dueDate && (
                <Text style={styles.dueDate}>
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </Text>
              )}
              {task.milestone && (
                <Badge variant="warning" style={styles.milestoneBadge}>
                  {task.milestone}
                </Badge>
              )}
            </View>

            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => updateTaskStatus(task.id, task.status)}
            >
              <Text style={styles.updateButtonText}>
                {task.status === 'todo' && 'Start Task'}
                {task.status === 'in-progress' && 'Mark as Done'}
                {task.status === 'done' && 'Reset to Todo'}
              </Text>
            </TouchableOpacity>
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
  taskCard: {
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: colors.textLight,
    marginRight: 8,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textGray,
    marginBottom: 12,
  },
  taskMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dueDate: {
    fontSize: 12,
    color: colors.textGray,
  },
  milestoneBadge: {
    fontSize: 10,
  },
  updateButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: colors.textLight,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TasksScreen;
