import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Surface, Chip, IconButton } from 'react-native-paper';
import axios from 'axios';
import { format, differenceInDays } from 'date-fns';

const BASE_URL = 'http://192.168.1.2:8080';

interface Subscription {
  id: number;
  name: string;
  amount: number;
  frequency: string;
  nextBillingDate: string;
  category: string;
  status: 'ACTIVE' | 'CANCELLED';
}

const SubscriptionsScreen = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/subscriptions`);
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
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

  const getDaysUntilNextBilling = (nextBillingDate: string) => {
    if (!nextBillingDate) return 0;
    try {
      const date = new Date(nextBillingDate);
      if (isNaN(date.getTime())) return 0;
      return differenceInDays(date, new Date());
    } catch (error) {
      console.error('Invalid date:', nextBillingDate);
      return 0;
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubscriptions();
  };

  const renderSubscription = ({ item }: { item: Subscription }) => {
    const daysUntil = getDaysUntilNextBilling(item.nextBillingDate);
    const isUrgent = daysUntil <= 3;

    return (
      <Surface style={styles.subscriptionCard} elevation={2}>
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionInfo}>
            <Text style={styles.subscriptionName}>{item.name}</Text>
            <Text style={styles.subscriptionCategory}>{item.category}</Text>
          </View>
          <View style={styles.subscriptionActions}>
            <Chip
              style={[
                styles.statusChip,
                { backgroundColor: item.status === 'ACTIVE' ? '#10b981' : '#ef4444' }
              ]}
            >
              {item.status}
            </Chip>
          </View>
        </View>

        <View style={styles.subscriptionDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Amount:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.amount)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Frequency:</Text>
            <Text style={styles.detailValue}>{item.frequency}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Next Billing:</Text>
            <Text style={[styles.detailValue, { color: isUrgent ? '#ef4444' : '#1e293b' }]}>
              {item.nextBillingDate ? (() => {
                try {
                  const date = new Date(item.nextBillingDate);
                  if (isNaN(date.getTime())) {
                    return 'Invalid date';
                  }
                  return format(date, 'MMM dd, yyyy');
                } catch (error) {
                  console.error('Date formatting error:', error);
                  return 'Invalid date';
                }
              })() : 'No date set'}
              {daysUntil > 0 && ` (${daysUntil} days)`}
              {daysUntil === 0 && ' (Today)'}
              {daysUntil < 0 && ' (Overdue)'}
            </Text>
          </View>
        </View>
      </Surface>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No subscriptions yet</Text>
      <Text style={styles.emptySubtext}>Track your recurring payments</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading subscriptions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Title>Subscriptions</Title>
        <Paragraph>Manage your recurring payments</Paragraph>
      </View>

      {/* Subscriptions List */}
      <FlatList
        data={subscriptions}
        renderItem={renderSubscription}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#6366f1',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  subscriptionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  subscriptionCategory: {
    fontSize: 14,
    color: '#64748b',
  },
  subscriptionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChip: {
    height: 24,
  },
  subscriptionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
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
});

export default SubscriptionsScreen;