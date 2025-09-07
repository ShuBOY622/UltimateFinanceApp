import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Animated } from 'react-native';
import { Card, Title, Paragraph, Button, Surface, Avatar, FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import SpendingInsights from '../components/SpendingInsights';
import SpendingChart from '../components/SpendingChart';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';

const BASE_URL = 'http://192.168.1.2:8080';

const screenWidth = Dimensions.get('window').width;

interface SummaryData {
  netWorth?: number;
  cashBalance?: number;
  monthlyIncome?: number;
  monthlyExpenses?: number;
  savingsRate?: number;
}

interface PortfolioData {
  currentValue?: number;
  totalGainLoss?: number;
  totalHoldings?: number;
}

const DashboardScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const { summary, portfolio, loading, refreshDashboard } = useDashboard();

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    // Start animations when component mounts
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
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const StatCard = ({ title, value, iconName, color }: { title: string; value: string; iconName: string; color: string }) => (
    <Surface style={[styles.statCard, { borderLeftColor: color }]} elevation={3}>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Avatar.Icon size={24} icon={iconName} style={{ backgroundColor: 'transparent' }} />
      </View>
    </Surface>
  );

  const portfolioData = [
    {
      name: 'Stocks',
      value: portfolio.currentValue ? portfolio.currentValue * 0.6 : 0,
      color: '#6366f1',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Bonds',
      value: portfolio.currentValue ? portfolio.currentValue * 0.3 : 0,
      color: '#10b981',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
    {
      name: 'Cash',
      value: portfolio.currentValue ? portfolio.currentValue * 0.1 : 0,
      color: '#f59e0b',
      legendFontColor: '#7F7F7F',
      legendFontSize: 12,
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Animated.ScrollView
      style={[styles.container, { opacity: fadeAnim }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={['#6366f1', '#8b5cf6']}
        style={styles.header}
      >
        <Animated.View style={[styles.headerLeft, { transform: [{ translateY: slideAnim }] }]}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {user?.firstName}!</Text>
            <Text style={styles.subtitle}>Your AI-Powered Financial Dashboard</Text>
          </View>
          <TouchableOpacity
            onPress={refreshDashboard}
            style={styles.refreshButton}
            disabled={loading}
          >
            <Avatar.Icon
              size={20}
              icon={loading ? "hourglass-empty" : "refresh"}
              style={{ backgroundColor: 'transparent' }}
              color={loading ? "rgba(255, 255, 255, 0.6)" : "white"}
            />
            <Text style={[styles.refreshText, loading && styles.refreshTextDisabled]}>
              {loading ? 'Loading...' : 'Refresh'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#6366f1' }]}
          onPress={() => navigation.navigate('Investments' as never)}
        >
          <Avatar.Icon size={32} icon="trending-up" style={{ backgroundColor: 'transparent' }} />
          <Text style={styles.actionText}>Investments</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#10b981' }]}
          onPress={() => navigation.navigate('Transactions' as never)}
        >
          <Avatar.Icon size={32} icon="credit-card" style={{ backgroundColor: 'transparent' }} />
          <Text style={styles.actionText}>Transactions</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Net Worth"
          value={formatCurrency(summary.netWorth || 0)}
          iconName="account-balance-wallet"
          color="#6366f1"
        />
        <StatCard
          title="Cash Balance"
          value={formatCurrency(summary.cashBalance || 0)}
          iconName="account-balance"
          color="#10b981"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(summary.monthlyIncome || 0)}
          iconName="trending-up"
          color="#f59e0b"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(summary.monthlyExpenses || 0)}
          iconName="trending-down"
          color="#ef4444"
        />
      </View>

      {/* Spending Insights */}
      <SpendingInsights
        summaryData={summary}
        portfolioData={portfolio}
        transactions={[]} // We'll need to get recent transactions
        lastMonthData={null}
      />

      {/* Spending Chart */}
      <SpendingChart data={summary} />

     

      {/* Portfolio Overview */}
      <Card style={styles.portfolioCard}>
        <Card.Content>
          <Title>Portfolio Overview</Title>
          {portfolio.totalHoldings && portfolio.totalHoldings > 0 ? (
            <View>
              <PieChart
                data={portfolioData}
                width={screenWidth - 80}
                height={200}
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                accessor="value"
                backgroundColor="transparent"
                paddingLeft="15"
              />
              <View style={styles.portfolioStats}>
                <Text style={styles.portfolioValue}>
                  {formatCurrency(portfolio.currentValue || 0)}
                </Text>
                <Text style={styles.portfolioLabel}>Total Value</Text>
                <Text style={[styles.portfolioChange, { color: (portfolio.totalGainLoss || 0) >= 0 ? '#10b981' : '#ef4444' }]}>
                  {(portfolio.totalGainLoss || 0) >= 0 ? '+' : ''}{formatCurrency(portfolio.totalGainLoss || 0)}
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyPortfolio}>
              <Text style={styles.emptyText}>No investments yet</Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Investments' as never)}
                style={styles.addInvestmentButton}
              >
                Add Investment
              </Button>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Recent Activity */}
      <Card style={styles.activityCard}>
        <Card.Content>
          <Title>Quick Actions</Title>
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Budget' as never)}
              style={styles.actionButton}
            >
              View Budget
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Goals' as never)}
              style={styles.actionButton}
            >
              Set Goals
            </Button>
          </View>
        </Card.Content>
      </Card>
    </Animated.ScrollView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: 'white',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
  },
  actionCard: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  actionText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 12,
    letterSpacing: 0.3,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  statTitle: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  portfolioCard: {
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  portfolioStats: {
    alignItems: 'center',
    marginTop: 20,
  },
  portfolioValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: 0.5,
  },
  portfolioLabel: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 6,
    fontWeight: '500',
  },
  portfolioChange: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 6,
    letterSpacing: 0.3,
  },
  emptyPortfolio: {
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 17,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  addInvestmentButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  activityCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 6,
  },
  refreshButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  refreshText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  refreshTextDisabled: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  debugContainer: {
    padding: 16,
    backgroundColor: '#f0f0f0',
    margin: 16,
    borderRadius: 8,
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});

export default DashboardScreen;