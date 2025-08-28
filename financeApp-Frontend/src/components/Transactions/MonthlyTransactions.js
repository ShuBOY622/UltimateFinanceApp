import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Button,
  Divider,
  Avatar,
  Paper,
  Skeleton
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  CalendarToday,
  Assessment,
  AccountBalance
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import dayjs from 'dayjs';
import { transactionAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import SpendingChart from '../Charts/SpendingChart';

const MonthlyTransactions = () => {
  const [currentMonth, setCurrentMonth] = useState(0); // 0 = current month, 1 = last month, etc.
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonthlyData();
  }, [currentMonth]);

  const fetchMonthlyData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, summaryRes] = await Promise.all([
        transactionAPI.getMonthly(currentMonth),
        transactionAPI.getMonthlySummary(currentMonth)
      ]);

      setTransactions(transactionsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error('Failed to load monthly data');
      console.error('Monthly transactions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getMonthName = () => {
    const date = dayjs().subtract(currentMonth, 'month');
    return date.format('MMMM YYYY');
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentMonth(prev => prev + 1);
    } else {
      setCurrentMonth(prev => Math.max(0, prev - 1));
    }
  };

  const getCategoryIcon = (category, type) => {
    // Add your category icon logic here
    return type === 'INCOME' ? <TrendingUp /> : <TrendingDown />;
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        sx={{
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Avatar sx={{ bgcolor: color, mr: 2 }}>
              {icon}
            </Avatar>
            <Box>
              <Typography variant="h5" fontWeight="bold" color="text.primary">
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box p={3}>
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Skeleton variant="circular" width={48} height={48} />
                  <Skeleton variant="text" height={40} sx={{ mt: 2 }} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header with Month Navigation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="bold" color="text.primary">
              Monthly Transactions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View your financial activity by month
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigateMonth('prev')} color="primary">
              <ChevronLeft />
            </IconButton>
            <Paper
              sx={{
                px: 3,
                py: 1,
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
              }}
            >
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {getMonthName()}
              </Typography>
            </Paper>
            <IconButton 
              onClick={() => navigateMonth('next')} 
              color="primary"
              disabled={currentMonth === 0}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>
      </motion.div>

      {/* Monthly Summary Cards */}
      {summary && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Income"
              value={formatCurrency(summary.monthlyIncome)}
              icon={<TrendingUp />}
              color="#10b981"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Expenses"
              value={formatCurrency(summary.monthlyExpenses)}
              icon={<TrendingDown />}
              color="#ef4444"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Net Balance"
              value={formatCurrency(summary.monthlyBalance)}
              icon={<AccountBalance />}
              color={summary.monthlyBalance >= 0 ? "#10b981" : "#ef4444"}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Transactions"
              value={summary.transactionCount || 0}
              icon={<Assessment />}
              color="#6366f1"
              subtitle={`${summary.transactionCount || 0} total`}
            />
          </Grid>
        </Grid>
      )}

      {/* Monthly Spending Chart */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Box mb={4}>
            <SpendingChart 
              data={{
                expensesByCategory: Object.entries(summary.expensesByCategory || {})
              }} 
              period="monthly"
            />
          </Box>
        </motion.div>
      )}

      {/* Transaction List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <CalendarToday sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="600" color="text.primary">
                Transaction Details
              </Typography>
            </Box>

            {transactions.length > 0 ? (
              <List>
                <AnimatePresence>
                  {transactions.map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ListItem
                        sx={{
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          borderRadius: 2,
                          mb: 1,
                          '&:hover': {
                            backgroundColor: 'rgba(99, 102, 241, 0.05)',
                          },
                        }}
                      >
                        <ListItemIcon>
                          <Avatar
                            sx={{
                              bgcolor: transaction.type === 'INCOME' ? '#10b981' : '#ef4444',
                              width: 40,
                              height: 40,
                            }}
                          >
                            {getCategoryIcon(transaction.category, transaction.type)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                {transaction.description}
                              </Typography>
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color={transaction.type === 'INCOME' ? 'success.main' : 'error.main'}
                              >
                                {transaction.type === 'INCOME' ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                              <Chip
                                label={transaction.category.replace('_', ' ')}
                                size="small"
                                color={transaction.type === 'INCOME' ? 'success' : 'error'}
                                variant="outlined"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {dayjs(transaction.transactionDate).format('DD MMM YYYY, HH:mm')}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < transactions.length - 1 && <Divider sx={{ my: 1 }} />}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </List>
            ) : (
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                py={6}
              >
                <CalendarToday sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" mb={2}>
                  No transactions found
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  No financial activity recorded for {getMonthName()}
                </Typography>
                <Button variant="contained">
                  Add Transaction
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Box>
  );
};

export default MonthlyTransactions;