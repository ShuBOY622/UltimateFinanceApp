import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Surface, ProgressBar } from 'react-native-paper';
import axios from 'axios';

const BASE_URL = 'http://192.168.1.2:8080';

interface BudgetData {
  totalBudget: number;
  totalSpent: number;
  remaining: number;
  categories: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
  }>;
}

const BudgetScreen = () => {
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/budgets/analysis`);
      setBudgetData(response.data);
    } catch (error) {
      console.error('Error fetching budget data:', error);
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchBudgetData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading budget...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Title>Budget Overview</Title>
        <Paragraph>Track your spending against budgets</Paragraph>
      </View>

      {/* Budget Summary */}
      {budgetData && (
        <View style={styles.summaryContainer}>
          <Surface style={[styles.summaryCard, { backgroundColor: '#6366f1' }]} elevation={3}>
            <Text style={styles.summaryValue}>{formatCurrency(budgetData.totalBudget)}</Text>
            <Text style={styles.summaryLabel}>Total Budget</Text>
          </Surface>

          <Surface style={[styles.summaryCard, { backgroundColor: '#10b981' }]} elevation={3}>
            <Text style={styles.summaryValue}>{formatCurrency(budgetData.totalSpent)}</Text>
            <Text style={styles.summaryLabel}>Total Spent</Text>
          </Surface>

          <Surface style={[styles.summaryCard, { backgroundColor: budgetData.remaining >= 0 ? '#10b981' : '#ef4444' }]} elevation={3}>
            <Text style={styles.summaryValue}>{formatCurrency(budgetData.remaining)}</Text>
            <Text style={styles.summaryLabel}>Remaining</Text>
          </Surface>
        </View>
      )}

      {/* Category Breakdown */}
      {budgetData?.categories && budgetData.categories.length > 0 ? (
        <View style={styles.categoriesContainer}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          {budgetData.categories.map((category, index) => {
            const progress = category.budgeted > 0 ? (category.spent / category.budgeted) : 0;
            const isOverBudget = category.spent > category.budgeted;

            return (
              <Surface key={index} style={styles.categoryCard} elevation={2}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.category}</Text>
                  <Text style={[styles.categoryAmount, { color: isOverBudget ? '#ef4444' : '#10b981' }]}>
                    {formatCurrency(category.spent)} / {formatCurrency(category.budgeted)}
                  </Text>
                </View>

                <ProgressBar
                  progress={Math.min(progress, 1)}
                  color={isOverBudget ? '#ef4444' : '#6366f1'}
                  style={styles.progressBar}
                />

                <View style={styles.categoryFooter}>
                  <Text style={styles.remainingText}>
                    {isOverBudget ? 'Over budget by' : 'Remaining'}:
                    {' '}
                    {formatCurrency(Math.abs(category.remaining))}
                  </Text>
                </View>
              </Surface>
            );
          })}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No budget data available</Text>
          <Text style={styles.emptySubtext}>Set up budgets to track your spending</Text>
        </View>
      )}
    </ScrollView>
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
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  categoriesContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  categoryFooter: {
    alignItems: 'flex-end',
  },
  remainingText: {
    fontSize: 12,
    color: '#64748b',
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

export default BudgetScreen;