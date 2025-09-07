import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Card, Avatar, Chip, SegmentedButtons } from 'react-native-paper';
import { PieChart, BarChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

interface SpendingChartProps {
  data: any;
  height?: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

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
  OTHER_EXPENSE: 'shopping-cart'
};

const SpendingChart: React.FC<SpendingChartProps> = ({ data, height = 400 }) => {
  const [chartType, setChartType] = useState('pie');
  const [spendingData, setSpendingData] = useState<any[]>([]);

  useEffect(() => {
    if (data && data.expensesByCategory) {
      processSpendingData(data.expensesByCategory);
    } else {
      setSpendingData([]);
    }
  }, [data]);

  const processSpendingData = (expensesByCategory: any) => {
    if (!expensesByCategory) {
      setSpendingData([]);
      return;
    }

    let dataArray = [];

    if (Array.isArray(expensesByCategory)) {
      dataArray = expensesByCategory;
    } else if (typeof expensesByCategory === 'object') {
      dataArray = Object.entries(expensesByCategory);
    } else {
      setSpendingData([]);
      return;
    }

    const totalSpending = dataArray.reduce((sum: number, [category, amount]: [string, any]) => {
      const numericAmount = parseFloat(amount) || 0;
      return sum + numericAmount;
    }, 0);

    const processedData = dataArray.map(([category, amount]: [string, any], index: number) => {
      const value = parseFloat(amount) || 0;
      const percentage = totalSpending > 0 ? (value / totalSpending) * 100 : 0;

      return {
        name: formatCategoryName(category),
        value: value,
        category: category,
        color: COLORS[index % COLORS.length],
        icon: CATEGORY_ICONS[category] || 'shopping-cart',
        percentage: percentage,
        legendFontColor: '#374151',
        legendFontSize: 12,
      };
    }).filter((item: any) => item.value > 0);

    setSpendingData(processedData);
  };

  const formatCategoryName = (category: string) => {
    return category.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getTotalSpending = () => {
    return spendingData.reduce((sum: number, item: any) => sum + item.value, 0);
  };

  const getTopSpendingCategory = () => {
    if (spendingData.length === 0) return null;
    return spendingData.reduce((max: any, item: any) => item.value > max.value ? item : max);
  };

  const renderPieChart = () => {
    if (!spendingData || spendingData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Avatar.Icon
            size={60}
            icon="pie-chart"
            style={{ backgroundColor: '#e2e8f0' }}
            color="#64748b"
          />
          <Text style={styles.emptyTitle}>No spending data available</Text>
          <Text style={styles.emptySubtitle}>
            Add some expense transactions to see your spending breakdown
          </Text>
        </View>
      );
    }

    const sortedData = [...spendingData].sort((a: any, b: any) => b.value - a.value);
    const topCategories = sortedData.slice(0, 6);
    const otherCategories = sortedData.slice(6);
    const otherTotal = otherCategories.reduce((sum: number, item: any) => sum + item.value, 0);

    const pieData = otherTotal > 0
      ? [...topCategories, {
          name: 'Others',
          value: otherTotal,
          category: 'OTHERS',
          color: '#64748b',
          icon: 'shopping-cart',
          percentage: (otherTotal / getTotalSpending()) * 100,
          legendFontColor: '#374151',
          legendFontSize: 12,
        }]
      : topCategories;

    const chartConfig = {
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.5,
      useShadowColorFromDataset: false,
    };

    return (
      <View style={styles.chartContainer}>
        <View style={styles.pieChartContainer}>
          <PieChart
            data={pieData}
            width={width - 80}
            height={220}
            chartConfig={chartConfig}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            hasLegend={false}
          />
        </View>

        <ScrollView style={styles.legendContainer} showsVerticalScrollIndicator={false}>
          {topCategories.map((item: any, index: number) => (
            <View key={item.category} style={styles.legendItem}>
              <View style={styles.legendLeft}>
                <Avatar.Icon
                  size={32}
                  icon={item.icon}
                  style={[styles.categoryIcon, { backgroundColor: `${item.color}20` }]}
                  color={item.color}
                />
                <View style={styles.legendText}>
                  <Text style={styles.categoryName}>{item.name}</Text>
                  <Text style={styles.categoryPercentage}>
                    {item.percentage?.toFixed(1) || 0}% of total
                  </Text>
                </View>
              </View>
              <Text style={[styles.categoryAmount, { color: item.color }]}>
                {formatCurrency(item.value)}
              </Text>
            </View>
          ))}

          {otherTotal > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.legendItem}>
                <View style={styles.legendLeft}>
                  <Avatar.Icon
                    size={32}
                    icon="shopping-cart"
                    style={[styles.categoryIcon, { backgroundColor: '#64748b20' }]}
                    color="#64748b"
                  />
                  <View style={styles.legendText}>
                    <Text style={styles.categoryName}>
                      Others ({otherCategories.length} items)
                    </Text>
                    <Text style={styles.categoryPercentage}>
                      {((otherTotal / getTotalSpending()) * 100).toFixed(1)}% of total
                    </Text>
                  </View>
                </View>
                <Text style={[styles.categoryAmount, { color: '#64748b' }]}>
                  {formatCurrency(otherTotal)}
                </Text>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderBarChart = () => {
    if (!spendingData || spendingData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Avatar.Icon
            size={60}
            icon="show-chart"
            style={{ backgroundColor: '#e2e8f0' }}
            color="#64748b"
          />
          <Text style={styles.emptyTitle}>No spending data available</Text>
          <Text style={styles.emptySubtitle}>
            Add some expense transactions to see your spending breakdown
          </Text>
        </View>
      );
    }

    const sortedData = [...spendingData].sort((a: any, b: any) => b.value - a.value);
    const topCategories = sortedData.slice(0, 8);

    const barData = {
      labels: topCategories.map((item: any) => item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name),
      datasets: [{
        data: topCategories.map((item: any) => item.value),
        colors: topCategories.map((item: any, index: number) => () => COLORS[index % COLORS.length]),
      }],
    };

    const chartConfig = {
      backgroundGradientFrom: '#ffffff',
      backgroundGradientTo: '#ffffff',
      color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      strokeWidth: 2,
      barPercentage: 0.7,
      useShadowColorFromDataset: false,
      decimalPlaces: 0,
      labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
      style: {
        borderRadius: 16,
      },
      propsForLabels: {
        fontSize: 10,
      },
    };

    return (
      <View style={styles.chartContainer}>
        <BarChart
          data={barData}
          width={width - 60}
          height={280}
          chartConfig={chartConfig}
          verticalLabelRotation={30}
          showValuesOnTopOfBars={true}
          withInnerLines={false}
          yAxisLabel=""
          yAxisSuffix=""
          style={styles.barChart}
        />

        {spendingData.length > 8 && (
          <Text style={styles.chartNote}>
            Showing top 8 of {spendingData.length} categories
          </Text>
        )}
      </View>
    );
  };

  return (
    <Card style={[styles.container, { height }]}>
      <LinearGradient
        colors={['#f87171', '#fb923c']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Avatar.Icon
            size={32}
            icon="trending-down"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            color="#ffffff"
          />
          <Text style={styles.title}>Spending by Category</Text>
          {spendingData.length > 0 && (
            <Chip
              style={styles.totalChip}
              textStyle={styles.totalChipText}
            >
              Total: {formatCurrency(getTotalSpending())}
            </Chip>
          )}
        </View>
      </LinearGradient>

      <View style={styles.chartTypeSelector}>
        <SegmentedButtons
          value={chartType}
          onValueChange={setChartType}
          buttons={[
            { value: 'pie', label: 'Pie Chart' },
            { value: 'bar', label: 'Bar Chart' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <View style={styles.chartWrapper}>
        {chartType === 'pie' ? renderPieChart() : renderBarChart()}
      </View>

      {spendingData.length > 0 && (
        <View style={styles.insightsContainer}>
          <View style={styles.insightRow}>
            <Chip
              icon="trending-up"
              style={styles.insightChip}
              textStyle={styles.insightChipText}
            >
              Top: {getTopSpendingCategory()?.name || 'N/A'}
            </Chip>
            <Chip
              icon="equalizer"
              style={styles.insightChip}
              textStyle={styles.insightChipText}
            >
              Avg: {formatCurrency(getTotalSpending() / spendingData.length)}
            </Chip>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
    flex: 1,
  },
  totalChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderColor: 'rgba(255,255,255,0.3)',
  },
  totalChipText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  chartTypeSelector: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  segmentedButtons: {
    backgroundColor: '#f8fafc',
  },
  chartWrapper: {
    flex: 1,
    padding: 16,
  },
  chartContainer: {
    flex: 1,
  },
  pieChartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  legendContainer: {
    maxHeight: 200,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: 12,
  },
  legendText: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  categoryPercentage: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  barChart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  chartNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
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
  insightsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 8,
  },
  insightChip: {
    backgroundColor: '#f3f4f6',
    borderColor: '#d1d5db',
  },
  insightChipText: {
    color: '#374151',
    fontSize: 12,
  },
});

export default SpendingChart;