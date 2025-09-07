import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Surface,
  Avatar,
  Chip,
  IconButton,
  Button,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { format } from 'date-fns';
import SpendingChart from './SpendingChart';

const BASE_URL = 'http://192.168.1.2:8080';

// Category icons mapping
const CATEGORY_ICONS: { [key: string]: string } = {
  FOOD: 'restaurant',
  TRANSPORTATION: 'directions-car',
  ENTERTAINMENT: 'shopping-cart',
  SHOPPING: 'shopping-cart',
  UTILITIES: 'home',
  HEALTHCARE: 'local-hospital',
  EDUCATION: 'school',
  TRAVEL: 'flight',
  RENT: 'home',
  INSURANCE: 'home',
  SALARY: 'attach-money',
  FREELANCE: 'work',
  INVESTMENT: 'trending-up',
  BUSINESS: 'business',
  OTHER_EXPENSE: 'shopping-cart',
  OTHER_INCOME: 'attach-money',
};

interface Transaction {
  id: number;
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  transactionDate: string;
}

interface MonthlySummary {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBalance: number;
  transactionCount: number;
  expensesByCategory: { [key: string]: number };
}

const MonthlyTransactions = () => {
  const navigation = useNavigation();
  const [currentMonth, setCurrentMonth] = useState(0); // 0 = current month, 1 = last month, etc.
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    fetchMonthlyData();

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentMonth]);

  // Debug: Log when monthly transactions state changes
  useEffect(() => {
    console.log('Monthly transactions state updated:', transactions.length, 'items');
    console.log('Monthly summary state:', summary);
  }, [transactions, summary]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      console.log('Fetching monthly data for monthOffset:', currentMonth);
      console.log('Monthly transactions URL:', `${BASE_URL}/api/transactions/monthly?monthOffset=${currentMonth}`);
      console.log('Monthly summary URL:', `${BASE_URL}/api/transactions/monthly/summary?monthOffset=${currentMonth}`);

      const [transactionsRes, summaryRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/transactions/monthly?monthOffset=${currentMonth}`),
        axios.get(`${BASE_URL}/api/transactions/monthly/summary?monthOffset=${currentMonth}`)
      ]);

      console.log('Monthly transactions response:', transactionsRes.data);
      console.log('Monthly summary response:', summaryRes.data);

      const transactionData = Array.isArray(transactionsRes.data) ? transactionsRes.data : [];
      console.log('Setting monthly transactions:', transactionData.length, 'items');
      setTransactions(transactionData);
      setSummary(summaryRes.data);
    } catch (error: any) {
      console.error('Monthly transactions error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Unknown error occurred';

      console.error('Monthly error message:', errorMessage);
      setError(`Failed to load monthly data: ${errorMessage}`);
      setTransactions([]);
      setSummary(null);

      Alert.alert('Connection Error', errorMessage + '\n\nPlease check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getMonthName = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - currentMonth);
    return format(date, 'MMMM yyyy');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonth(prev => prev + 1);
    } else {
      setCurrentMonth(prev => Math.max(0, prev - 1));
    }
  };

  const getCategoryIcon = (category: string, type: string) => {
    return CATEGORY_ICONS[category] || (type === 'INCOME' ? 'trending-up' : 'trending-down');
  };

  const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => {
    console.log('Rendering monthly transaction:', item.id, item.description);
    return (
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [50, 0],
            })
          }],
        }}
      >
      <Surface style={styles.transactionCard} elevation={2}>
        <View style={[
          styles.transactionGradient,
          { backgroundColor: item.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
        ]}>
          <View style={styles.transactionContent}>
            <View style={styles.transactionLeft}>
              <Avatar.Icon
                size={40}
                icon={getCategoryIcon(item.category, item.type)}
                style={[
                  styles.categoryIcon,
                  { backgroundColor: item.type === 'INCOME' ? '#10b98120' : '#ef444420' }
                ]}
                color={item.type === 'INCOME' ? '#10b981' : '#ef4444'}
              />
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription} numberOfLines={1}>
                  {item.description}
                </Text>
                <Chip
                  style={[
                    styles.categoryChip,
                    { backgroundColor: item.type === 'INCOME' ? '#10b98115' : '#ef444415' }
                  ]}
                  textStyle={{ color: item.type === 'INCOME' ? '#10b981' : '#ef4444', fontSize: 12 }}
                >
                  {item.category.replace('_', ' ')}
                </Chip>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <Text
                style={[
                  styles.transactionAmount,
                  { color: item.type === 'INCOME' ? '#10b981' : '#ef4444' },
                ]}
              >
                {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
              </Text>
              <Text style={styles.transactionDate}>
                {item.transactionDate ? format(new Date(item.transactionDate), 'dd MMM') : 'No date'}
              </Text>
            </View>
          </View>
        </View>
      </Surface>
    </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No transactions found</Text>
      <Text style={styles.emptySubtext}>No financial activity recorded for {getMonthName()}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading monthly data...</Text>
        <Text>Debug: Monthly loading state is true</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header with Month Navigation */}
      <View style={[styles.header, { backgroundColor: '#6366f1' }]}>
        <Animated.View
          style={[styles.headerContent, { transform: [{ translateY: slideAnim }] }]}
        >
          <View>
            <Title style={styles.headerTitle}>Monthly Transactions</Title>
            <Paragraph style={styles.headerSubtitle}>View your financial activity by month</Paragraph>
          </View>
          <View style={styles.monthNavigation}>
            <IconButton
              icon="chevron-left"
              size={24}
              onPress={() => navigateMonth('prev')}
              iconColor="#ffffff"
            />
            <View style={styles.monthDisplay}>
              <Text style={styles.monthText}>{getMonthName()}</Text>
            </View>
            <IconButton
              icon="chevron-right"
              size={24}
              onPress={() => navigateMonth('next')}
              iconColor="#ffffff"
              disabled={currentMonth === 0}
            />
          </View>
        </Animated.View>
      </View>

      {/* Monthly Summary Cards */}
      {summary && (
        <View style={styles.summaryContainer}>
          <Surface style={[styles.summaryCard, { backgroundColor: '#10b981' }]} elevation={3}>
            <Text style={styles.summaryValue}>{formatCurrency(summary?.monthlyIncome || 0)}</Text>
            <Text style={styles.summaryLabel}>Total Income</Text>
          </Surface>

          <Surface style={[styles.summaryCard, { backgroundColor: '#ef4444' }]} elevation={3}>
            <Text style={styles.summaryValue}>{formatCurrency(summary?.monthlyExpenses || 0)}</Text>
            <Text style={styles.summaryLabel}>Total Expenses</Text>
          </Surface>

          <Surface style={[styles.summaryCard, { backgroundColor: (summary?.monthlyBalance || 0) >= 0 ? '#10b981' : '#ef4444' }]} elevation={3}>
            <Text style={styles.summaryValue}>{formatCurrency(summary?.monthlyBalance || 0)}</Text>
            <Text style={styles.summaryLabel}>Net Balance</Text>
          </Surface>

          <Surface style={[styles.summaryCard, { backgroundColor: '#6366f1' }]} elevation={3}>
            <Text style={styles.summaryValue}>{summary?.transactionCount || 0}</Text>
            <Text style={styles.summaryLabel}>Transactions</Text>
          </Surface>
        </View>
      )}

      {/* Monthly Spending Chart */}
      {summary && (
        <View style={styles.chartContainer}>
          <SpendingChart
            data={{
              expensesByCategory: summary?.expensesByCategory || {}
            }}
            height={350}
          />
        </View>
      )}

      {/* Error Display */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
          <Button
            mode="contained"
            onPress={() => {
              setError(null);
              fetchMonthlyData();
            }}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      )}

      {/* Debug Info */}
      <View style={{ padding: 10, backgroundColor: '#ffe0e0' }}>
        <Text>Monthly Debug: {transactions.length} transactions</Text>
        <Text>API URLs: {BASE_URL}/api/transactions/monthly</Text>
        {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}
      </View>

      {/* Transaction List */}
      <FlatList
        data={transactions}
        renderItem={(item) => {
          console.log('Monthly renderItem called with:', item);
          return renderTransaction(item);
        }}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={() => {
          console.log('Monthly ListEmptyComponent rendered');
          return renderEmpty();
        }}
        contentContainerStyle={styles.listContainer}
      />
    </Animated.View>
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
  errorContainer: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    margin: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#dc2626',
  },
  header: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  monthText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
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
  chartContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  transactionCard: {
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  transactionGradient: {
    borderRadius: 12,
    padding: 16,
  },
  transactionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  transactionDate: {
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

export default MonthlyTransactions;