import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Button,
  LinearProgress,
  Alert,
  Skeleton,
  Container,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Assessment,
  Refresh,
  AttachMoney,
  SaveAlt,
  ShowChart,
  Notifications,
  EmojiEvents,
  AutoGraph,
  FileUpload,
  Star,
  Add,
  Timeline,
  Upload,
  CloudUpload,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { alpha } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext';
import { transactionAPI, investmentAPI, budgetAPI, goalAPI, advisorAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import SpendingChart from './Charts/SpendingChart';

const COLORS = ['#667eea', '#764ba2', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: null,
    portfolio: null,
    budget: null,
    goals: [],
    transactions: [],
    advice: null,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [
        summaryRes,
        portfolioRes,
        budgetRes,
        goalsRes,
        transactionsRes,
        adviceRes,
      ] = await Promise.allSettled([
        transactionAPI.getSummary(),
        investmentAPI.getPortfolioSummary(),
        budgetAPI.getAnalysis(),
        goalAPI.getActive(),
        transactionAPI.getAll(),
        advisorAPI.getAdvice(),
      ]);

      setData({
        summary: summaryRes.status === 'fulfilled' ? summaryRes.value.data : null,
        portfolio: portfolioRes.status === 'fulfilled' ? portfolioRes.value.data : null,
        budget: budgetRes.status === 'fulfilled' ? budgetRes.value.data : null,
        goals: goalsRes.status === 'fulfilled' ? goalsRes.value.data : [],
        transactions: transactionsRes.status === 'fulfilled' ? transactionsRes.value.data.slice(0, 5) : [],
        advice: adviceRes.status === 'fulfilled' ? adviceRes.value.data : null,
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard data');
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

  const StatCard = ({ title, value, change, changeType, icon: Icon, color, delay = 0 }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -4 }}
    >
      <Card
        sx={{
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.6)})`,
          },
        }}
      >
        <CardContent sx={{ pb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Avatar
              sx={{
                bgcolor: (theme) => alpha(color, 0.1),
                color: color,
                width: 48,
                height: 48,
              }}
            >
              <Icon />
            </Avatar>
            {change && (
              <Chip
                icon={changeType === 'increase' ? <TrendingUp /> : <TrendingDown />}
                label={`${change > 0 ? '+' : ''}${change}%`}
                color={changeType === 'increase' ? 'success' : 'error'}
                size="small"
              />
            )}
          </Box>
          <Typography variant="h4" fontWeight="700" sx={{ color: 'text.primary', mb: 1 }}>
            {value}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {title}
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );

  const PortfolioChart = ({ data }) => (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={60}
          innerRadius={30}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <RechartsTooltip
          formatter={(value) => formatCurrency(value)}
          labelStyle={{ color: '#1e293b' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  if (loading) {
    return (
      <Box p={3}>
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
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

  const welcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Quick action handlers for flagship features
  const handleQuickInvest = () => {
    navigate('/investments');
  };

  const handleQuickUpload = () => {
    navigate('/transactions', { state: { fromDashboard: true } });
  };

  const handleAddTransaction = () => {
    navigate('/transactions', { state: { fromDashboard: true } });
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box mb={4}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Box>
              <Typography variant="h3" fontWeight="700" sx={{ color: 'text.primary' }}>
                {welcomeMessage()}, {user?.firstName}! 👋
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
                Your AI-Powered Financial Command Center
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchDashboardData}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Box>
        </Box>
      </motion.div>

      {/* Flagship Features Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={3} mb={4}>
            <Grid item xs={12} md={6}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    minHeight: 220,
                    position: 'relative',
                    overflow: 'hidden',
                    border: 'none',
                    '&:hover': {
                      boxShadow: '0 20px 40px rgba(102, 126, 234, 0.4)',
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onClick={handleQuickInvest}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 2, p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <AutoGraph sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          Real-Time Investment Tracking
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                          Live portfolio • Investment analytics
                        </Typography>
                      </Box>
                    </Box>
                    
                    {data.portfolio && data.portfolio.totalHoldings > 0 ? (
                      <Box mt={3}>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>Portfolio Value</Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {formatCurrency(data.portfolio.currentValue)}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>Today's P&L</Typography>
                            <Typography 
                              variant="h6" 
                              fontWeight="bold"
                              color={data.portfolio.totalGainLoss >= 0 ? '#4caf50' : '#ff5252'}
                            >
                              {data.portfolio.totalGainLoss >= 0 ? '+' : ''}{formatCurrency(data.portfolio.totalGainLoss || 0)}
                            </Typography>
                          </Grid>
                        </Grid>
                        <Box display="flex" alignItems="center" mt={2}>
                          <Chip 
                            label={`${data.portfolio.totalHoldings} Active Holdings`}
                            sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                            size="small"
                          />
                          <Star sx={{ ml: 1, color: '#FFD700' }} />
                        </Box>
                      </Box>
                    ) : (
                      <Box mt={3}>
                        <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                          🚀 Start tracking your investments with live market data
                        </Typography>
                        <Button 
                          variant="contained" 
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)', 
                            '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                            border: '1px solid rgba(255,255,255,0.3)'
                          }}
                          startIcon={<Add />}
                        >
                          Add First Investment
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 150,
                      height: 150,
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      zIndex: 1
                    }}
                  />
                </Card>
              </motion.div>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card 
                  sx={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    cursor: 'pointer',
                    minHeight: 220,
                    position: 'relative',
                    overflow: 'hidden',
                    border: 'none',
                    '&:hover': {
                      boxShadow: '0 20px 40px rgba(240, 147, 251, 0.4)',
                      transform: 'translateY(-4px)',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                  onClick={handleQuickUpload}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 2, p: 3 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <FileUpload sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h5" fontWeight="bold">
                          Smart PDF Parser
                        </Typography>
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                           Instant extraction
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box mt={3}>
                      <Typography variant="body1" sx={{ opacity: 0.9, mb: 2 }}>
                        📄 Upload bank statements or Upi statements and extract transactions 
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
                        <Chip 
                          label="PDF Parser"
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                          size="small"
                        />
                        <Chip 
                          label="Auto Extract"
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                          size="small"
                        />
                        <Chip 
                          label="No need to log trx daily"
                          sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                          size="small"
                        />
                      </Box>
                      <Button 
                        variant="contained" 
                        sx={{ 
                          backgroundColor: 'rgba(255,255,255,0.2)', 
                          '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                          border: '1px solid rgba(255,255,255,0.3)'
                        }}
                        startIcon={<Upload />}
                      >
                        Parse Documents
                      </Button>
                    </Box>
                  </CardContent>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 150,
                      height: 150,
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      zIndex: 1
                    }}
                  />
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </motion.div>

      {/* Budget Alert */}
      <AnimatePresence>
        {data.budget?.warnings?.hasWarnings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Alert
              severity="warning"
              sx={{ mb: 3, borderRadius: 2 }}
              action={
                <Button color="inherit" size="small">
                  View Budget
                </Button>
              }
            >
              <Typography variant="subtitle2">Budget Alert!</Typography>
              You're exceeding your budget in some categories.
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Key Metrics */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Net Worth"
            value={formatCurrency((data.summary?.netBalance || 0) + (data.portfolio?.currentValue || 0))}
            change={12.5}
            changeType="increase"
            icon={AccountBalance}
            color="#6366f1"
            delay={0.1}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cash Balance"
            value={formatCurrency(data.summary?.cashBalance || data.summary?.netBalance)}
            change={8.2}
            changeType="increase"
            icon={AttachMoney}
            color="#10b981"
            delay={0.15}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Income"
            value={formatCurrency(data.summary?.monthlyIncome)}
            change={8.2}
            changeType="increase"
            icon={TrendingUp}
            color="#10b981"
            delay={0.2}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(data.summary?.monthlyExpenses)}
            change={-3.1}
            changeType="decrease"
            icon={AttachMoney}
            color="#ef4444"
            delay={0.3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Investment Returns"
            value={data.portfolio ? formatCurrency(data.portfolio.totalGainLoss || 0) : "₹0"}
            change={data.portfolio?.gainLossPercentage || 0}
            changeType={data.portfolio?.totalGainLoss >= 0 ? "increase" : "decrease"}
            icon={Timeline}
            color={data.portfolio?.totalGainLoss >= 0 ? "#4caf50" : "#f44336"}
            delay={0.4}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Savings Rate"
            value={`${Math.round(data.summary?.savingsRate || 0)}%`}
            change={5.2}
            changeType="increase"
            icon={SaveAlt}
            color="#8b5cf6"
            delay={0.45}
          />
        </Grid>
      </Grid>

      {/* Charts and Analytics */}
      <Grid container spacing={3} mb={4}>
        {/* Portfolio Overview */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card sx={{ height: '300px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={2}>
                  <ShowChart sx={{ mr: 1, color: (theme) => theme.palette.primary.main }} />
                  <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
                    Portfolio Distribution
                  </Typography>
                </Box>
                {data.portfolio?.totalHoldings > 0 ? (
                  <Box>
                    <PortfolioChart 
                      data={[
                        { name: 'Stocks', value: data.portfolio?.totalInvestment * 0.6 },
                        { name: 'Bonds', value: data.portfolio?.totalInvestment * 0.3 },
                        { name: 'Cash', value: data.portfolio?.totalInvestment * 0.1 },
                      ]}
                    />
                    <Box mt={2} textAlign="center">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Total Portfolio Value
                      </Typography>
                      <Typography variant="h5" fontWeight="600" sx={{ color: 'primary.main' }}>
                        {formatCurrency(data.portfolio?.currentValue)}
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    height="200px"
                    flexDirection="column"
                  >
                    <AutoGraph sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
                      Start tracking investments with live market data
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ mt: 1 }}
                      onClick={handleQuickInvest}
                      startIcon={<Add />}
                    >
                      Add First Investment
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Financial Health Score */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card sx={{ height: '300px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Assessment sx={{ mr: 1, color: (theme) => theme.palette.secondary.main }} />
                  <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
                    Financial Health Score
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Box position="relative" display="inline-flex" mb={3}>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.8, delay: 0.7 }}
                    >
                      <Avatar
                        sx={{
                          width: 120,
                          height: 120,
                          bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                          fontSize: '2rem',
                          fontWeight: 700,
                          color: (theme) => theme.palette.success.main,
                        }}
                      >
                        {data.advice?.financialHealthScore || 85}
                      </Avatar>
                    </motion.div>
                  </Box>
                  <Typography variant="h5" fontWeight="600" sx={{ color: 'success.main', mb: 1 }}>
                    Excellent
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Your financial health is strong. Keep up the good work!
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={data.advice?.financialHealthScore || 85}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                      '& .MuiLinearProgress-bar': {
                        bgcolor: (theme) => theme.palette.success.main,
                        borderRadius: 4,
                      },
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Spending Analysis and Goals */}
      <Grid container spacing={3} mb={4}>
        {/* Spending Chart */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <SpendingChart data={data.summary} />
          </motion.div>
        </Grid>

        {/* Monthly Spending Trend - Placeholder for future enhancement */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card sx={{ height: '400px' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <Assessment sx={{ mr: 1, color: (theme) => theme.palette.info.main }} />
                  <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
                    Spending Insights
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  flexDirection="column"
                  alignItems="center"
                  justifyContent="center"
                  height="300px"
                >
                  <ShowChart sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                    Coming Soon
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
                    Monthly spending trends and insights will be available here
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Goals and Recent Transactions */}
      <Grid container spacing={3}>
        {/* Active Goals */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={3}>
                  <EmojiEvents sx={{ mr: 1, color: (theme) => theme.palette.warning.main }} />
                  <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
                    Active Goals
                  </Typography>
                </Box>
                {data.goals.length > 0 ? (
                  <Box>
                    {data.goals.slice(0, 3).map((goal, index) => (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                      >
                        <Box mb={3}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="subtitle1" fontWeight="500" sx={{ color: 'text.primary' }}>
                              {goal.name}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={(goal.currentAmount / goal.targetAmount) * 100}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                              '& .MuiLinearProgress-bar': {
                                bgcolor: (theme) => theme.palette.primary.main,
                                borderRadius: 4,
                              },
                            }}
                          />
                          <Box display="flex" justifyContent="space-between" mt={1}>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {formatCurrency(goal.currentAmount)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {formatCurrency(goal.targetAmount)}
                            </Typography>
                          </Box>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                ) : (
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    height="150px"
                    flexDirection="column"
                  >
                    <EmojiEvents sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography sx={{ color: 'text.secondary', mb: 2 }}>
                      No active goals
                    </Typography>
                    <Button variant="contained">
                      Create Goal
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Recent Transactions */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
                  <Box display="flex" alignItems="center">
                    <Notifications sx={{ mr: 1, color: (theme) => theme.palette.info.main }} />
                    <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
                      Recent Activity
                    </Typography>
                  </Box>
                </Box>
                {data.transactions.length > 0 ? (
                  <Box>
                    {data.transactions.map((transaction, index) => (
                      <motion.div
                        key={transaction.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                      >
                        <Box 
                          display="flex" 
                          justifyContent="space-between" 
                          alignItems="center"
                          py={2}
                          borderBottom={index < data.transactions.length - 1 ? '1px solid' : 'none'}
                          borderColor="divider"
                        >
                          <Box>
                            <Typography variant="subtitle2" fontWeight="500" sx={{ color: 'text.primary' }}>
                              {transaction.description}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {new Date(transaction.transactionDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            sx={{ color: transaction.type === 'INCOME' ? 'success.main' : 'error.main' }}
                          >
                            {transaction.type === 'INCOME' ? '+' : '-'}
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </Box>
                      </motion.div>
                    ))}
                  </Box>
                ) : (
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    height="150px"
                    flexDirection="column"
                  >
                    <FileUpload sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                    <Typography sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
                      Add transactions manually or view existing ones
                    </Typography>
                    <Box display="flex" gap={1}>
                      <Button 
                        variant="outlined"
                        size="small"
                        onClick={handleAddTransaction}
                        startIcon={<Add />}
                      >
                        Add Manual
                      </Button>
                      <Button 
                        variant="contained"
                        size="small"
                        onClick={handleQuickUpload}
                        startIcon={<Timeline />}
                      >
                        View Transactions
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
      
      {/* Floating Action Buttons for Quick Actions */}
      <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Tooltip title="View Transactions" placement="left">
            <Fab
              color="secondary"
              onClick={handleQuickUpload}
              sx={{ 
                background: 'linear-gradient(45deg, #f093fb 30%, #f5576c 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #f5576c 30%, #f093fb 90%)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease-in-out',
                boxShadow: '0 8px 25px rgba(240, 147, 251, 0.4)'
              }}
            >
              <Timeline />
            </Fab>
          </Tooltip>
          
          <Tooltip title="View Portfolio" placement="left">
            <Fab
              color="primary"
              onClick={handleQuickInvest}
              sx={{ 
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.3s ease-in-out',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
              }}
            >
              <AutoGraph />
            </Fab>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;