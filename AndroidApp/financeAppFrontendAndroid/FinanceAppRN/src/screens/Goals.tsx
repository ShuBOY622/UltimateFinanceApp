import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Surface,
  Portal,
  Modal,
  TextInput,
  HelperText,
  ProgressBar,
  Chip,
  IconButton,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';

const BASE_URL = 'http://192.168.1.2:8080';

// Helper function to format dates for backend (LocalDateTime format)
const formatDateForBackend = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Helper function to format dates for backend (LocalDate format for Goals)
const formatDateForBackendLocalDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

interface Goal {
  id: number;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: 'ACTIVE' | 'COMPLETED';
}

const GoalsScreen = () => {
  const navigation = useNavigation();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const [selectedGoalForProgress, setSelectedGoalForProgress] = useState<Goal | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [progressAmount, setProgressAmount] = useState('');
  const [progressAmountError, setProgressAmountError] = useState('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/goals`);
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
      Alert.alert('Error', 'Failed to load goals');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleAddGoal = () => {
    setEditingGoal(null);
    setName('');
    setDescription('');
    setTargetAmount('');
    setTargetDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setModalVisible(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal);
    setName(goal.name);
    setDescription(goal.description || '');
    setTargetAmount(goal.targetAmount.toString());
    try {
      const date = goal.targetDate ? new Date(goal.targetDate) : new Date();
      setTargetDate(date.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Date parsing error:', error);
      setTargetDate(new Date().toISOString().split('T')[0]);
    }
    setModalVisible(true);
  };

  const handleDeleteGoal = (goal: Goal) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/api/goals/${goal.id}`);
              fetchGoals();
              Alert.alert('Success', 'Goal deleted successfully');
            } catch (error) {
              console.error('Error deleting goal:', error);
              Alert.alert('Error', 'Failed to delete goal');
            }
          },
        },
      ]
    );
  };

  const handleAddProgress = (goal: Goal) => {
    setSelectedGoalForProgress(goal);
    setProgressAmount('');
    setProgressAmountError('');
    setProgressModalVisible(true);
  };

  const handleSaveProgress = async () => {
    if (!progressAmount || isNaN(Number(progressAmount)) || Number(progressAmount) <= 0) {
      setProgressAmountError('Please enter a valid positive amount');
      return;
    }

    if (!selectedGoalForProgress) return;

    try {
      await axios.put(`${BASE_URL}/api/goals/${selectedGoalForProgress.id}/progress?amount=${Number(progressAmount)}`);
      setProgressModalVisible(false);
      setSelectedGoalForProgress(null);
      setProgressAmount('');
      fetchGoals();
      Alert.alert('Success', 'Progress updated successfully');
    } catch (error) {
      console.error('Error updating progress:', error);
      Alert.alert('Error', 'Failed to update progress');
    }
  };

  const handleSaveGoal = async () => {
    if (!name || !targetAmount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const goalData = {
      name,
      description,
      targetAmount: parseFloat(targetAmount),
      targetDate: formatDateForBackendLocalDate(targetDate),
    };

    try {
      if (editingGoal) {
        await axios.put(`${BASE_URL}/api/goals/${editingGoal.id}`, goalData);
        Alert.alert('Success', 'Goal updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/goals`, goalData);
        Alert.alert('Success', 'Goal created successfully');
      }
      setModalVisible(false);
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGoals();
  };

  const getGoalStatus = (goal: Goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    let daysRemaining = 0;

    try {
      const targetDate = goal.targetDate ? new Date(goal.targetDate) : new Date();
      if (!isNaN(targetDate.getTime())) {
        daysRemaining = differenceInDays(targetDate, new Date());
      }
    } catch (error) {
      console.error('Date parsing error in getGoalStatus:', error);
    }

    if (goal.status === 'COMPLETED') return { label: 'Completed', color: '#10b981' };
    if (daysRemaining < 0) return { label: 'Overdue', color: '#ef4444' };
    if (daysRemaining <= 7) return { label: 'Due Soon', color: '#f59e0b' };
    return { label: 'Active', color: '#6366f1' };
  };

  const renderGoal = ({ item }: { item: Goal }) => {
    const progress = (item.currentAmount / item.targetAmount) * 100;
    let daysRemaining = 0;

    try {
      const targetDate = item.targetDate ? new Date(item.targetDate) : new Date();
      if (!isNaN(targetDate.getTime())) {
        daysRemaining = differenceInDays(targetDate, new Date());
      }
    } catch (error) {
      console.error('Date parsing error in renderGoal:', error);
    }

    const status = getGoalStatus(item);
    const remaining = item.targetAmount - item.currentAmount;

    return (
      <Surface style={styles.goalCard} elevation={2}>
        <View style={styles.goalHeader}>
          <View style={styles.goalInfo}>
            <Text style={styles.goalName}>{item.name}</Text>
            {item.description && (
              <Text style={styles.goalDescription}>{item.description}</Text>
            )}
            <Chip style={[styles.statusChip, { backgroundColor: status.color }]}>
              {status.label}
            </Chip>
          </View>
          <View style={styles.goalActions}>
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => handleEditGoal(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteGoal(item)}
            />
          </View>
        </View>

        <View style={styles.goalProgress}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Progress: {Math.round(progress)}%</Text>
            <Text style={styles.progressAmount}>
              {formatCurrency(item.currentAmount)} / {formatCurrency(item.targetAmount)}
            </Text>
          </View>
          <ProgressBar
            progress={Math.min(progress / 100, 1)}
            color={status.color}
            style={styles.progressBar}
          />
        </View>

        <View style={styles.goalDetails}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Remaining</Text>
            <Text style={styles.detailValue}>{formatCurrency(remaining)}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Days Left</Text>
            <Text style={[styles.detailValue, { color: daysRemaining < 7 ? '#ef4444' : '#1e293b' }]}>
              {daysRemaining > 0 ? daysRemaining : 'Overdue'}
            </Text>
          </View>
        </View>

        {item.status !== 'COMPLETED' && (
          <Button
            mode="outlined"
            onPress={() => handleAddProgress(item)}
            style={styles.addProgressButton}
          >
            Add Progress
          </Button>
        )}
      </Surface>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No goals yet</Text>
      <Text style={styles.emptySubtext}>Create your first financial goal</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading goals...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title>Financial Goals</Title>
        <Paragraph>Set and track your objectives</Paragraph>
      </View>

      {/* Goals List */}
      <FlatList
        data={goals}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Add Goal FAB */}
      <FAB
        icon="plus"
        onPress={handleAddGoal}
        style={styles.fab}
      />

      {/* Add/Edit Goal Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={4}>
            <Title style={styles.modalTitle}>
              {editingGoal ? 'Edit Goal' : 'Create Goal'}
            </Title>

            <TextInput
              label="Goal Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <TextInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
              style={styles.input}
            />

            <TextInput
              label="Target Amount"
              value={targetAmount}
              onChangeText={setTargetAmount}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Target Date"
              value={targetDate}
              onChangeText={setTargetDate}
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <Button onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveGoal}
                disabled={!name || !targetAmount}
              >
                {editingGoal ? 'Update' : 'Create'}
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* Add Progress Modal */}
      <Portal>
        <Modal
          visible={progressModalVisible}
          onDismiss={() => {
            setProgressModalVisible(false);
            setSelectedGoalForProgress(null);
            setProgressAmount('');
            setProgressAmountError('');
          }}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={4}>
            <Title style={styles.modalTitle}>Add Progress</Title>
            <Paragraph style={styles.progressModalSubtitle}>
              {selectedGoalForProgress ? `Add progress to "${selectedGoalForProgress.name}"` : ''}
            </Paragraph>

            <TextInput
              label="Amount to Add"
              value={progressAmount}
              onChangeText={(text) => {
                setProgressAmount(text);
                setProgressAmountError('');
              }}
              keyboardType="numeric"
              style={styles.input}
              error={!!progressAmountError}
            />
            {progressAmountError ? (
              <HelperText type="error" style={styles.errorText}>
                {progressAmountError}
              </HelperText>
            ) : null}

            <View style={styles.modalActions}>
              <Button
                onPress={() => {
                  setProgressModalVisible(false);
                  setSelectedGoalForProgress(null);
                  setProgressAmount('');
                  setProgressAmountError('');
                }}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveProgress}
                disabled={!progressAmount}
              >
                Add Progress
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fafafa',
  },
  header: {
    padding: 24,
    backgroundColor: '#6366f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  goalCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  goalInfo: {
    flex: 1,
  },
  goalName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  goalActions: {
    flexDirection: 'row',
  },
  goalProgress: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  progressAmount: {
    fontSize: 12,
    color: '#64748b',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  goalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  addProgressButton: {
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366f1',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  modalContainer: {
    padding: 24,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  input: {
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 24,
  },
  cancelButton: {
    marginRight: 8,
  },
  progressModalSubtitle: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#64748b',
  },
  errorText: {
    marginBottom: 16,
  },
});

export default GoalsScreen;