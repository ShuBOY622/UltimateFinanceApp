import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Avatar,
  Divider,
  Alert,
  Fade,
  Slide
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp,
  TrendingDown,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Assessment,
  PieChart as PieChartIcon,
  ShowChart,
  AccountBalance,
  EmojiEvents,
  Warning,
  AttachMoney,
  Business,
  DataUsage,
  Sync as SyncIcon,
  SyncDisabled,
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  ToggleOn,
  ToggleOff
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import InvestmentCharts from './InvestmentCharts';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme, profit }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  transform: 'translateY(0)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
  border: profit !== undefined ? 
    `2px solid ${profit ? theme.palette.success.main : theme.palette.error.main}` : 
    `1px solid ${theme.palette.divider}`,
  background: profit !== undefined ?
    `linear-gradient(135deg, ${profit ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)'}, ${theme.palette.background.paper})` :
    theme.palette.background.paper,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: profit !== undefined ?
      (profit ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)' : 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)') :
      'transparent',
  },
}));

const AnimatedFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  '&:hover': {
    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
    transform: 'scale(1.1)',
  },
}));

const INVESTMENT_TYPES = [
  { value: 'STOCK', label: 'Stock', icon: <ShowChart /> },
  { value: 'MUTUAL_FUND', label: 'Mutual Fund', icon: <PieChartIcon /> },
  { value: 'ETF', label: 'ETF', icon: <DataUsage /> },
  { value: 'BOND', label: 'Bond', icon: <AccountBalance /> },
  { value: 'CRYPTO', label: 'Cryptocurrency', icon: <AttachMoney /> },
  { value: 'GOLD', label: 'Gold', icon: <EmojiEvents /> },
  { value: 'REAL_ESTATE', label: 'Real Estate', icon: <Business /> },
  { value: 'OTHER', label: 'Other', icon: <Assessment /> }
];

const SECTORS = [
  'Technology', 'Finance', 'Healthcare', 'Consumer Goods', 'Energy',
  'Telecommunications', 'Utilities', 'Real Estate', 'Materials', 'Industrials'
];

