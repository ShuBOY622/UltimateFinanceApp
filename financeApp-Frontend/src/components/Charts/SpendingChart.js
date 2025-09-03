import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Paper,
  Chip,
  Tooltip,
  IconButton
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  PieChart as PieChartIcon,
  TrendingDown,
  Assessment,
  Restaurant,
  DirectionsCar,
  ShoppingCart,
  Home,
  LocalHospital,
  School,
  Flight,
  InfoOutlined,
  ArrowUpward,
  ArrowDownward
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { transactionAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { useThemeContext } from '../../contexts/ThemeContext';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

const CATEGORY_ICONS = {
  FOOD: <Restaurant />,
  TRANSPORTATION: <DirectionsCar />,
  ENTERTAINMENT: <ShoppingCart />,
  SHOPPING: <ShoppingCart />,
  UTILITIES: <Home />,
  HEALTHCARE: <LocalHospital />,
  EDUCATION: <School />,
  TRAVEL: <Flight />,
  RENT: <Home />,
  INSURANCE: <Home />,
  OTHER_EXPENSE: <ShoppingCart />
};

const SpendingChart = ({ data, period = 'current' }) => {
  const { theme, currentTheme } = useThemeContext();
  const [chartType, setChartType] = useState('pie');
  const [spendingData, setSpendingData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data && data.expensesByCategory) {
      processSpendingData(data.expensesByCategory);
    } else {
      fetchSpendingData();
    }
  }, [data, period]);

  const fetchSpendingData = async () => {
    try {
      setLoading(true);
      const response = await transactionAPI.getSummary();
      if (response.data && response.data.expensesByCategory) {
        processSpendingData(response.data.expensesByCategory);
      }
    } catch (error) {
      toast.error('Failed to load spending data');
      console.error('Spending data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processSpendingData = (expensesByCategory) => {
    console.log('Processing spending data:', expensesByCategory);
    
    if (!expensesByCategory) {
      console.log('No expensesByCategory data provided');
      setSpendingData([]);
      return;
    }

    // Handle different data formats
    let dataArray = [];
    
    if (Array.isArray(expensesByCategory)) {
      // Handle array of arrays format: [["FOOD", 300.00], ["TRANSPORT", 150.00]]
      dataArray = expensesByCategory;
    } else if (typeof expensesByCategory === 'object') {
      // Handle object format: {"FOOD": 300.00, "TRANSPORT": 150.00}
      dataArray = Object.entries(expensesByCategory);
    } else {
      console.error('Unexpected expensesByCategory format:', typeof expensesByCategory, expensesByCategory);
      setSpendingData([]);
      return;
    }
    
    console.log('Processed dataArray:', dataArray);
    
    // Calculate total spending first
    const totalSpending = dataArray.reduce((sum, [category, amount]) => {
      const numericAmount = parseFloat(amount) || 0;
      return sum + numericAmount;
    }, 0);
    
    console.log('Total spending calculated:', totalSpending);
    
    const processedData = dataArray.map(([category, amount], index) => {
      const value = parseFloat(amount) || 0;
      const percentage = totalSpending > 0 ? (value / totalSpending) * 100 : 0;
      
      return {
        name: formatCategoryName(category),
        value: value,
        category: category,
        color: COLORS[index % COLORS.length],
        icon: CATEGORY_ICONS[category] || <ShoppingCart />,
        percentage: percentage
      };
    }).filter(item => item.value > 0);

    console.log('Final processed data:', processedData);
    setSpendingData(processedData);
  };

  const formatCategoryName = (category) => {
    return category.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const entry = payload[0];
      const percentage = entry.payload?.percentage || 0;
      
      return (
        <Paper
          elevation={8}
          sx={{
            p: 2.5,
            background: currentTheme === 'dark' 
              ? 'linear-gradient(135deg, rgba(15, 15, 35, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: currentTheme === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.15)'
              : '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: 3,
            boxShadow: currentTheme === 'dark' 
              ? '0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2)'
              : '0 10px 30px rgba(0, 0, 0, 0.1), 0 4px 8px rgba(0, 0, 0, 0.05)',
            minWidth: 200,
            maxWidth: 280,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: `linear-gradient(90deg, ${entry.color}, ${entry.color}CC)`,
              borderRadius: '12px 12px 0 0',
            }
          }}
        >
          {/* Category Header */}
          <Box display="flex" alignItems="center" mb={1.5}>
            <Avatar 
              sx={{ 
                bgcolor: entry.color, 
                width: 32, 
                height: 32, 
                mr: 1.5,
                boxShadow: `0 4px 12px ${entry.color}40`
              }}
            >
              {CATEGORY_ICONS[entry.payload?.category] || <ShoppingCart />}
            </Avatar>
            <Typography 
              variant="subtitle1" 
              fontWeight="700" 
              sx={{ 
                color: currentTheme === 'dark' ? '#ffffff' : 'rgba(15, 23, 42, 0.95)',
                textShadow: currentTheme === 'dark' ? '0 1px 2px rgba(0, 0, 0, 0.5)' : 'none'
              }}
            >
              {label}
            </Typography>
          </Box>
          
          {/* Amount Display */}
          <Box mb={1}>
            <Typography 
              variant="h6" 
              fontWeight="800"
              sx={{ 
                color: entry.color,
                fontSize: '1.25rem',
                textShadow: currentTheme === 'dark' ? '0 1px 3px rgba(0, 0, 0, 0.3)' : 'none',
                mb: 0.5
              }}
            >
              {formatCurrency(entry.value)}
            </Typography>
            
            {/* Percentage Badge */}
            {percentage > 0 && (
              <Chip
                label={`${percentage.toFixed(1)}% of total spending`}
                size="small"
                sx={{
                  background: currentTheme === 'dark' 
                    ? `${entry.color}20`
                    : `${entry.color}15`,
                  color: entry.color,
                  border: currentTheme === 'dark' 
                    ? `1px solid ${entry.color}40`
                    : `1px solid ${entry.color}30`,
                  fontWeight: '600',
                  fontSize: '0.75rem',
                  '& .MuiChip-label': {
                    px: 1
                  }
                }}
              />
            )}
          </Box>
          
          {/* Visual Progress Bar */}
          <Box>
            <Box 
              sx={{
                width: '100%',
                height: 4,
                backgroundColor: currentTheme === 'dark' 
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(15, 23, 42, 0.1)',
                borderRadius: 2,
                overflow: 'hidden',
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  width: `${Math.min(percentage, 100)}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${entry.color}, ${entry.color}BB)`,
                  borderRadius: 2,
                  transition: 'width 0.3s ease-in-out'
                }}
              />
            </Box>
            <Typography 
              variant="caption" 
              sx={{ 
                color: currentTheme === 'dark' 
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(15, 23, 42, 0.7)',
                mt: 0.5,
                display: 'block',
                textAlign: 'center'
              }}
            >
              Spending category breakdown
            </Typography>
          </Box>
        </Paper>
      );
    }
    return null;
  };

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show labels for very small slices

    return (
      <g>
        {/* Shadow/Outline for better readability */}
        {currentTheme === 'dark' && (
          <text
            x={x}
            y={y}
            fill="rgba(0, 0, 0, 0.8)"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            fontSize="12"
            fontWeight="bold"
            stroke="rgba(0, 0, 0, 0.8)"
            strokeWidth="3"
            paintOrder="stroke fill"
          >
            {`${(percent * 100).toFixed(0)}%`}
          </text>
        )}
        {/* Main text */}
        <text
          x={x}
          y={y}
          fill={currentTheme === 'dark' ? '#ffffff' : 'rgba(15, 23, 42, 0.95)'}
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize="12"
          fontWeight="bold"
          style={{
            filter: currentTheme === 'dark' ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))' : 'none'
          }}
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  const renderPieChart = () => {
    if (!spendingData || spendingData.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <PieChartIcon sx={{ fontSize: 60, color: currentTheme === 'dark' ? 'text.secondary' : 'rgba(15, 23, 42, 0.6)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: currentTheme === 'dark' ? 'text.secondary' : 'rgba(15, 23, 42, 0.6)' }}>
            No spending data available
          </Typography>
          <Typography variant="body2" sx={{ color: currentTheme === 'dark' ? 'text.secondary' : 'rgba(15, 23, 42, 0.6)' }}>
            Add some expense transactions to see your spending breakdown
          </Typography>
        </Box>
      );
    }

    // Sort data by value descending for better visualization
    const sortedData = [...spendingData].sort((a, b) => b.value - a.value);
    
    // Split into top categories and others for better visualization
    const topCategories = sortedData.slice(0, 6); // Increased from 5 to 6
    const otherCategories = sortedData.slice(6); // Updated index
    const otherTotal = otherCategories.reduce((sum, item) => sum + item.value, 0);
    
    // Prepare data for pie chart with "Others" category if needed
    const pieChartData = otherTotal > 0 
      ? [...topCategories, { name: 'Others', value: otherTotal, category: 'OTHERS', color: currentTheme === 'dark' ? '#94a3b8' : '#64748b', icon: <ShoppingCart /> }] 
      : topCategories;

    return (
      <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
          <Grid container spacing={2} sx={{ height: '100%' }}>
            <Grid item xs={12} md={7} sx={{ height: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomPieLabel}
                    outerRadius={100} // Increased from 90
                    innerRadius={50}  // Increased from 45
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </Grid>
            <Grid item xs={12} md={5} sx={{ height: '100%' }}>
              <Box sx={{ maxHeight: '100%', overflowY: 'auto', pr: 1 }}>
                <List dense>
                  {topCategories.map((item, index) => (
                    <motion.div
                      key={item.category}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <ListItem sx={{ py: 0.75 }}> {/* Increased padding */}
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: item.color, width: 36, height: 36 }}> {/* Increased size */}
                            {item.icon}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" fontWeight="medium" sx={{ color: currentTheme === 'dark' ? '#ffffff' : 'rgba(15, 23, 42, 0.95)' }}>
                                {item.name}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" sx={{ color: currentTheme === 'dark' ? '#ffffff' : 'rgba(15, 23, 42, 0.95)' }}>
                                {formatCurrency(item.value)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" sx={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)' }}>
                                {item.percentage?.toFixed(1) || 0}% of total
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < topCategories.length - 1 && <Divider sx={{ borderColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)' }} />}
                    </motion.div>
                  ))}
                  
                  {/* Show "Others" category if there are more than 6 categories */}
                  {otherTotal > 0 && (
                    <>
                      <Divider sx={{ my: 1, borderColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)' }} />
                      <ListItem sx={{ py: 0.75 }}> {/* Increased padding */}
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: currentTheme === 'dark' ? '#94a3b8' : '#64748b', width: 36, height: 36 }}> {/* Increased size */}
                            <ShoppingCart />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" fontWeight="medium" sx={{ color: currentTheme === 'dark' ? '#ffffff' : 'rgba(15, 23, 42, 0.95)' }}>
                                Others ({otherCategories.length} items)
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" sx={{ color: currentTheme === 'dark' ? '#ffffff' : 'rgba(15, 23, 42, 0.95)' }}>
                                {formatCurrency(otherTotal)}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" sx={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)' }}>
                                {((otherTotal / sortedData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}% of total
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  };

  const renderBarChart = () => {
    console.log('Rendering bar chart with data:', spendingData);
    
    if (!spendingData || spendingData.length === 0) {
      console.log('No spending data for bar chart');
      return (
        <Box 
          textAlign="center" 
          py={4}
          sx={{ 
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Assessment sx={{ fontSize: 60, color: currentTheme === 'dark' ? 'text.secondary' : 'rgba(15, 23, 42, 0.6)', mb: 2 }} />
          <Typography variant="h6" sx={{ color: currentTheme === 'dark' ? 'text.secondary' : 'rgba(15, 23, 42, 0.6)' }}>
            No spending data available
          </Typography>
          <Typography variant="body2" sx={{ color: currentTheme === 'dark' ? 'text.secondary' : 'rgba(15, 23, 42, 0.6)' }}>
            Add some expense transactions to see your spending breakdown
          </Typography>
        </Box>
      );
    }

    // Sort data by value descending
    const sortedData = [...spendingData].sort((a, b) => b.value - a.value);
    
    // Limit to top 10 categories for better visualization (increased from 8)
    const topCategories = sortedData.slice(0, 10);
    
    console.log('Top categories for bar chart:', topCategories);
    
    // Calculate max value for better scaling
    const maxValue = Math.max(...topCategories.map(item => item.value));

    return (
      <Box sx={{ height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1, width: '100%', minHeight: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={topCategories} 
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)'} />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12, fill: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)' }}
                stroke={currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)'}
              />
              <YAxis 
                stroke={currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)'}
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12, fill: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)' }}
              />
              <RechartsTooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                name="Amount Spent" 
                animationDuration={1000}
                radius={[4, 4, 0, 0]}
              >
                {topCategories.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
        
        {/* Show "View All Categories" button if there are more than 10 categories */}
        {spendingData.length > 10 && (
          <Box textAlign="center" mt={1}>
            <Typography variant="caption" sx={{ color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)' }}>
              Showing top 10 of {spendingData.length} categories
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const getTotalSpending = () => {
    return spendingData.reduce((sum, item) => sum + item.value, 0);
  };

  const getTopSpendingCategory = () => {
    if (spendingData.length === 0) return null;
    return spendingData.reduce((max, item) => item.value > max.value ? item : max);
  };

  const getAverageSpending = () => {
    if (spendingData.length === 0) return 0;
    const total = spendingData.reduce((sum, item) => sum + item.value, 0);
    return total / spendingData.length;
  };

  return (
    <Card 
      sx={{ 
        height: '100%',
        background: currentTheme === 'dark' 
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
          : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: currentTheme === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(15, 23, 42, 0.08)',
        borderRadius: 3,
        boxShadow: currentTheme === 'dark' 
          ? '0 8px 32px rgba(0, 0, 0, 0.3)'
          : '0 4px 20px rgba(15, 23, 42, 0.08)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #ef4444, #f97316)',
          borderRadius: '12px 12px 0 0'
        },
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 2, pb: '16px !important', height: '100%' }}>
        <Box display="flex" alignItems="center" justifyContent="between" mb={2}>
          <Box display="flex" alignItems="center">
            <TrendingDown sx={{ mr: 1, color: (theme) => theme.palette.error.main }} />
            <Typography variant="h6" fontWeight="600" sx={{ color: currentTheme === 'dark' ? 'text.primary' : 'rgba(15, 23, 42, 0.95)' }}>
              Spending by Category
            </Typography>
            <Tooltip title="Shows your spending breakdown by category">
              <IconButton size="small" sx={{ ml: 0.5 }}>
                <InfoOutlined sx={{ fontSize: 16, color: currentTheme === 'dark' ? 'text.secondary' : 'rgba(15, 23, 42, 0.7)' }} />
              </IconButton>
            </Tooltip>
          </Box>
          {spendingData.length > 0 && (
            <Box display="flex" gap={1}>
              <Chip 
                label={`Total: ${formatCurrency(getTotalSpending())}`}
                size="small"
                sx={{
                  background: currentTheme === 'dark' 
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(239, 68, 68, 0.1)',
                  color: currentTheme === 'dark' ? '#fca5a5' : '#dc2626',
                  border: currentTheme === 'dark' 
                    ? '1px solid rgba(239, 68, 68, 0.3)'
                    : '1px solid rgba(239, 68, 68, 0.2)'
                }}
              />
            </Box>
          )}
        </Box>

        {/* Spending Insights */}
        {spendingData.length > 0 && (
          <Box display="flex" gap={1} mb={2} flexWrap="wrap">
            <Chip 
              icon={<ArrowUpward sx={{ color: '#f87171 !important' }} />}
              label={`Top: ${getTopSpendingCategory()?.name || 'N/A'} (${formatCurrency(getTopSpendingCategory()?.value || 0)})`}
              size="small"
              sx={{
                background: currentTheme === 'dark' 
                  ? 'rgba(248, 113, 113, 0.15)'
                  : 'rgba(248, 113, 113, 0.1)',
                color: currentTheme === 'dark' ? '#f87171' : '#dc2626',
                border: currentTheme === 'dark' 
                  ? '1px solid rgba(248, 113, 113, 0.3)'
                  : '1px solid rgba(248, 113, 113, 0.2)',
                mb: 0.5
              }}
            />
            <Chip 
              icon={<ArrowDownward sx={{ color: '#60a5fa !important' }} />}
              label={`Avg: ${formatCurrency(getAverageSpending())}`}
              size="small"
              sx={{
                background: currentTheme === 'dark' 
                  ? 'rgba(96, 165, 250, 0.15)'
                  : 'rgba(96, 165, 250, 0.1)',
                color: currentTheme === 'dark' ? '#60a5fa' : '#2563eb',
                border: currentTheme === 'dark' 
                  ? '1px solid rgba(96, 165, 250, 0.3)'
                  : '1px solid rgba(96, 165, 250, 0.2)',
                mb: 0.5
              }}
            />
            <Chip 
              label={`${spendingData.length} categories`}
              size="small"
              sx={{
                background: currentTheme === 'dark' 
                  ? 'rgba(139, 92, 246, 0.15)'
                  : 'rgba(139, 92, 246, 0.1)',
                color: currentTheme === 'dark' ? '#c4b5fd' : '#7c3aed',
                border: currentTheme === 'dark' 
                  ? '1px solid rgba(139, 92, 246, 0.3)'
                  : '1px solid rgba(139, 92, 246, 0.2)',
                mb: 0.5
              }}
            />
          </Box>
        )}

        <Box sx={{ borderBottom: 1, borderColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(15, 23, 42, 0.1)', mb: 2 }}>
          <Tabs 
            value={chartType} 
            onChange={(event, newValue) => setChartType(newValue)}
            aria-label="chart type tabs"
            sx={{
              minHeight: 36,
              '& .MuiTab-root': {
                minHeight: 36,
                color: currentTheme === 'dark' 
                  ? 'rgba(255, 255, 255, 0.7)'
                  : 'rgba(15, 23, 42, 0.7)',
                '&.Mui-selected': {
                  color: '#f87171'
                },
                padding: '6px 12px'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#f87171'
              }
            }}
          >
            <Tab value="pie" label="Pie Chart" />
            <Tab value="bar" label="Bar Chart" />
          </Tabs>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, width: '100%' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={chartType}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ height: '100%', width: '100%' }}
            >
              {chartType === 'pie' ? renderPieChart() : renderBarChart()}
            </motion.div>
          </AnimatePresence>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SpendingChart;