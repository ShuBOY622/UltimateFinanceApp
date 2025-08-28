import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
  IconButton,
  Fab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  FilterList,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  Restaurant,
  DirectionsCar,
  Home,
  LocalHospital,
  School,
  Flight,
  CloudUpload
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import MonthlyTransactions from './MonthlyTransactions';
import SpendingChart from '../Charts/SpendingChart';
import StatementUpload from '../Statements/StatementUpload';

const Transactions = () => {
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [tabValue, setTabValue] = useState(0);
  const [showStatementUpload, setShowStatementUpload] = useState(false);
  const [showPulseEffect, setShowPulseEffect] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    type: 'EXPENSE',
    category: 'OTHER_EXPENSE',
    transactionDate: dayjs()
  });

  const transactionTypes = [
    { value: 'INCOME', label: 'Income', icon: <TrendingUp />, color: '#4caf50' },
    { value: 'EXPENSE', label: 'Expense', icon: <TrendingDown />, color: '#f44336' }
  ];

  const categories = {
    INCOME: [
      { value: 'SALARY', label: 'Salary', icon: <AttachMoney /> },
      { value: 'FREELANCE', label: 'Freelance', icon: <AttachMoney /> },
      { value: 'INVESTMENT', label: 'Investment', icon: <TrendingUp /> },
      { value: 'BUSINESS', label: 'Business', icon: <AttachMoney /> },
      { value: 'OTHER_INCOME', label: 'Other Income', icon: <AttachMoney /> }
    ],
    EXPENSE: [
      { value: 'FOOD', label: 'Food', icon: <Restaurant /> },
      { value: 'TRANSPORTATION', label: 'Transportation', icon: <DirectionsCar /> },
      { value: 'ENTERTAINMENT', label: 'Entertainment', icon: <ShoppingCart /> },
      { value: 'SHOPPING', label: 'Shopping', icon: <ShoppingCart /> },
      { value: 'UTILITIES', label: 'Utilities', icon: <Home /> },
      { value: 'HEALTHCARE', label: 'Healthcare', icon: <LocalHospital /> },
      { value: 'EDUCATION', label: 'Education', icon: <School /> },
      { value: 'TRAVEL', label: 'Travel', icon: <Flight /> },
      { value: 'RENT', label: 'Rent', icon: <Home /> },
      { value: 'INSURANCE', label: 'Insurance', icon: <Home /> },
      { value: 'OTHER_EXPENSE', label: 'Other Expense', icon: <ShoppingCart /> }
    ]
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Check if user came from dashboard and trigger pulse effect
  useEffect(() => {
    if (location.state?.fromDashboard) {
      setShowPulseEffect(true);
      // Stop pulse effect after 3 seconds
      const timer = setTimeout(() => {
        setShowPulseEffect(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, filterType, filterCategory]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      toast.error('Failed to load transactions');
      console.error('Transactions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.type === filterType);
    }

    if (filterCategory !== 'ALL') {
      filtered = filtered.filter(transaction => transaction.category === filterCategory);
    }

    setFilteredTransactions(filtered);
  };

  const handleOpenDialog = (transaction = null) => {
    console.log('handleOpenDialog called with transaction:', transaction);
    if (transaction) {
      setEditingTransaction(transaction);
      setFormData({
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        category: transaction.category,
        transactionDate: dayjs(transaction.transactionDate)
      });
    } else {
      setEditingTransaction(null);
      setFormData({
        amount: '',
        description: '',
        type: 'EXPENSE',
        category: 'OTHER_EXPENSE',
        transactionDate: dayjs()
      });
    }
    console.log('Setting openDialog to true');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTransaction(null);
  };

  const handleSubmit = async () => {
    try {
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        transactionDate: formData.transactionDate.toISOString()
      };

      if (editingTransaction) {
        await api.put(`/transactions/${editingTransaction.id}`, transactionData);
        toast.success('Transaction updated successfully!');
      } else {
        await api.post('/transactions', transactionData);
        toast.success('Transaction added successfully!');
      }

      fetchTransactions();
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to save transaction');
      console.error('Save transaction error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        toast.success('Transaction deleted successfully!');
        fetchTransactions();
      } catch (error) {
        toast.error('Failed to delete transaction');
        console.error('Delete transaction error:', error);
      }
    }
  };

  const handleStatementUploadSuccess = (result) => {
    // Refresh transactions after successful import
    fetchTransactions();
    setShowStatementUpload(false);
    toast.success(`Imported ${result.successCount} transactions successfully!`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const getCategoryIcon = (category, type) => {
    const categoryList = categories[type] || [];
    const categoryItem = categoryList.find(cat => cat.value === category);
    return categoryItem?.icon || <AttachMoney />;
  };

  const getCategoryLabel = (category, type) => {
    const categoryList = categories[type] || [];
    const categoryItem = categoryList.find(cat => cat.value === category);
    return categoryItem?.label || category;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Transactions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage your daily transactions
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <motion.div
              animate={showPulseEffect ? {
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 0 0 rgba(102, 126, 234, 0.7)',
                  '0 0 0 10px rgba(102, 126, 234, 0)',
                  '0 0 0 0 rgba(102, 126, 234, 0)'
                ]
              } : {}}
              transition={{
                duration: 1,
                repeat: showPulseEffect ? Infinity : 0,
                ease: "easeInOut"
              }}
              style={{ borderRadius: '4px' }}
            >
              <Button
                variant="outlined"
                startIcon={<CloudUpload />}
                onClick={() => {
                  console.log('Upload Statement button clicked');
                  setShowStatementUpload(true);
                  setShowPulseEffect(false); // Stop pulse when clicked
                }}
                sx={{
                  ...(showPulseEffect && {
                    background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1) 30%, rgba(118, 75, 162, 0.1) 90%)',
                    borderColor: '#667eea',
                    color: '#667eea',
                    fontWeight: 'bold'
                  })
                }}
              >
                Parse Documents
              </Button>
            </motion.div>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                console.log('Add Transaction button clicked');
                handleOpenDialog();
              }}
            >
              Add Transaction
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(event, newValue) => setTabValue(newValue)}
            aria-label="transaction tabs"
          >
            <Tab label="All Transactions" />
            <Tab label="Monthly View" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {tabValue === 0 ? (
          <>
            {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={filterType}
                    label="Type"
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <MenuItem value="ALL">All Types</MenuItem>
                    <MenuItem value="INCOME">Income</MenuItem>
                    <MenuItem value="EXPENSE">Expense</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={filterCategory}
                    label="Category"
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <MenuItem value="ALL">All Categories</MenuItem>
                    {[...categories.INCOME, ...categories.EXPENSE].map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        {category.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('ALL');
                    setFilterCategory('ALL');
                  }}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Spending Analysis */}
        <Card sx={{ mb: 3 }}>
          <SpendingChart />
        </Card>

        {/* Transactions Table */}
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <AnimatePresence>
                  {filteredTransactions
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((transaction, index) => (
                      <motion.tr
                        key={transaction.id}
                        component={TableRow}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        hover
                      >
                        <TableCell>
                          {new Date(transaction.transactionDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Box display="flex" alignItems="center">
                            {getCategoryIcon(transaction.category, transaction.type)}
                            <Typography variant="body2" sx={{ ml: 1 }}>
                              {transaction.description}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getCategoryLabel(transaction.category, transaction.type)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={transaction.type}
                            size="small"
                            color={transaction.type === 'INCOME' ? 'success' : 'error'}
                            icon={transaction.type === 'INCOME' ? <TrendingUp /> : <TrendingDown />}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color={transaction.type === 'INCOME' ? '#4caf50' : '#f44336'}
                          >
                            {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(transaction)}
                              color="primary"
                            >
                              <Edit />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(transaction.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </motion.tr>
                    ))}
                </AnimatePresence>
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredTransactions.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Card>

        {/* Add Transaction FAB */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          }}
          onClick={() => handleOpenDialog()}
        >
          <Add />
        </Fab>

        {/* Add/Edit Transaction Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={formData.type}
                    label="Type"
                    onChange={(e) => {
                      const newType = e.target.value;
                      setFormData({
                        ...formData,
                        type: newType,
                        category: newType === 'INCOME' ? 'SALARY' : 'OTHER_EXPENSE'
                      });
                    }}
                  >
                    {transactionTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        <Box display="flex" alignItems="center">
                          {type.icon}
                          <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    label="Category"
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {categories[formData.type]?.map((category) => (
                      <MenuItem key={category.value} value={category.value}>
                        <Box display="flex" alignItems="center">
                          {category.icon}
                          <Typography sx={{ ml: 1 }}>{category.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Transaction Date"
                  value={formData.transactionDate}
                  onChange={(newValue) => setFormData({ ...formData, transactionDate: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.amount || !formData.description}
            >
              {editingTransaction ? 'Update' : 'Add'} Transaction
            </Button>
          </DialogActions>
        </Dialog>

        {/* Statement Upload Dialog */}
        {showStatementUpload && (
          <StatementUpload
            onUploadSuccess={handleStatementUploadSuccess}
            onClose={() => setShowStatementUpload(false)}
          />
        )}
          </>
        ) : (
          <MonthlyTransactions />
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Transactions;