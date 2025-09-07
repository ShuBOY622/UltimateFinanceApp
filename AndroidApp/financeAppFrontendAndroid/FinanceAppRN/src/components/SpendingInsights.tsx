import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Card, Avatar, Chip } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

interface SpendingInsightsProps {
  summaryData: any;
  portfolioData: any;
  transactions: any[];
  lastMonthData?: any;
}

const SpendingInsights: React.FC<SpendingInsightsProps> = ({
  summaryData,
  portfolioData,
  transactions,
  lastMonthData,
}) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [animatedValues] = useState(insights.map(() => new Animated.Value(0)));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatCompactCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
    return formatCurrency(amount);
  };

  const getMonthName = (monthOffset = 0) => {
    const date = new Date();
    date.setMonth(date.getMonth() - monthOffset);
    return date.toLocaleDateString('en-IN', { month: 'long' });
  };

  useEffect(() => {
    if (!summaryData) return;

    const generateInsights = () => {
      const newInsights = [];
      const currentMonthSpending = summaryData.monthlyExpenses || 0;
      const lastMonthSpending = lastMonthData?.monthlyExpenses || 0;
      const monthName = getMonthName(0);
      const lastMonthName = getMonthName(1);

      // Spending Insights
      if (currentMonthSpending > 0) {
        newInsights.push({
          icon: 'attach-money',
          color: '#ef4444',
          title: 'Total Spending This Month',
          value: `You spent ${formatCurrency(currentMonthSpending)} in ${monthName}.`,
          type: 'spending'
        });

        // Month-over-month comparison
        if (lastMonthSpending > 0) {
          const changePercent = parseFloat(((currentMonthSpending - lastMonthSpending) / lastMonthSpending * 100).toFixed(1));
          const isIncrease = currentMonthSpending > lastMonthSpending;
          newInsights.push({
            icon: isIncrease ? 'trending-up' : 'trending-down',
            color: isIncrease ? '#ef4444' : '#10b981',
            title: 'Month-over-Month Change',
            value: `Your spending ${isIncrease ? 'increased' : 'decreased'} by ${Math.abs(changePercent)}% compared to ${lastMonthName}.`,
            type: 'comparison'
          });
        }

        // Daily average
        const daysInMonth = new Date().getDate();
        const dailyAverage = currentMonthSpending / daysInMonth;
        newInsights.push({
          icon: 'timeline',
          color: '#667eea',
          title: 'Daily Average Spend',
          value: `On average, you spent ${formatCurrency(dailyAverage)}/day this month.`,
          type: 'average'
        });
      }

      // Category breakdown insights
      if (summaryData.expensesByCategory && summaryData.expensesByCategory.length > 0) {
        const sortedCategories = [...summaryData.expensesByCategory]
          .sort((a: any, b: any) => b[1] - a[1])
          .slice(0, 3);

        if (sortedCategories.length > 0) {
          const topCategory = sortedCategories[0];
          const percentage = ((topCategory[1] / currentMonthSpending) * 100).toFixed(0);
          newInsights.push({
            icon: 'assessment',
            color: '#f59e0b',
            title: 'Top Spending Category',
            value: `${topCategory[0].replace('_', ' & ')}: ${formatCurrency(topCategory[1])} (${percentage}% of total).`,
            type: 'category'
          });

          if (sortedCategories.length >= 3) {
            const top3Names = sortedCategories.map((cat: any) => cat[0].replace('_', ' & ')).join(', ');
            newInsights.push({
              icon: 'show-chart',
              color: '#8b5cf6',
              title: 'Top 3 Spending Categories',
              value: `Most spent on ${top3Names.replace(/, ([^,]*)$/, ', and $1')}.`,
              type: 'top3'
            });
          }
        }
      }

      // Highest transaction insight
      if (transactions && transactions.length > 0) {
        const expenseTransactions = transactions.filter((t: any) => t.type === 'EXPENSE');
        if (expenseTransactions.length > 0) {
          const highestExpense = expenseTransactions.reduce((max: any, current: any) =>
            current.amount > max.amount ? current : max
          );
          newInsights.push({
            icon: 'trending-up',
            color: '#ef4444',
            title: 'Biggest Purchase',
            value: `Largest expense: ${formatCurrency(highestExpense.amount)} on ${highestExpense.category?.replace('_', ' & ')}.`,
            type: 'highest'
          });
        }
      }

      // Investment Insights
      if (portfolioData && portfolioData.totalHoldings > 0) {
        newInsights.push({
          icon: 'auto-graph',
          color: '#10b981',
          title: 'Total Investment Value',
          value: `Your investments are worth ${formatCompactCurrency(portfolioData.currentValue)}.`,
          type: 'investment'
        });

        if (portfolioData.totalGainLoss !== undefined) {
          const isProfit = portfolioData.totalGainLoss >= 0;
          const gainLossPercent = portfolioData.gainLossPercentage || 0;
          newInsights.push({
            icon: isProfit ? 'trending-up' : 'trending-down',
            color: isProfit ? '#10b981' : '#ef4444',
            title: 'Investment Performance',
            value: `Portfolio ${isProfit ? 'gained' : 'dropped'} by ${isProfit ? '+' : ''}${gainLossPercent.toFixed(1)}% this month.`,
            type: 'performance'
          });
        }

        // Holdings count
        newInsights.push({
          icon: 'assessment',
          color: '#667eea',
          title: 'Portfolio Diversification',
          value: `You have ${portfolioData.totalHoldings} active holdings across different assets.`,
          type: 'diversification'
        });
      }

      // Savings Rate Insight
      if (summaryData.savingsRate !== undefined) {
        const savingsRate = summaryData.savingsRate;
        const rateColor = savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#ef4444';
        newInsights.push({
          icon: 'savings',
          color: rateColor,
          title: 'Savings Rate',
          value: `You saved ${Math.max(0, savingsRate).toFixed(1)}% of your income this month.`,
          type: 'savings'
        });
      }

      setInsights(newInsights.slice(0, 6)); // Limit to 6 insights for better UX
    };

    generateInsights();
  }, [summaryData, portfolioData, transactions, lastMonthData]);

  // Animate insights when they change
  useEffect(() => {
    insights.forEach((_, index) => {
      Animated.timing(animatedValues[index] || new Animated.Value(0), {
        toValue: 1,
        duration: 500,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, [insights, animatedValues]);

  if (insights.length === 0) {
    return (
      <Card style={styles.emptyContainer}>
        <View style={styles.emptyContent}>
          <Avatar.Icon
            size={48}
            icon="assessment"
            style={{ backgroundColor: '#e2e8f0' }}
            color="#64748b"
          />
          <Text style={styles.emptyTitle}>No Insights Available</Text>
          <Text style={styles.emptySubtitle}>
            Add transactions and investments to see personalized financial insights
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {insights.map((insight, index) => (
        <Animated.View
          key={`${insight.type}-${index}`}
          style={[
            styles.insightCard,
            {
              opacity: animatedValues[index] || 1,
              transform: [{
                translateY: animatedValues[index]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }) || 0,
              }],
            },
          ]}
        >
          <LinearGradient
            colors={[`${insight.color}15`, `${insight.color}08`]}
            style={styles.insightGradient}
          >
            <View style={styles.insightContent}>
              <Avatar.Icon
                size={40}
                icon={insight.icon}
                style={[styles.insightIcon, { backgroundColor: `${insight.color}20` }]}
                color={insight.color}
              />
              <View style={styles.insightText}>
                <Text style={[styles.insightTitle, { color: insight.color }]}>
                  {insight.title}
                </Text>
                <Text style={styles.insightValue}>
                  {insight.value}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    margin: 16,
    borderRadius: 12,
  },
  emptyContent: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  insightCard: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightGradient: {
    borderRadius: 12,
    padding: 16,
  },
  insightContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  insightIcon: {
    marginRight: 12,
  },
  insightText: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightValue: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default SpendingInsights;