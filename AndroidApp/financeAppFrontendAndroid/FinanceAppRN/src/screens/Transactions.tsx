import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated,
  ScrollView,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  FAB,
  Searchbar,
  Chip,
  Surface,
  Portal,
  Modal,
  TextInput,
  HelperText,
  SegmentedButtons,
  IconButton,
  Avatar,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { format } from 'date-fns';
import { useDashboard } from '../contexts/DashboardContext';
import StatementUpload from '../components/StatementUpload';
import SpendingChart from '../components/SpendingChart';
import MonthlyTransactions from '../components/MonthlyTransactions';

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

interface Transaction {
  id: number;
  amount: number;
  description: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  transactionDate: string;
}

const TransactionsScreen = () => {
  const navigation = useNavigation();
  const { refreshDashboard } = useDashboard();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [statementUploadVisible, setStatementUploadVisible] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [tabValue, setTabValue] = useState('0'); // '0' for all transactions, '1' for monthly view
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Animation values
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Form state
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [category, setCategory] = useState('OTHER_EXPENSE');
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0]);

  const categories = {
    INCOME: [
      { value: 'SALARY', label: 'Salary' },
      { value: 'FREELANCE', label: 'Freelance' },
      { value: 'INVESTMENT', label: 'Investment' },
      { value: 'BUSINESS', label: 'Business' },
      { value: 'OTHER_INCOME', label: 'Other Income' },
    ],
    EXPENSE: [
      { value: 'FOOD', label: 'Food' },
      { value: 'TRANSPORTATION', label: 'Transportation' },
      { value: 'ENTERTAINMENT', label: 'Entertainment' },
      { value: 'SHOPPING', label: 'Shopping' },
      { value: 'UTILITIES', label: 'Utilities' },
      { value: 'HEALTHCARE', label: 'Healthcare' },
      { value: 'EDUCATION', label: 'Education' },
      { value: 'TRAVEL', label: 'Travel' },
      { value: 'RENT', label: 'Rent' },
      { value: 'INSURANCE', label: 'Insurance' },
      { value: 'OTHER_EXPENSE', label: 'Other Expense' },
    ],
  };

  useEffect(() => {
    fetchTransactions();
    fetchSummaryData();

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
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchQuery, filterType, filterCategory]);

  // Debug: Log when transactions state changes
  useEffect(() => {
    console.log('Transactions state updated:', transactions.length, 'items');
    console.log('Filtered transactions:', filteredTransactions.length, 'items');
    console.log('Current page:', page, 'Rows per page:', rowsPerPage);
    console.log('Displayed items:', filteredTransactions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length);
  }, [transactions, filteredTransactions, page, rowsPerPage]);

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions from:', `${BASE_URL}/api/transactions`);
      const response = await axios.get(`${BASE_URL}/api/transactions`);
      console.log('Transactions response status:', response.status);
      console.log('Transactions response data:', response.data);
      console.log('Transactions data type:', typeof response.data);
      console.log('Transactions data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');

      const transactionData = Array.isArray(response.data) ? response.data : [];
      console.log('Setting transactions:', transactionData.length, 'items');
      setTransactions(transactionData);
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);

      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          error.message ||
                          'Unknown error occurred';

      console.error('Error message:', errorMessage);
      setError(`Failed to load transactions: ${errorMessage}`);
      setTransactions([]); // Set empty array on error

      // Don't show alert on refresh, only on initial load
      if (!refreshing) {
        Alert.alert('Connection Error', errorMessage + '\n\nPlease check if the backend server is running.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSummaryData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/transactions/summary`);
      setSummaryData(response.data);
    } catch (error) {
      console.error('Error fetching summary data:', error);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchQuery) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(transaction => transaction.type.toLowerCase() === filterType);
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === filterCategory);
    }

    setFilteredTransactions(filtered);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (categoryValue: string, transactionType: string) => {
    const categoryList = categories[transactionType as keyof typeof categories] || [];
    const categoryItem = categoryList.find(cat => cat.value === categoryValue);
    return categoryItem?.label || categoryValue;
  };

  const handleAddTransaction = () => {
    setEditingTransaction(null);
    setAmount('');
    setDescription('');
    setType('EXPENSE');
    setCategory('OTHER_EXPENSE');
    setTransactionDate(new Date().toISOString().split('T')[0]);
    setModalVisible(true);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setAmount(transaction.amount.toString());
    setDescription(transaction.description);
    setType(transaction.type);
    setCategory(transaction.category);
    try {
      const date = transaction.transactionDate ? new Date(transaction.transactionDate) : new Date();
      setTransactionDate(date.toISOString().split('T')[0]);
    } catch (error) {
      console.error('Date parsing error:', error);
      setTransactionDate(new Date().toISOString().split('T')[0]);
    }
    setModalVisible(true);
  };

  const handleDeleteTransaction = (transaction: Transaction) => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/api/transactions/${transaction.id}`);
              fetchTransactions();
              await refreshDashboard(); // Refresh dashboard data
              Alert.alert('Success', 'Transaction deleted successfully');
            } catch (error) {
              console.error('Error deleting transaction:', error);
              Alert.alert('Error', 'Failed to delete transaction');
            }
          },
        },
      ]
    );
  };

  const handleSaveTransaction = async () => {
    if (!amount || !description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const transactionData = {
      amount: parseFloat(amount),
      description,
      type,
      category,
      transactionDate: formatDateForBackend(transactionDate),
    };

    try {
      if (editingTransaction) {
        await axios.put(`${BASE_URL}/api/transactions/${editingTransaction.id}`, transactionData);
        Alert.alert('Success', 'Transaction updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/transactions`, transactionData);
        Alert.alert('Success', 'Transaction added successfully');
      }
      setModalVisible(false);
      fetchTransactions();
      await refreshDashboard(); // Refresh dashboard data
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const renderTransaction = ({ item, index }: { item: Transaction; index: number }) => {
    console.log('Rendering transaction:', item.id, item.description);
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
      <Surface style={styles.transactionCard} elevation={3}>
        <View style={[
          styles.transactionGradient,
          { backgroundColor: item.type === 'INCOME' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)' }
        ]}>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionInfo}>
              <View style={styles.transactionTop}>
                <Avatar.Icon
                  size={36}
                  icon={CATEGORY_ICONS[item.category] || 'shopping-cart'}
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
                    {getCategoryLabel(item.category, item.type)}
                  </Chip>
                </View>
              </View>
            </View>
            <View style={styles.transactionActions}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={() => handleEditTransaction(item)}
                iconColor="#64748b"
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={() => handleDeleteTransaction(item)}
                iconColor="#ef4444"
              />
            </View>
          </View>

          <View style={styles.transactionFooter}>
            <Text style={styles.transactionDate}>
              {item.transactionDate ? (() => {
                try {
                  const date = new Date(item.transactionDate);
                  if (isNaN(date.getTime())) {
                    return 'Invalid date';
                  }
                  return format(date, 'MMM dd, yyyy');
                } catch (error) {
                  console.error('Date formatting error:', error);
                  return 'Invalid date';
                }
              })() : 'No date'}
            </Text>
            <Text
              style={[
                styles.transactionAmount,
                { color: item.type === 'INCOME' ? '#10b981' : '#ef4444' },
              ]}
            >
              {item.type === 'INCOME' ? '+' : '-'}{formatCurrency(item.amount)}
            </Text>
          </View>
        </View>
      </Surface>
    </Animated.View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No transactions found</Text>
      <Text style={styles.emptySubtext}>Add your first transaction to get started</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading transactions...</Text>
        <Text>Debug: Loading state is true</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#6366f1' }]}>
        <Animated.View
          style={[styles.headerContent, { transform: [{ translateY: slideAnim }] }]}
        >
          <View>
            <Title style={styles.headerTitle}>Transactions</Title>
            <Paragraph style={styles.headerSubtitle}>Track and manage your finances</Paragraph>
          </View>
          <View style={styles.headerButtons}>
            <Button
              mode="outlined"
              onPress={() => {
                setError(null);
                fetchTransactions();
              }}
              style={styles.refreshButton}
              icon="refresh"
              labelStyle={styles.uploadButtonText}
            >
              Refresh
            </Button>
            <Button
              mode="contained"
              onPress={() => setStatementUploadVisible(true)}
              style={styles.uploadButton}
              icon="file-upload"
              labelStyle={styles.uploadButtonText}
            >
              📄 Parse Statement
            </Button>
          </View>
        </Animated.View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <SegmentedButtons
          value={tabValue}
          onValueChange={setTabValue}
          buttons={[
            { value: '0', label: 'All Transactions' },
            { value: '1', label: 'Monthly View' },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      {/* Tab Content */}
      {tabValue === '0' ? (
        <>
          {/* Spending Chart */}
          {summaryData && (
            <SpendingChart data={summaryData} height={350} />
          )}

          {/* Search and Filters */}
          <View style={styles.filters}>
            <Searchbar
              placeholder="Search transactions..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
            />

            <View style={styles.filterChips}>
              <SegmentedButtons
                value={filterType}
                onValueChange={setFilterType}
                buttons={[
                  { value: 'all', label: 'All' },
                  { value: 'income', label: 'Income' },
                  { value: 'expense', label: 'Expense' },
                ]}
                style={styles.segmentedButtons}
              />
            </View>

            {filterType !== 'all' && (
              <View style={styles.categoryChips}>
                <Chip
                  selected={filterCategory === 'all'}
                  onPress={() => setFilterCategory('all')}
                  style={styles.chip}
                >
                  All Categories
                </Chip>
                {categories[filterType.toUpperCase() as keyof typeof categories]?.map((cat) => (
                  <Chip
                    key={cat.value}
                    selected={filterCategory === cat.value}
                    onPress={() => setFilterCategory(cat.value)}
                    style={styles.chip}
                  >
                    {cat.label}
                  </Chip>
                ))}
              </View>
            )}
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
              <Button
                mode="contained"
                onPress={() => {
                  setError(null);
                  fetchTransactions();
                }}
                style={styles.retryButton}
              >
                Retry
              </Button>
            </View>
          )}

          {/* Debug Info */}
          <View style={{ padding: 10, backgroundColor: '#f0f0f0' }}>
            <Text>Debug: {filteredTransactions.length} transactions, Page: {page}, Rows: {rowsPerPage}</Text>
            <Text>API URL: {BASE_URL}/api/transactions</Text>
            {error && <Text style={{ color: 'red' }}>Error: {error}</Text>}
            <Text style={{ color: 'green', fontWeight: 'bold' }}>
              ✅ Transactions fetched successfully! {filteredTransactions.length} items loaded.
            </Text>
          </View>

          {/* Statement Upload Card */}
          <Surface style={styles.statementCard} elevation={2}>
            <View style={styles.statementCardContent}>
              <View style={styles.statementIconContainer}>
                <Text style={styles.statementIcon}>📄</Text>
              </View>
              <View style={styles.statementTextContainer}>
                <Text style={styles.statementTitle}>Import Bank Statement</Text>
                <Text style={styles.statementSubtitle}>
                  Upload PDF, CSV, or Excel files to automatically parse and import transactions
                </Text>
              </View>
              <Button
                mode="contained"
                onPress={() => setStatementUploadVisible(true)}
                style={styles.statementButton}
                icon="file-upload"
                contentStyle={styles.statementButtonContent}
              >
                Upload
              </Button>
            </View>
          </Surface>

          {/* Simple Transaction List for Testing */}
          <View style={{ padding: 10, backgroundColor: '#e8f5e8', margin: 10, borderRadius: 8 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>📋 Recent Transactions:</Text>
            {filteredTransactions.slice(0, 5).map((transaction, index) => (
              <Text key={transaction.id} style={{ fontSize: 12, marginBottom: 2 }}>
                • {transaction.description} - ₹{transaction.amount} ({transaction.type})
              </Text>
            ))}
            {filteredTransactions.length > 5 && (
              <Text style={{ fontSize: 12, fontStyle: 'italic', color: '#666' }}>
                ... and {filteredTransactions.length - 5} more transactions
              </Text>
            )}
          </View>

          {/* Transactions List */}
          {console.log('FlatList data:', filteredTransactions)}
          {console.log('FlatList data length:', filteredTransactions.length)}
          <FlatList
            data={filteredTransactions}
            renderItem={({ item, index }) => {
              console.log('FlatList renderItem called with:', item);
              return (
                <View>
                  <Text style={{ padding: 10, backgroundColor: '#ffff99', margin: 5 }}>
                    TEST: {item.description} - ₹{item.amount}
                  </Text>
                  {renderTransaction({ item, index })}
                </View>
              );
            }}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={() => {
              console.log('ListEmptyComponent rendered');
              return (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, color: '#666' }}>No transactions found</Text>
                  <Text style={{ fontSize: 12, color: '#999', marginTop: 5 }}>
                    But {filteredTransactions.length} transactions were fetched from API
                  </Text>
                </View>
              );
            }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContainer}
            ListHeaderComponent={
              <View style={{ padding: 10, backgroundColor: '#e8f4fd', marginBottom: 10 }}>
                <Text style={{ fontWeight: 'bold', color: '#0369a1' }}>
                  📊 Rendering {filteredTransactions.length} transactions
                </Text>
              </View>
            }
            ListFooterComponent={
              filteredTransactions.length > rowsPerPage ? (
                <View style={styles.paginationContainer}>
                  <View style={styles.paginationControls}>
                    <TouchableOpacity
                      style={[styles.paginationButton, page === 0 && styles.paginationButtonDisabled]}
                      onPress={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                    >
                      <Text style={[styles.paginationButtonText, page === 0 && styles.paginationButtonTextDisabled]}>
                        Previous
                      </Text>
                    </TouchableOpacity>

                    <Text style={styles.paginationInfo}>
                      Page {page + 1} of {Math.ceil(filteredTransactions.length / rowsPerPage)}
                    </Text>

                    <TouchableOpacity
                      style={[styles.paginationButton, (page + 1) * rowsPerPage >= filteredTransactions.length && styles.paginationButtonDisabled]}
                      onPress={() => setPage(page + 1)}
                      disabled={(page + 1) * rowsPerPage >= filteredTransactions.length}
                    >
                      <Text style={[styles.paginationButtonText, (page + 1) * rowsPerPage >= filteredTransactions.length && styles.paginationButtonTextDisabled]}>
                        Next
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.rowsPerPageContainer}>
                    <Text style={styles.rowsPerPageText}>Show:</Text>
                    {[5, 10, 25].map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={[styles.rowsPerPageButton, rowsPerPage === size && styles.rowsPerPageButtonActive]}
                        onPress={() => {
                          setRowsPerPage(size);
                          setPage(0);
                        }}
                      >
                        <Text style={[styles.rowsPerPageButtonText, rowsPerPage === size && styles.rowsPerPageButtonTextActive]}>
                          {size}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null
            }
          />
        </>
      ) : (
        /* Monthly View */
        <MonthlyTransactions />
      )}

      {/* Add Transaction FAB */}
      <FAB
        icon="plus"
        onPress={handleAddTransaction}
        style={styles.fab}
      />

      {/* Statement Upload FAB */}
      <FAB
        icon="file-upload"
        onPress={() => setStatementUploadVisible(true)}
        style={[styles.fab, styles.statementFab]}
        color="#ffffff"
      />

      {/* Add/Edit Transaction Modal */}
      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => setModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Surface style={styles.modalContent} elevation={4}>
            <Title style={styles.modalTitle}>
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </Title>

            <TextInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              left={<TextInput.Icon icon="currency-inr" />}
              style={styles.input}
            />

            <TextInput
              label="Description"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
            />

            <View style={styles.typeSelector}>
              <SegmentedButtons
                value={type}
                onValueChange={(value) => {
                  setType(value as 'INCOME' | 'EXPENSE');
                  setCategory(value === 'INCOME' ? 'SALARY' : 'OTHER_EXPENSE');
                }}
                buttons={[
                  { value: 'INCOME', label: 'Income' },
                  { value: 'EXPENSE', label: 'Expense' },
                ]}
              />
            </View>

            <TextInput
              label="Category"
              value={getCategoryLabel(category, type)}
              editable={false}
              right={
                <TextInput.Icon
                  icon="menu-down"
                  onPress={() => {
                    // Could implement a category picker here
                  }}
                />
              }
              style={styles.input}
            />

            <TextInput
              label="Date"
              value={transactionDate}
              onChangeText={setTransactionDate}
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <Button onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveTransaction}
                disabled={!amount || !description}
              >
                {editingTransaction ? 'Update' : 'Add'}
              </Button>
            </View>
          </Surface>
        </Modal>
      </Portal>

      {/* Statement Upload Modal */}
      <StatementUpload
        visible={statementUploadVisible}
        onDismiss={() => setStatementUploadVisible(false)}
        onUploadSuccess={(result) => {
          fetchTransactions();
          fetchSummaryData();
          refreshDashboard();
          setStatementUploadVisible(false);
        }}
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
    backgroundColor: '#f5f5f5',
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
  refreshButton: {
    marginLeft: 16,
  },
  uploadButton: {
    marginLeft: 8,
  },
  filters: {
    padding: 16,
  },
  searchbar: {
    marginBottom: 16,
  },
  filterChips: {
    marginBottom: 16,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    marginBottom: 4,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  transactionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 14,
    color: '#64748b',
  },
  transactionActions: {
    flexDirection: 'row',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 12,
    color: '#64748b',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    marginBottom: 16,
  },
  typeSelector: {
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    marginRight: 8,
  },
  transactionGradient: {
    borderRadius: 12,
    padding: 16,
  },
  transactionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    height: 24,
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
  uploadButtonText: {
    color: '#ffffff',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
  },
  monthlyView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  monthlyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  monthlySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  paginationContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  paginationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6366f1',
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  paginationButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  paginationButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  paginationButtonTextDisabled: {
    color: '#94a3b8',
  },
  paginationInfo: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  rowsPerPageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowsPerPageText: {
    fontSize: 14,
    color: '#64748b',
    marginRight: 8,
  },
  rowsPerPageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  rowsPerPageButtonActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  rowsPerPageButtonText: {
    fontSize: 14,
    color: '#64748b',
  },
  rowsPerPageButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  statementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statementCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  statementIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statementIcon: {
    fontSize: 24,
  },
  statementTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  statementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statementSubtitle: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  statementButton: {
    backgroundColor: '#6366f1',
  },
  statementButtonContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statementFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80, // Position above the main FAB
    backgroundColor: '#10b981', // Green color for statement upload
  },
});

export default TransactionsScreen;