const PLATFORMS = [
  'Groww', 'Zerodha', 'Yahoo Finance', 'Angel One', 'ICICI Direct', 'HDFC Securities', 'Kotak Securities', 'Manual Entry'
];

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [portfolioSummary, setPortfolioSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [apiStatus, setApiStatus] = useState(null);
  const [priceUpdateStatus, setPriceUpdateStatus] = useState(null);
  const [updatingPrices, setUpdatingPrices] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    type: 'STOCK',
    quantity: '',
    purchasePrice: '',
    purchaseDate: dayjs(),
    platform: 'Manual Entry',
    sector: '',
    notes: ''
  });

  useEffect(() => {
    fetchInvestments();
    fetchPortfolioSummary();
    fetchSuggestions();
    fetchApiStatus();
    fetchPriceUpdateStatus();
  }, []);

  const fetchInvestments = async () => {
    try {
      const response = await api.get('/investments');
      setInvestments(response.data);
    } catch (error) {
      toast.error('Failed to load investments');
      console.error('Investments error:', error);
    }
  };

  const fetchPortfolioSummary = async () => {
    try {
      const response = await api.get('/investments/portfolio/summary');
      setPortfolioSummary(response.data);
    } catch (error) {
      console.error('Portfolio summary error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await api.get('/investments/suggestions');
      setSuggestions(response.data);
    } catch (error) {
      console.error('Suggestions error:', error);
    }
  };

  const fetchApiStatus = async () => {
    try {
      const response = await api.get('/investments/api-status');
      setApiStatus(response.data);
    } catch (error) {
      console.error('API status error:', error);
    }
  };

  const fetchPriceUpdateStatus = async () => {
    try {
      const response = await api.get('/investments/price-update-status');
      setPriceUpdateStatus(response.data);
    } catch (error) {
      console.error('Price update status error:', error);
    }
  };

  const updateMarketPrices = async () => {
    try {
      setUpdatingPrices(true);
      await api.post('/investments/trigger-price-update');
      await fetchInvestments();
      await fetchPortfolioSummary();
      await fetchApiStatus();
      toast.success('Market prices updated successfully!');
    } catch (error) {
      toast.error('Failed to update market prices');
      console.error('Price update error:', error);
    } finally {
      setUpdatingPrices(false);
    }
  };

  const toggleLivePrice = async (investmentId, enabled) => {
    try {
      await api.post(`/investments/${investmentId}/toggle-live-price?enabled=${enabled}`);
      await fetchInvestments();
      toast.success(`Live price ${enabled ? 'enabled' : 'disabled'} successfully!`);
    } catch (error) {
      toast.error('Failed to toggle live price');
      console.error('Toggle live price error:', error);
    }
  };

  const refreshSinglePrice = async (investmentId) => {
    try {
      await api.post(`/investments/${investmentId}/refresh-price`);
      await fetchInvestments();
      toast.success('Price refreshed successfully!');
    } catch (error) {
      toast.error('Failed to refresh price');
      console.error('Refresh price error:', error);
    }
  };

  const handleOpenDialog = (investment = null) => {
    if (investment) {
      setEditingInvestment(investment);
      setFormData({
        symbol: investment.symbol,
        name: investment.name,
        type: investment.type,
        quantity: investment.quantity.toString(),
        purchasePrice: investment.purchasePrice.toString(),
        purchaseDate: dayjs(investment.purchaseDate),
        platform: investment.platform || 'Manual Entry',
        sector: investment.sector || '',
        notes: investment.notes || ''
      });
    } else {
      setEditingInvestment(null);
      setFormData({
        symbol: '',
        name: '',
        type: 'STOCK',
        quantity: '',
        purchasePrice: '',
        purchaseDate: dayjs(),
        platform: 'Manual Entry',
        sector: '',
        notes: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingInvestment(null);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      if (!formData.symbol?.trim() || !formData.name?.trim() || !formData.quantity || !formData.purchasePrice) {
        toast.error('Please fill in all required fields (Symbol, Name, Quantity, Purchase Price)');
        return;
      }

      const quantity = parseFloat(formData.quantity);
      const purchasePrice = parseFloat(formData.purchasePrice);

      if (isNaN(quantity) || quantity <= 0) {
        toast.error('Quantity must be a valid positive number');
        return;
      }

      if (isNaN(purchasePrice) || purchasePrice <= 0) {
        toast.error('Purchase price must be a valid positive number');
        return;
      }

      if (!formData.purchaseDate || !formData.purchaseDate.isValid()) {
        toast.error('Please select a valid purchase date');
        return;
      }

      const investmentData = {
        symbol: formData.symbol.trim().toUpperCase(),
        name: formData.name.trim(),
        type: formData.type,
        quantity: quantity,
        purchasePrice: purchasePrice,
        purchaseDate: formData.purchaseDate.format('YYYY-MM-DDTHH:mm:ss'),
        platform: formData.platform?.trim() || 'Manual Entry',
        sector: formData.sector?.trim() || null,
        notes: formData.notes?.trim() || null
      };

      if (editingInvestment) {
        await api.put(`/investments/${editingInvestment.id}`, investmentData);
        toast.success('Investment updated successfully!');
      } else {
        await api.post('/investments', investmentData);
        toast.success('Investment added successfully! Live price will be fetched automatically.');
      }

      fetchInvestments();
      fetchPortfolioSummary();
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to save investment');
      console.error('Save investment error:', error);
      console.error('Error response:', error.response?.data);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await api.delete(`/investments/${id}`);
        toast.success('Investment deleted successfully!');
        fetchInvestments();
        fetchPortfolioSummary();
      } catch (error) {
        toast.error('Failed to delete investment');
      }
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setFormData({
      ...formData,
      symbol: suggestion.symbol,
      name: suggestion.name,
      type: suggestion.type
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const StatCard = ({ title, value, icon, color, trend, trendValue }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledCard>
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
              <Avatar sx={{ bgcolor: color, width: 56, height: 56 }}>
                {icon}
              </Avatar>
            </motion.div>
          </Box>
        </CardContent>
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
          <ShowChart sx={{ fontSize: 60, color: (theme) => theme.palette.primary.main }} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
            Loading your investment portfolio...
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
              Investment Portfolio
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage your investments with real-time analytics.
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <Tooltip title="Update Market Prices">
              <IconButton onClick={updateMarketPrices} color="primary">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </motion.div>

      {/* API Status Alert */}
      {apiStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Alert
            severity={apiStatus.yahooFinanceApiAvailable ? "success" : "info"}
            sx={{ mb: 3 }}
            icon={apiStatus.yahooFinanceApiAvailable ? <CheckCircle /> : <Warning />}
            action={
              <Box display="flex" alignItems="center" gap={1}>
                {priceUpdateStatus && (
                  <Chip
                    size="small"
                    label={priceUpdateStatus.marketOpen ? "Market Open" : "Market Closed"}
                    color={priceUpdateStatus.marketOpen ? "success" : "default"}
                    icon={priceUpdateStatus.marketOpen ? <TrendingUp /> : <Schedule />}
                  />
                )}
                <Button
                  size="small"
                  onClick={updateMarketPrices}
                  disabled={updatingPrices}
                  startIcon={updatingPrices ? <SyncIcon className="animate-spin" /> : <RefreshIcon />}
                >
                  {updatingPrices ? "Updating..." : "Update Prices"}
                </Button>
              </Box>
            }
          >
            <Typography variant="subtitle2">
              {apiStatus.yahooFinanceApiAvailable
                ? `Live Price Updates: Active (${apiStatus.supportedSymbolsCount} symbols supported)`
                : "Live Price Updates: Configure Yahoo Finance API for real-time price updates"}
            </Typography>
            {!apiStatus.priceUpdateEnabled && (
              <Typography variant="body2" color="text.secondary">
                Price updates are currently disabled in configuration
              </Typography>
            )}
          </Alert>
        </motion.div>
      )}

      {/* Portfolio Summary Cards */}
      {portfolioSummary && (
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Investment"
              value={formatCurrency(portfolioSummary.totalInvestment)}
              icon={<AccountBalance />}
              color="#1976d2"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Current Value"
              value={formatCurrency(portfolioSummary.currentValue)}
              icon={<AttachMoney />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Gain/Loss"
              value={formatCurrency(portfolioSummary.totalGainLoss)}
              icon={portfolioSummary.isProfit ? <TrendingUp /> : <TrendingDown />}
              color={portfolioSummary.isProfit ? "#4caf50" : "#f44336"}
              trend={portfolioSummary.isProfit ? 'up' : 'down'}
              trendValue={`${portfolioSummary.gainLossPercentage?.toFixed(2)}%`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Holdings"
              value={portfolioSummary.totalHoldings}
              icon={<PieChartIcon />}
              color="#ff9800"
            />
          </Grid>
        </Grid>
      )}

      {/* Charts Section */}
      <InvestmentCharts />

      {/* Investments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" mb={2}>
              Your Investments
            </Typography>
            
            {investments.length === 0 ? (
              <Box textAlign="center" py={4}>
                <ShowChart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No investments yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={3}>
                  Start building your portfolio by adding your first investment.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Investment
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {investments.map((investment, index) => {
                  // Calculate profit on frontend to ensure correct display
                  const calculatedProfit = investment.currentValue > investment.totalInvestment;
                  const actualGainLoss = investment.currentValue - investment.totalInvestment;
                  const actualGainLossPercentage = ((actualGainLoss / investment.totalInvestment) * 100);
                  
                  return (
                  <Grid item xs={12} md={6} lg={4} key={investment.id}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <StyledCard profit={calculatedProfit}>
                        <CardContent>
                          <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                            <Box>
                              <Typography variant="h6" fontWeight="bold">
                                {investment.symbol}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {investment.name}
                              </Typography>
                            </Box>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              {/* Live Price Status */}
                              <Tooltip title={
                                investment.livePriceEnabled 
                                  ? `Live price ${investment.priceSource === 'YAHOO_FINANCE' ? 'from Yahoo Finance' : investment.priceSource?.toLowerCase() || 'enabled'}`
                                  : "Live price disabled"
                              }>
                                <IconButton
                                  size="small"
                                  onClick={() => toggleLivePrice(investment.id, !investment.livePriceEnabled)}
                                  color={investment.livePriceEnabled ? "success" : "default"}
                                >
                                  {investment.livePriceEnabled ? <ToggleOn /> : <ToggleOff />}
                                </IconButton>
                              </Tooltip>
                              
                              {/* Refresh Single Price */}
                              {investment.livePriceEnabled && (
                                <Tooltip title="Refresh price">
                                  <IconButton
                                    size="small"
                                    onClick={() => refreshSinglePrice(investment.id)}
                                  >
                                    <SyncIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(investment)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(investment.id)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </Box>
                          
                          <Box mb={2}>
                            <Chip
                              label={investment.type.replace('_', ' ')}
                              size="small"
                              color="primary"
                              sx={{ mr: 1 }}
                            />
                            {investment.sector && (
                              <Chip
                                label={investment.sector}
                                size="small"
                                variant="outlined"
                                sx={{ mr: 1 }}
                              />
                            )}
                            {/* Price Source Indicator */}
                            {investment.priceSource && (
                              <Chip
                                label={investment.priceSource}
                                size="small"
                                color={
                                  investment.priceSource === 'YAHOO_FINANCE' ? 'success' :
                                  investment.priceSource === 'MANUAL' ? 'default' : 'warning'
                                }
                                icon={
                                  investment.priceSource === 'YAHOO_FINANCE' ? <CheckCircle /> :
                                  investment.priceSource === 'MANUAL' ? <EditIcon /> : <Warning />
                                }
                              />
                            )}
                          </Box>

                          {/* Price Update Status */}
                          {investment.lastPriceUpdate && (
                            <Box mb={1}>
                              <Typography variant="caption" color="text.secondary">
                                Last updated: {new Date(investment.lastPriceUpdate).toLocaleString()}
                              </Typography>
                            </Box>
                          )}
                          
                          {/* Price Update Error */}
                          {investment.lastPriceError && (
                            <Box mb={1}>
                              <Alert severity="warning" sx={{ p: 0.5 }}>
                                <Typography variant="caption">
                                  {investment.lastPriceError}
                                </Typography>
                              </Alert>
                            </Box>
                          )}

                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              Quantity:
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {investment.quantity}
                            </Typography>
                          </Box>

                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              Purchase Price:
                            </Typography>
                            <Typography variant="body2">
                              {formatCurrency(investment.purchasePrice)}
                            </Typography>
                          </Box>

                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              Current Price:
                            </Typography>
                            <Typography variant="body2">
                              {formatCurrency(investment.currentPrice)}
                            </Typography>
                          </Box>

                          <Divider sx={{ my: 1 }} />

                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              Investment:
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {formatCurrency(investment.totalInvestment)}
                            </Typography>
                          </Box>

                          <Box display="flex" justifyContent="space-between" mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              Current Value:
                            </Typography>
                            <Typography 
                              variant="body2" 
                              fontWeight="bold"
                              sx={{
                                color: calculatedProfit ? '#4caf50' : '#f44336'
                              }}
                            >
                              {formatCurrency(investment.currentValue)}
                            </Typography>
                          </Box>

                          <Box display="flex" justifyContent="space-between" mb={2}>
                            <Typography variant="body2" color="text.secondary">
                              Gain/Loss:
                            </Typography>
                            <Box display="flex" alignItems="center" gap={0.5}>
                              {calculatedProfit ? (
                                <TrendingUp sx={{ fontSize: 16, color: '#4caf50' }} />
                              ) : (
                                <TrendingDown sx={{ fontSize: 16, color: '#f44336' }} />
                              )}
                              <Typography
                                variant="body2"
                                fontWeight="bold"
                                sx={{
                                  color: calculatedProfit ? '#4caf50' : '#f44336',
                                  backgroundColor: calculatedProfit ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: `1px solid ${calculatedProfit ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)'}`
                                }}
                              >
                                {calculatedProfit ? '+' : ''}{formatCurrency(actualGainLoss)} ({actualGainLossPercentage.toFixed(2)}%)
                              </Typography>
                            </Box>
                          </Box>

                          <Box sx={{ mt: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                              <Typography variant="caption" color="text.secondary">
                                Performance
                              </Typography>
                              <Typography 
                                variant="caption" 
                                fontWeight="bold"
                                sx={{ color: calculatedProfit ? '#4caf50' : '#f44336' }}
                              >
                                {calculatedProfit ? '▲' : '▼'} {Math.abs(actualGainLossPercentage).toFixed(2)}%
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(Math.abs(actualGainLossPercentage), 100)}
                              sx={{
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: calculatedProfit ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                '& .MuiLinearProgress-bar': {
                                  backgroundColor: calculatedProfit ? '#4caf50' : '#f44336',
                                  borderRadius: 4,
                                  background: calculatedProfit 
                                    ? 'linear-gradient(90deg, #4caf50 0%, #66bb6a 100%)'
                                    : 'linear-gradient(90deg, #f44336 0%, #ef5350 100%)',
                                },
                              }}
                            />
                          </Box>
                        </CardContent>
                      </StyledCard>
                    </motion.div>
                  </Grid>
                  );
                })}
              </Grid>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Floating Action Button */}
      <AnimatedFab
        onClick={() => handleOpenDialog()}
        aria-label="add investment"
      >
        <AddIcon />
      </AnimatedFab>

      {/* Investment Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingInvestment ? 'Edit Investment' : 'Add Investment'}
        </DialogTitle>
        <DialogContent>
          {/* Auto Price Fetching Info */}
          {!editingInvestment && apiStatus?.yahooFinanceApiAvailable && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                🚀 <strong>Smart Price Fetching:</strong> Current market prices will be fetched automatically from Yahoo Finance API.
                Just enter your investment details!
              </Typography>
            </Alert>
          )}
          
          {!editingInvestment && !apiStatus?.yahooFinanceApiAvailable && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="body2">
                📝 <strong>Manual Mode:</strong> Live price updates are not configured. You can still track your investments manually.
              </Typography>
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Symbol"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company/Fund Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Investment Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
              >
                {INVESTMENT_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    <Box display="flex" alignItems="center">
                      {type.icon}
                      <Typography sx={{ ml: 1 }}>{type.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              >
                {SECTORS.map((sector) => (
                  <MenuItem key={sector} value={sector}>
                    {sector}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Purchase Price"
                value={formData.purchasePrice}
                onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                required
                helperText="Current market price will be fetched automatically"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Purchase Date"
                  value={formData.purchaseDate}
                  onChange={(newValue) => setFormData({ ...formData, purchaseDate: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Platform"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              >
                {PLATFORMS.map((platform) => (
                  <MenuItem key={platform} value={platform}>
                    {platform}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* Popular Suggestions */}
          {!editingInvestment && suggestions.length > 0 && (
            <Box mt={3}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Popular Indian Stocks:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {suggestions.slice(0, 10).map((suggestion) => (
                  <Chip
                    key={suggestion.symbol}
                    label={`${suggestion.symbol} - ${suggestion.name}`}
                    size="small"
                    onClick={() => handleSuggestionSelect(suggestion)}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingInvestment ? 'Update' : 'Add'} Investment
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Investments;