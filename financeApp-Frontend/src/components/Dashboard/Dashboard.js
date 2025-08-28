import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
  Alert,
  Button
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  EmojiEvents,
  Refresh,
  Psychology,
  ShoppingCart,
  Savings,
  Warning,
  PieChart as PieChartIcon,
  Assessment,
  ShowChart
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme, warning }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  transform: 'translateY(0)',
  position: 'relative',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
  border: warning ? `2px solid ${theme.palette?.warning?.main || '#ff9800'}` : 'none',
  background: warning
    ? `linear-gradient(135deg, ${theme.palette?.warning?.light || '#ffb74d'}10, ${theme.palette?.background?.paper || '#ffffff'})`
    : theme.palette?.background?.paper || '#ffffff',
}));

const AnimatedProgress = styled(LinearProgress)(({ theme, color }) => ({
  height: 8,
  borderRadius: 4,
  '& .MuiLinearProgress-bar': {
    backgroundColor: color || theme.palette?.primary?.main || '#1976d2',
    transition: 'all 0.5s ease-in-out',
  },
}));

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [goals, setGoals] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [advice, setAdvice] = useState(null);
  const [budgetAnalysis, setBudgetAnalysis] = useState(null);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No authentication token found, redirecting to login');
        window.location.href = '/login';
        return;
      }
      
      console.log('Fetching dashboard data...');
      
      const [summaryRes, goalsRes, transactionsRes, adviceRes, budgetRes, portfolioRes] = await Promise.all([
        api.get('/transactions/summary').catch(error => {
          console.error('Failed to fetch transactions summary:', error);
          return { data: null };
        }),
        api.get('/goals/active').catch(error => {
          console.error('Failed to fetch goals:', error);
          return { data: [] };
        }),
        api.get('/transactions').catch(error => {
          console.error('Failed to fetch transactions:', error);
          return { data: [] };
        }),
        api.get('/advisor/advice').catch(error => {
          console.error('Failed to fetch advice:', error);
          return { data: null };
        }),
        api.get('/budget/analysis').catch(error => {
          console.error('Failed to fetch budget analysis:', error);
          if (error.response?.status === 401) {
            console.warn('Authentication failed for budget analysis');
          }
          return { data: null };
        }),
        api.get('/investments/portfolio/summary').catch(error => {
          console.error('Failed to fetch portfolio summary:', error);
          if (error.response?.status === 401) {
            console.warn('Authentication failed for portfolio summary');
          }
          return { data: null };
        })
      ]);

      // Convert summary data to handle BigDecimal values
      if (summaryRes.data) {
        const convertedSummary = {
          ...summaryRes.data,
          netBalance: Number(summaryRes.data.netBalance || 0),
          monthlyIncome: Number(summaryRes.data.monthlyIncome || 0),
          monthlyExpenses: Number(summaryRes.data.monthlyExpenses || 0),
          todayExpenses: Number(summaryRes.data.todayExpenses || 0)
        };
        setSummary(convertedSummary);
      } else {
        setSummary({
          netBalance: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          todayExpenses: 0
        });
      }
      
      setGoals(goalsRes.data || []);
      setRecentTransactions((transactionsRes.data || []).slice(0, 5));
      setAdvice(adviceRes.data);
      
      // Convert budget analysis data with proper validation
      if (budgetRes.data && !budgetRes.data.error) {
        const convertedBudgetAnalysis = {
          ...budgetRes.data,
          totalBudgeted: Number(budgetRes.data.totalBudgeted || 0),
          totalSpent: Number(budgetRes.data.totalSpent || 0),
          totalRemaining: Number(budgetRes.data.totalRemaining || 0),
          warnings: budgetRes.data.warnings || { hasWarnings: false },
          overBudgetCategories: budgetRes.data.overBudgetCategories || {}
        };
        setBudgetAnalysis(convertedBudgetAnalysis);
      } else {
        setBudgetAnalysis(null);
        if (budgetRes.data?.error) {
          console.warn('Budget analysis error:', budgetRes.data.error);
        }
      }
      
      // Convert portfolio summary data with proper validation
      if (portfolioRes.data && !portfolioRes.data.error) {
        const convertedPortfolio = {
          ...portfolioRes.data,
          totalInvestment: Number(portfolioRes.data.totalInvestment || 0),
          currentValue: Number(portfolioRes.data.currentValue || 0),
          totalGainLoss: Number(portfolioRes.data.totalGainLoss || 0),
          gainLossPercentage: Number(portfolioRes.data.gainLossPercentage || 0),
          totalHoldings: Number(portfolioRes.data.totalHoldings || 0),
          isProfit: portfolioRes.data.isProfit || false
        };
        setPortfolioSummary(convertedPortfolio);
      } else {
        setPortfolioSummary(null);
        if (portfolioRes.data?.error) {
          console.warn('Portfolio summary error:', portfolioRes.data.error);
        }
      }
      
      console.log('Dashboard data fetched successfully');
      
    } catch (error) {
      console.error('Dashboard error:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.warn('Authentication failed, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return;
      }
      
      toast.error('Failed to load dashboard data');
      
      // Set default values to prevent undefined errors
      setSummary({
        netBalance: 0,
        monthlyIncome: 0,
        monthlyExpenses: 0,
        todayExpenses: 0
      });
      setGoals([]);
      setRecentTransactions([]);
      setBudgetAnalysis(null);
      setPortfolioSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    // Ensure we have a valid number, handle BigDecimal strings from backend
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(isNaN(numericAmount) ? 0 : numericAmount);
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return '#4caf50';
    if (score >= 60) return '#ff9800';
    return '#f44336';
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const expenseData = summary?.expensesByCategory?.map(([category, amount], index) => ({
    name: category.replace('_', ' '),
    value: parseFloat(amount),
    color: COLORS[index % COLORS.length]
  })) || [];

  const StatCard = ({ title, value, icon, color, trend, trendValue, warning }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledCard warning={warning}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {title}
              </Typography>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Typography variant="h4" component="div" fontWeight="bold">
                  {value}
                </Typography>
              </motion.div>
              {trend && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Box display="flex" alignItems="center" mt={1}>
                    {trend === 'up' ? (
                      <TrendingUp sx={{ color: '#4caf50', fontSize: 16, mr: 0.5 }} />
                    ) : (
                      <TrendingDown sx={{ color: '#f44336', fontSize: 16, mr: 0.5 }} />
                    )}
                    <Typography
                      variant="body2"
                      color={trend === 'up' ? '#4caf50' : '#f44336'}
                    >
                      {trendValue}
                    </Typography>
                  </Box>
                </motion.div>
              )}
            </Box>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
                  {icon}
                </Avatar>
                {warning && (
                  <Warning 
                    sx={{ 
                      position: 'absolute', 
                      top: -5, 
                      right: -5, 
                      color: (theme) => theme.palette?.warning?.main || '#ff9800', 
                      fontSize: 16,
                      zIndex: 1
                    }} 
                  />
                )}
              </Box>
            </motion.div>
          </Box>
        </CardContent>
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 100,
            height: 100,
            background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
          }}
        />
      </StyledCard>
    </motion.div>
  );

  if (loading) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="60vh">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <AccountBalance sx={{ fontSize: 60, color: (theme) => theme.palette.primary.main }} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Loading your financial dashboard...
          </Typography>
        </motion.div>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back! Here's your financial overview.
            </Typography>
          </Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchDashboardData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </motion.div>

      {/* Budget Warnings */}
      <AnimatePresence>
        {budgetAnalysis?.warnings?.hasWarnings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert
              severity="warning"
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" startIcon={<Assessment />}>
                  View Budget
                </Button>
              }
            >
              <Typography variant="subtitle2">Budget Alert!</Typography>
              You're over budget in {Object.keys(budgetAnalysis?.warnings?.categoryWarnings || {}).length} categories.
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Balance"
            value={formatCurrency(summary?.netBalance)}
            icon={<AccountBalance />}
            color="#1976d2"
            trend={summary?.netBalance > 0 ? 'up' : 'down'}
            trendValue={`${summary?.netBalance > 0 ? '+' : ''}${formatCurrency(summary?.netBalance)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Income"
            value={formatCurrency(summary?.monthlyIncome)}
            icon={<TrendingUp />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(summary?.monthlyExpenses)}
            icon={<ShoppingCart />}
            color="#f44336"
            warning={budgetAnalysis && budgetAnalysis.totalSpent && budgetAnalysis.totalBudgeted && (budgetAnalysis.totalSpent > budgetAnalysis.totalBudgeted)}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title={budgetAnalysis?.budget ? "Budget Remaining" : "Savings Rate"}
            value={budgetAnalysis?.budget ?
              formatCurrency(budgetAnalysis.totalRemaining) :
              `${summary?.monthlyIncome > 0 ? Math.round(((summary?.monthlyIncome - summary?.monthlyExpenses) / summary?.monthlyIncome) * 100) : 0}%`
            }
            icon={budgetAnalysis?.budget ? <PieChartIcon /> : <Savings />}
            color={budgetAnalysis && budgetAnalysis.totalRemaining !== undefined && budgetAnalysis.totalRemaining < 0 ? "#f44336" : "#ff9800"}
            warning={budgetAnalysis && budgetAnalysis.totalRemaining !== undefined && budgetAnalysis.totalRemaining < 0}
          />
        </Grid>
      </Grid>

      {/* Budget Overview */}
      {budgetAnalysis?.budget && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h6" fontWeight="bold">
                      Monthly Budget Overview
                    </Typography>
                    <Chip
                      label={`${Object.keys(budgetAnalysis?.overBudgetCategories || {}).filter(key => budgetAnalysis.overBudgetCategories[key]).length} Over Budget`}
                      color={budgetAnalysis?.warnings?.hasWarnings ? "error" : "success"}
                      size="small"
                    />
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" sx={{ color: (theme) => theme.palette.primary.main }} fontWeight="bold">
                          {formatCurrency(budgetAnalysis.totalBudgeted)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Budgeted
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" sx={{ color: (theme) => theme.palette.error.main }} fontWeight="bold">
                          {formatCurrency(budgetAnalysis.totalSpent)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Spent
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box textAlign="center" p={2}>
                        <Typography
                          variant="h4"
                          sx={{ 
                            color: (theme) => budgetAnalysis.totalRemaining >= 0 ? theme.palette.success.main : theme.palette.error.main,
                            fontWeight: 'bold'
                          }}
                        >
                          {formatCurrency(budgetAnalysis.totalRemaining)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Remaining
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box mt={3}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Overall Budget Progress
                    </Typography>
                    <AnimatedProgress
                      variant="determinate"
                      value={Math.min((budgetAnalysis.totalSpent / budgetAnalysis.totalBudgeted) * 100, 100)}
                      color={budgetAnalysis.totalSpent > budgetAnalysis.totalBudgeted ? "#f44336" : "#4caf50"}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {((budgetAnalysis.totalSpent / budgetAnalysis.totalBudgeted) * 100).toFixed(1)}% of budget used
                    </Typography>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </motion.div>
      )}

      {/* Investment Portfolio Overview */}
      {portfolioSummary && portfolioSummary.totalHoldings > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12}>
              <StyledCard>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Box display="flex" alignItems="center">
                      <ShowChart sx={{ mr: 1, color: (theme) => theme.palette.primary.main }} />
                      <Typography variant="h6" fontWeight="bold">
                        Investment Portfolio
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Chip
                        label={portfolioSummary.isProfit ? 'Profitable' : 'Loss'}
                        color={portfolioSummary.isProfit ? "success" : "error"}
                        size="small"
                        icon={portfolioSummary.isProfit ? <TrendingUp /> : <TrendingDown />}
                      />
                      <Button
                        size="small"
                        onClick={() => window.location.href = '/investments'}
                        startIcon={<Assessment />}
                      >
                        View Details
                      </Button>
                    </Box>
                  </Box>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" sx={{ color: (theme) => theme.palette.primary.main }} fontWeight="bold">
                          {formatCurrency(portfolioSummary.totalInvestment)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Investment
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" sx={{ color: (theme) => theme.palette.success.main }} fontWeight="bold">
                          {formatCurrency(portfolioSummary.currentValue)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Current Value
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center" p={2}>
                        <Typography
                          variant="h4"
                          sx={{ 
                            color: (theme) => portfolioSummary.isProfit ? theme.palette.success.main : theme.palette.error.main,
                            fontWeight: 'bold'
                          }}
                        >
                          {portfolioSummary.isProfit ? '+' : ''}{formatCurrency(portfolioSummary.totalGainLoss)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Gain/Loss
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Box textAlign="center" p={2}>
                        <Typography variant="h4" sx={{ color: (theme) => theme.palette.info.main }} fontWeight="bold">
                          {portfolioSummary.totalHoldings}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Holdings
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Box mt={3}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      Portfolio Performance
                    </Typography>
                    <AnimatedProgress
                      variant="determinate"
                      value={Math.min(Math.abs(portfolioSummary.gainLossPercentage || 0), 100)}
                      color={portfolioSummary.isProfit ? "#4caf50" : "#f44336"}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {portfolioSummary.isProfit ? '+' : ''}{portfolioSummary.gainLossPercentage?.toFixed(2)}% return
                    </Typography>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </motion.div>
      )}

      <Grid container spacing={3}>
        {/* Financial Health Score */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <Psychology sx={{ mr: 1, color: (theme) => theme.palette.primary.main }} />
                  <Typography variant="h6" fontWeight="bold">
                    Financial Health
                  </Typography>
                </Box>
                <Box textAlign="center" py={2}>
                  <Typography 
                    variant="h2" 
                    fontWeight="bold"
                    color={getHealthScoreColor(advice?.financialHealthScore || 0)}
                  >
                    {advice?.financialHealthScore || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    out of 100
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={advice?.financialHealthScore || 0}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getHealthScoreColor(advice?.financialHealthScore || 0),
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
                {advice?.spendingAdvice && (
                  <Box mt={2}>
                    <Chip
                      label={advice.spendingAdvice.level}
                      color={
                        advice.spendingAdvice.level === 'GOOD' ? 'success' :
                        advice.spendingAdvice.level === 'MODERATE' ? 'warning' : 'error'
                      }
                      size="small"
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {advice.spendingAdvice.message}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Expense Breakdown */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Expense Breakdown
                </Typography>
                {expenseData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography color="text.secondary">
                      No expense data available
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Active Goals */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <EmojiEvents sx={{ mr: 1, color: '#FFD700' }} />
                  <Typography variant="h6" fontWeight="bold">
                    Active Goals
                  </Typography>
                </Box>
                {goals.length > 0 ? (
                  <Box>
                    {goals.slice(0, 3).map((goal, index) => (
                      <Box key={goal.id} mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Typography variant="body1" fontWeight="medium">
                            {goal.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={(goal.currentAmount / goal.targetAmount) * 100}
                          sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                            },
                          }}
                        />
                        <Box display="flex" justifyContent="space-between" mt={0.5}>
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(goal.currentAmount)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatCurrency(goal.targetAmount)}
                          </Typography>
                        </Box>
                        {index < goals.slice(0, 3).length - 1 && <Divider sx={{ mt: 2 }} />}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography color="text.secondary">
                      No active goals. Create your first goal!
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Recent Transactions
                </Typography>
                {recentTransactions.length > 0 ? (
                  <Box>
                    {recentTransactions.map((transaction, index) => (
                      <Box key={transaction.id} mb={2}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="body1" fontWeight="medium">
                              {transaction.description}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(transaction.transactionDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body1"
                            fontWeight="bold"
                            color={transaction.type === 'INCOME' ? '#4caf50' : '#f44336'}
                          >
                            {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </Typography>
                        </Box>
                        {index < recentTransactions.length - 1 && <Divider sx={{ mt: 2 }} />}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography color="text.secondary">
                      No recent transactions
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;