import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ScrollView,
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
  Chip,
  IconButton,
  Searchbar,
  List,
  Divider,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useDashboard } from '../contexts/DashboardContext';

const BASE_URL = 'http://192.168.1.2:8080'; // User's actual IP address

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

interface Investment {
  id: number;
  symbol: string;
  name: string;
  type: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  totalInvestment: number;
  currentValue: number;
  sector?: string;
  purchaseDate: string;
  livePriceEnabled?: boolean;
  priceSource?: string;
  lastPriceUpdate?: string;
}

interface PortfolioSummary {
  totalInvestment: number;
  currentValue: number;
  totalGainLoss: number;
  totalHoldings: number;
}

const InvestmentsScreen = () => {
  const navigation = useNavigation();
  const { refreshDashboard } = useDashboard();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

  // Form state
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState('STOCK');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sector, setSector] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  // Stock search state
  const [stockSearchQuery, setStockSearchQuery] = useState('');
  const [stockSuggestions, setStockSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [popularStocks, setPopularStocks] = useState<any[]>([]);
  const [updatingPrices, setUpdatingPrices] = useState(false);

  const investmentTypes = [
    { value: 'STOCK', label: 'Stock' },
    { value: 'MUTUAL_FUND', label: 'Mutual Fund' },
    { value: 'ETF', label: 'ETF' },
    { value: 'BOND', label: 'Bond' },
    { value: 'CRYPTO', label: 'Cryptocurrency' },
    { value: 'GOLD', label: 'Gold' },
    { value: 'REAL_ESTATE', label: 'Real Estate' },
    { value: 'OTHER', label: 'Other' },
  ];

  useEffect(() => {
    fetchInvestments();
    fetchPortfolioSummary();
    fetchPopularStocks();
  }, []);

  const fetchInvestments = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/investments`);
      setInvestments(response.data);
    } catch (error) {
      console.error('Error fetching investments:', error);
      Alert.alert('Error', 'Failed to load investments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchPortfolioSummary = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/investments/portfolio/summary`);
      setPortfolioSummary(response.data);
    } catch (error) {
      console.error('Error fetching portfolio summary:', error);
    }
  };

  const fetchPopularStocks = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/investments/suggestions`);
      setPopularStocks(response.data.slice(0, 10)); // Get first 10 popular stocks
    } catch (error) {
      console.error('Error fetching popular stocks:', error);
      // Set some default popular stocks if API fails
      setPopularStocks([
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd', type: 'STOCK' },
        { symbol: 'TCS', name: 'Tata Consultancy Services Ltd', type: 'STOCK' },
        { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd', type: 'STOCK' },
        { symbol: 'ICICIBANK', name: 'ICICI Bank Ltd', type: 'STOCK' },
        { symbol: 'INFY', name: 'Infosys Ltd', type: 'STOCK' },
      ]);
    }
  };

  const searchStocks = async (query: string) => {
    if (!query || query.trim().length < 1) {
      setStockSuggestions([]);
      setShowSuggestions(false);
      setLoadingSuggestions(false);
      return;
    }

    // Show loading immediately for better UX
    setLoadingSuggestions(true);

    try {
      console.log('🔍 Searching for stocks with query:', query);
      console.log('🌐 API URL:', `${BASE_URL}/api/investments/search-stocks?query=${encodeURIComponent(query.trim())}`);

      const response = await axios.get(`${BASE_URL}/api/investments/search-stocks?query=${encodeURIComponent(query.trim())}`);
      console.log('✅ Search response status:', response.status);
      console.log('📊 Search response data:', response.data);

      const suggestions = response.data || [];

      // Always show suggestions container, even if empty (to show "no results")
      setStockSuggestions(suggestions);
      setShowSuggestions(true);

      console.log(`📈 Found ${suggestions.length} suggestions for "${query}"`);
    } catch (error: any) {
      console.error('❌ Error searching stocks:', error);
      console.error('❌ Error details:', error.response?.data || error.message);

      setStockSuggestions([]);
      setShowSuggestions(true); // Show container with "no results" message
      // Don't show error alert for search failures, just hide suggestions
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Test function to verify backend connectivity
  const testBackendConnection = async () => {
    try {
      console.log('🧪 Testing backend connection...');
      console.log('🌐 Testing URL:', `${BASE_URL}/api/investments/search-stocks?query=test`);

      const response = await axios.get(`${BASE_URL}/api/investments/search-stocks?query=test`);
      console.log('✅ Backend connection successful:', response.status);
      console.log('📊 Response data:', response.data);

      Alert.alert(
        'Backend Connected!',
        `✅ Status: ${response.status}\n📊 Results: ${response.data?.length || 0} items\n🌐 URL: ${BASE_URL}`
      );
    } catch (error: any) {
      console.error('❌ Backend connection failed:', error);
      console.error('❌ Error details:', error.response?.data || error.message);

      const errorMessage = error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.message ||
                          'Unknown error';

      Alert.alert(
        'Connection Failed',
        `❌ Cannot connect to backend\n\nError: ${errorMessage}\n\nURL: ${BASE_URL}\n\nMake sure:\n• Backend server is running\n• Correct IP address\n• Port 8080 is accessible`
      );
    }
  };

  const handleStockSelect = async (stock: any) => {
    setSymbol(stock.symbol);
    setName(stock.name);
    setType(stock.type || 'STOCK');
    setSector(stock.sector || '');
    setStockSearchQuery(`${stock.symbol} - ${stock.name}`);
    setShowSuggestions(false);

    // Try to fetch current price
    try {
      const priceResponse = await axios.get(`${BASE_URL}/api/investments/current-price/${stock.symbol}`);
      if (priceResponse.data?.price) {
        setPurchasePrice(priceResponse.data.price.toString());
        Alert.alert('Success', `Current price fetched: ₹${priceResponse.data.price}`);
      }
    } catch (error) {
      console.log('Could not fetch current price:', error);
    }
  };

  const handlePopularStockSelect = (stock: any) => {
    handleStockSelect(stock);
  };

  const toggleLivePrice = async (investmentId: number, enabled: boolean) => {
    try {
      await axios.post(`${BASE_URL}/api/investments/${investmentId}/toggle-live-price?enabled=${enabled}`);
      fetchInvestments();
      fetchPortfolioSummary();
      Alert.alert('Success', `Live price ${enabled ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      console.error('Error toggling live price:', error);
      Alert.alert('Error', 'Failed to toggle live price');
    }
  };

  const refreshSinglePrice = async (investmentId: number) => {
    try {
      await axios.post(`${BASE_URL}/api/investments/${investmentId}/refresh-price`);
      fetchInvestments();
      fetchPortfolioSummary();
      Alert.alert('Success', 'Price refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing price:', error);
      Alert.alert('Error', 'Failed to refresh price');
    }
  };

  const updateMarketPrices = async () => {
    try {
      setUpdatingPrices(true);
      await axios.post(`${BASE_URL}/api/investments/trigger-price-update`);
      fetchInvestments();
      fetchPortfolioSummary();
      Alert.alert('Success', 'Market prices updated successfully!');
    } catch (error) {
      console.error('Error updating market prices:', error);
      Alert.alert('Error', 'Failed to update market prices');
    } finally {
      setUpdatingPrices(false);
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

  const handleAddInvestment = () => {
    setEditingInvestment(null);
    setSymbol('');
    setName('');
    setType('STOCK');
    setQuantity('');
    setPurchasePrice('');
    setSector('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setStockSearchQuery('');
    setStockSuggestions([]);
    setShowSuggestions(false);
    setModalVisible(true);
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditingInvestment(investment);
    setSymbol(investment.symbol);
    setName(investment.name);
    setType(investment.type);
    setQuantity(investment.quantity.toString());
    setPurchasePrice(investment.purchasePrice.toString());
    setSector(investment.sector || '');
    setStockSearchQuery(`${investment.symbol} - ${investment.name}`);
    setStockSuggestions([]);
    setShowSuggestions(false);
    try {
      const date = investment.purchaseDate ? new Date(investment.purchaseDate) : new Date();
      setPurchaseDate(date.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Date parsing error:', error);
      setPurchaseDate(new Date().toISOString().split('T')[0]);
    }
    setModalVisible(true);
  };

  const handleDeleteInvestment = (investment: Investment) => {
    Alert.alert(
      'Delete Investment',
      'Are you sure you want to delete this investment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/api/investments/${investment.id}`);
              fetchInvestments();
              fetchPortfolioSummary();
              await refreshDashboard(); // Refresh dashboard data
              Alert.alert('Success', 'Investment deleted successfully');
            } catch (error) {
              console.error('Error deleting investment:', error);
              Alert.alert('Error', 'Failed to delete investment');
            }
          },
        },
      ]
    );
  };

  const handleSaveInvestment = async () => {
    if (!symbol || !name || !quantity || !purchasePrice) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const investmentData = {
      symbol: symbol.trim().toUpperCase(),
      name: name.trim(),
      type,
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
      purchaseDate: formatDateForBackend(purchaseDate),
      sector: sector.trim() || null,
    };

    try {
      if (editingInvestment) {
        await axios.put(`${BASE_URL}/api/investments/${editingInvestment.id}`, investmentData);
        Alert.alert('Success', 'Investment updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/investments`, investmentData);
        Alert.alert('Success', 'Investment added successfully');
      }
      setModalVisible(false);
      fetchInvestments();
      fetchPortfolioSummary();
      await refreshDashboard(); // Refresh dashboard data
    } catch (error) {
      console.error('Error saving investment:', error);
      Alert.alert('Error', 'Failed to save investment');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInvestments();
    fetchPortfolioSummary();
  };

  const renderInvestment = ({ item }: { item: Investment }) => {
    const gainLoss = item.currentValue - item.totalInvestment;
    const gainLossPercentage = ((gainLoss / item.totalInvestment) * 100);
    const isProfit = gainLoss >= 0;

    return (
      <Surface style={styles.investmentCard} elevation={2}>
        <View style={styles.investmentHeader}>
          <View style={styles.investmentInfo}>
            <Text style={styles.investmentSymbol}>{item.symbol}</Text>
            <Text style={styles.investmentName}>{item.name}</Text>
            <View style={styles.investmentMeta}>
              <Chip style={styles.chip}>{item.type.replace('_', ' ')}</Chip>
              {item.sector && <Chip style={styles.chip}>{item.sector}</Chip>}
            </View>
          </View>
          <View style={styles.investmentActions}>
            <IconButton
              icon="refresh"
              size={20}
              onPress={() => refreshSinglePrice(item.id)}
            />
            <IconButton
              icon={item.livePriceEnabled ? "toggle-switch" : "toggle-switch-off"}
              size={20}
              onPress={() => toggleLivePrice(item.id, !item.livePriceEnabled)}
            />
            <IconButton
              icon="pencil"
              size={20}
              onPress={() => handleEditInvestment(item)}
            />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeleteInvestment(item)}
            />
          </View>
        </View>

        <View style={styles.investmentDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quantity:</Text>
            <Text style={styles.detailValue}>{item.quantity}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Purchase Price:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.purchasePrice)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Price:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.currentPrice)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Investment:</Text>
            <Text style={styles.detailValue}>{formatCurrency(item.totalInvestment)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Value:</Text>
            <Text style={[styles.detailValue, { color: isProfit ? '#10b981' : '#ef4444' }]}>
              {formatCurrency(item.currentValue)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Gain/Loss:</Text>
            <Text style={[styles.detailValue, { color: isProfit ? '#10b981' : '#ef4444' }]}>
              {isProfit ? '+' : ''}{formatCurrency(gainLoss)} ({gainLossPercentage.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </Surface>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No investments yet</Text>
      <Text style={styles.emptySubtext}>Start building your portfolio</Text>
    </View>
  );

  const renderPortfolioSummary = () => {
    if (!portfolioSummary) return null;

    return (
      <View style={styles.summaryContainer}>
        <Surface style={[styles.summaryCard, { backgroundColor: '#6366f1' }]} elevation={3}>
          <Text style={styles.summaryValue}>{formatCurrency(portfolioSummary.totalInvestment)}</Text>
          <Text style={styles.summaryLabel}>Total Investment</Text>
        </Surface>

        <Surface style={[styles.summaryCard, { backgroundColor: '#10b981' }]} elevation={3}>
          <Text style={styles.summaryValue}>{formatCurrency(portfolioSummary.currentValue)}</Text>
          <Text style={styles.summaryLabel}>Current Value</Text>
        </Surface>

        <Surface style={[styles.summaryCard, { backgroundColor: portfolioSummary.totalGainLoss >= 0 ? '#10b981' : '#ef4444' }]} elevation={3}>
          <Text style={styles.summaryValue}>{formatCurrency(portfolioSummary.totalGainLoss)}</Text>
          <Text style={styles.summaryLabel}>Total Gain/Loss</Text>
        </Surface>

        <Surface style={[styles.summaryCard, { backgroundColor: '#f59e0b' }]} elevation={3}>
          <Text style={styles.summaryValue}>{portfolioSummary.totalHoldings}</Text>
          <Text style={styles.summaryLabel}>Holdings</Text>
        </Surface>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading investments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Title>Investments</Title>
            <Paragraph>Track your portfolio performance</Paragraph>
          </View>
          <View style={styles.headerButtons}>
            <Button
              mode="outlined"
              onPress={testBackendConnection}
              style={styles.testConnectionButton}
            >
              Test API
            </Button>
            <Button
              mode="outlined"
              onPress={updateMarketPrices}
              loading={updatingPrices}
              disabled={updatingPrices}
              style={styles.updatePricesButton}
            >
              {updatingPrices ? 'Updating...' : 'Update Prices'}
            </Button>
          </View>
        </View>
      </View>

      {/* Portfolio Summary */}
      {renderPortfolioSummary()}

      {/* Investments List */}
      <FlatList
        data={investments}
        renderItem={renderInvestment}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.listContainer}
      />

      {/* Add Investment FAB */}
      <FAB
        icon="plus"
        onPress={handleAddInvestment}
        style={styles.fab}
      />

      {/* Add/Edit Investment Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={4}>
            <Title style={styles.modalTitle}>
              {editingInvestment ? 'Edit Investment' : 'Add Investment'}
            </Title>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              {/* Stock Search Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Stock Search</Text>
                <Searchbar
                  placeholder="Search stocks (e.g., RELIANCE, TCS...)"
                  onChangeText={(query) => {
                    setStockSearchQuery(query);
                    // Clear suggestions immediately when query is empty
                    if (!query || query.trim().length === 0) {
                      setStockSuggestions([]);
                      setShowSuggestions(false);
                      setLoadingSuggestions(false);
                    } else {
                      searchStocks(query);
                    }
                  }}
                  value={stockSearchQuery}
                  style={styles.searchBar}
                  loading={loadingSuggestions}
                />

                {/* Stock Suggestions */}
                {showSuggestions && (
                  <Surface style={styles.suggestionsContainer} elevation={2}>
                    {stockSuggestions.length > 0 ? (
                      <ScrollView style={{ maxHeight: 150 }}>
                        {stockSuggestions.slice(0, 5).map((stock, index) => (
                          <TouchableOpacity
                            key={`${stock.symbol}-${index}`}
                            onPress={() => handleStockSelect(stock)}
                            style={styles.suggestionItem}
                          >
                            <List.Item
                              title={`${stock.symbol} - ${stock.name}`}
                              description={stock.sector ? `Sector: ${stock.sector}` : undefined}
                              left={props => <List.Icon {...props} icon="trending-up" />}
                              titleStyle={styles.suggestionTitle}
                              descriptionStyle={styles.suggestionDescription}
                            />
                            {index < Math.min(stockSuggestions.length - 1, 4) && <Divider />}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    ) : (
                      <View style={styles.noResultsContainer}>
                        <Text style={styles.noResultsText}>No stocks found</Text>
                        <Text style={styles.noResultsSubtext}>Try a different search term</Text>
                      </View>
                    )}
                  </Surface>
                )}

                {/* Popular Stocks */}
                {!showSuggestions && popularStocks.length > 0 && (
                  <View style={styles.popularStocksContainer}>
                    <Text style={styles.popularStocksTitle}>Popular Stocks:</Text>
                    <View style={styles.popularStocksGrid}>
                      {popularStocks.slice(0, 6).map((stock, index) => (
                        <Chip
                          key={index}
                          mode="outlined"
                          onPress={() => handlePopularStockSelect(stock)}
                          style={styles.popularStockChip}
                          textStyle={styles.popularStockText}
                        >
                          {stock.symbol}
                        </Chip>
                      ))}
                    </View>
                  </View>
                )}
              </View>

              {/* Investment Details Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Investment Details</Text>

                <View style={styles.row}>
                  <TextInput
                    label="Symbol"
                    value={symbol}
                    onChangeText={setSymbol}
                    style={[styles.input, styles.halfInput]}
                    autoCapitalize="characters"
                  />
                  <TextInput
                    label="Name"
                    value={name}
                    onChangeText={setName}
                    style={[styles.input, styles.halfInput]}
                  />
                </View>

                <View style={styles.row}>
                  <TextInput
                    label="Quantity"
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    style={[styles.input, styles.halfInput]}
                  />
                  <TextInput
                    label="Purchase Price"
                    value={purchasePrice}
                    onChangeText={setPurchasePrice}
                    keyboardType="numeric"
                    style={[styles.input, styles.halfInput]}
                  />
                </View>

                <TextInput
                  label="Sector (Optional)"
                  value={sector}
                  onChangeText={setSector}
                  style={styles.input}
                />

                <TextInput
                  label="Purchase Date"
                  value={purchaseDate}
                  onChangeText={setPurchaseDate}
                  style={styles.input}
                />
              </View>
            </ScrollView>

            {/* Fixed Action Buttons */}
            <View style={styles.modalActions}>
              <Button onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveInvestment}
                disabled={!symbol || !name || !quantity || !purchasePrice}
              >
                {editingInvestment ? 'Update' : 'Add'}
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  testConnectionButton: {
    marginLeft: 16,
  },
  updatePricesButton: {
    marginLeft: 8,
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
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  investmentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  investmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  investmentName: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  investmentMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    height: 24,
  },
  investmentActions: {
    flexDirection: 'row',
  },
  investmentDetails: {
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366f1',
  },
  modalContainer: {
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  modalScrollView: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    marginBottom: 16,
    flex: 1,
  },
  halfInput: {
    flex: 0.48,
  },
  suggestionTitle: {
    fontSize: 14,
  },
  suggestionDescription: {
    fontSize: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  cancelButton: {
    marginRight: 8,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  suggestionsContainer: {
    marginBottom: 16,
    borderRadius: 8,
    maxHeight: 200,
  },
  suggestionItem: {
    paddingHorizontal: 8,
  },
  popularStocksContainer: {
    marginBottom: 16,
  },
  popularStocksTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  popularStocksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  popularStockChip: {
    marginBottom: 4,
  },
  popularStockText: {
    fontSize: 12,
  },
  noResultsContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

export default InvestmentsScreen;