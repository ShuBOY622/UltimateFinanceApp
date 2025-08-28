import React, { useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  Chip,
  IconButton,
  TextField,
  MenuItem,
  FormControlLabel,
  Switch,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Close,
  TrendingUp,
  TrendingDown,
  Edit,
  CheckCircle,
  Warning,
  Error,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

const TransactionPreview = ({ transactions, onClose, onImport }) => {
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [filterType, setFilterType] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [showDuplicates, setShowDuplicates] = useState(true);
  const [skipDuplicates, setSkipDuplicates] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = transactions.length;
    const income = transactions.filter(t => t.type === 'INCOME').length;
    const expense = transactions.filter(t => t.type === 'EXPENSE').length;
    const duplicates = transactions.filter(t => t.isDuplicate).length;
    const selected = selectedTransactions.size;

    return { total, income, expense, duplicates, selected };
  }, [transactions, selectedTransactions]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const typeMatch = filterType === 'ALL' || transaction.type === filterType;
      const categoryMatch = filterCategory === 'ALL' || transaction.category === filterCategory;
      const duplicateMatch = showDuplicates || !transaction.isDuplicate;
      
      return typeMatch && categoryMatch && duplicateMatch;
    });
  }, [transactions, filterType, filterCategory, showDuplicates]);

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(transactions.map(t => t.category).filter(cat => cat != null))];
    return uniqueCategories.sort();
  }, [transactions]);

  const handleSelectTransaction = (index) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTransactions.size === filteredTransactions.length) {
      setSelectedTransactions(new Set());
    } else {
      const allIndices = filteredTransactions.map((_, index) => index);
      setSelectedTransactions(new Set(allIndices));
    }
  };

  const handleEditTransaction = (transaction, index) => {
    setEditingTransaction({ ...transaction, index });
  };

  const handleImport = () => {
    const transactionsToImport = selectedTransactions.size > 0 
      ? filteredTransactions.filter((_, index) => selectedTransactions.has(index))
      : filteredTransactions;
    
    onImport(transactionsToImport, skipDuplicates);
    onClose();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatCategoryName = (category) => {
    if (!category) return 'Unknown';
    return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'success';
    if (confidence >= 0.6) return 'warning';
    return 'error';
  };

  const getConfidenceIcon = (confidence) => {
    if (confidence >= 0.8) return <CheckCircle />;
    if (confidence >= 0.6) return <Warning />;
    return <Error />;
  };

  return (
    <>
      <Dialog
        open={true}
        onClose={onClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(15, 15, 35, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            height: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Visibility sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="600">
                Transaction Preview ({filteredTransactions.length} transactions)
              </Typography>
              <Chip
                size="small"
                label={`${selectedTransactions.size} selected`}
                color="primary"
                sx={{ ml: 2 }}
              />
            </Box>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          {/* Statistics Cards */}
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="primary.main">
                    {stats.total}
                  </Typography>
                  <Typography variant="caption">Total</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {stats.income}
                  </Typography>
                  <Typography variant="caption">Income</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="error.main">
                    {stats.expense}
                  </Typography>
                  <Typography variant="caption">Expenses</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="warning.main">
                    {stats.duplicates}
                  </Typography>
                  <Typography variant="caption">Duplicates</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" fontWeight="bold" color="info.main">
                    {stats.selected}
                  </Typography>
                  <Typography variant="caption">Selected</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="ALL">All Types</MenuItem>
                  <MenuItem value="INCOME">Income</MenuItem>
                  <MenuItem value="EXPENSE">Expense</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  select
                  size="small"
                  label="Category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <MenuItem value="ALL">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {formatCategoryName(category)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showDuplicates}
                      onChange={(e) => setShowDuplicates(e.target.checked)}
                    />
                  }
                  label="Show Duplicates"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleSelectAll}
                  startIcon={selectedTransactions.size === filteredTransactions.length ? <VisibilityOff /> : <Visibility />}
                >
                  {selectedTransactions.size === filteredTransactions.length ? 'Deselect All' : 'Select All'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Transactions Table */}
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedTransactions.size > 0 && selectedTransactions.size < filteredTransactions.length}
                      checked={filteredTransactions.length > 0 && selectedTransactions.size === filteredTransactions.length}
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Confidence</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransactions.map((transaction, index) => (
                  <motion.tr
                    key={index}
                    component={TableRow}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    sx={{
                      backgroundColor: transaction.isDuplicate ? 'rgba(255, 152, 0, 0.1)' : 'transparent'
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedTransactions.has(index)}
                        onChange={() => handleSelectTransaction(index)}
                      />
                    </TableCell>
                    <TableCell>
                      {dayjs(transaction.transactionDate).format('DD MMM YYYY')}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="500">
                          {transaction.description}
                        </Typography>
                        {transaction.counterParty && (
                          <Typography variant="caption" color="text.secondary">
                            {transaction.counterParty}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatCategoryName(transaction.category)}
                        size="small"
                        color={transaction.type === 'INCOME' ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center">
                        {transaction.type === 'INCOME' ? 
                          <TrendingUp sx={{ color: 'success.main', mr: 0.5 }} /> : 
                          <TrendingDown sx={{ color: 'error.main', mr: 0.5 }} />
                        }
                        <Typography variant="body2">
                          {transaction.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={transaction.type === 'INCOME' ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={`Confidence: ${(transaction.confidence * 100).toFixed(0)}%`}>
                        <Chip
                          icon={getConfidenceIcon(transaction.confidence)}
                          label={`${(transaction.confidence * 100).toFixed(0)}%`}
                          size="small"
                          color={getConfidenceColor(transaction.confidence)}
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {transaction.isDuplicate ? (
                        <Chip label="Duplicate" size="small" color="warning" />
                      ) : (
                        <Chip label="New" size="small" color="success" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Edit Transaction">
                        <IconButton
                          size="small"
                          onClick={() => handleEditTransaction(transaction, index)}
                        >
                          <Edit />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Import Options */}
          <Paper sx={{ p: 2, mt: 3 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                />
              }
              label="Skip duplicate transactions during import"
            />
            
            {!skipDuplicates && stats.duplicates > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Warning: {stats.duplicates} duplicate transactions will be imported. This may create duplicate entries in your account.
              </Alert>
            )}
          </Paper>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleImport}
            disabled={selectedTransactions.size === 0 && filteredTransactions.length === 0}
          >
            Import {selectedTransactions.size > 0 ? selectedTransactions.size : filteredTransactions.length} Transactions
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Transaction Dialog */}
      {editingTransaction && (
        <EditTransactionDialog
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSave={(updatedTransaction) => {
            // Update the transaction in the list
            const updatedTransactions = [...transactions];
            updatedTransactions[editingTransaction.index] = updatedTransaction;
            setEditingTransaction(null);
          }}
        />
      )}
    </>
  );
};

// Edit Transaction Dialog Component
const EditTransactionDialog = ({ transaction, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    description: transaction.description || '',
    amount: transaction.amount || '',
    type: transaction.type || 'EXPENSE',
    category: transaction.category || 'OTHER'
  });

  const categories = ['FOOD', 'TRANSPORT', 'ENTERTAINMENT', 'UTILITIES', 'SHOPPING', 'HEALTHCARE', 'EDUCATION', 'OTHER'];

  const handleSave = () => {
    onSave({ ...transaction, ...formData });
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Transaction</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <MenuItem value="INCOME">Income</MenuItem>
              <MenuItem value="EXPENSE">Expense</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>
                  {category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionPreview;