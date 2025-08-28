import React, { useState, useEffect } from 'react';
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
  Chip
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
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
  Flight
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { transactionAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

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
    // Calculate total spending first
    const totalSpending = expensesByCategory.reduce((sum, [category, amount]) => sum + (parseFloat(amount) || 0), 0);
    
    const processedData = expensesByCategory.map(([category, amount], index) => {
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
            background: 'linear-gradient(135deg, rgba(15, 15, 35, 0.98) 0%, rgba(30, 41, 59, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 3,
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2)',
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
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
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
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
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
                  background: `${entry.color}20`,
                  color: entry.color,
                  border: `1px solid ${entry.color}40`,
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
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
                color: 'rgba(255, 255, 255, 0.7)',
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
        {/* Main text */}
        <text
          x={x}
          y={y}
          fill="#ffffff"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          fontSize="12"
          fontWeight="bold"
          style={{
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.8))'
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
          <PieChartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No spending data available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add some expense transactions to see your spending breakdown
          </Typography>
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={spendingData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomPieLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
              >
                {spendingData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Grid>
        <Grid item xs={12} md={4}>
          <List dense>
            {spendingData.map((item, index) => (
              <motion.div
                key={item.category}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: item.color, width: 32, height: 32 }}>
                      {item.icon}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(item.value)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {((item.value / spendingData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}% of total
                        </Typography>
                      </Box>
                    }
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                  />
                </ListItem>
                {index < spendingData.length - 1 && <Divider />}
              </motion.div>
            ))}
          </List>
        </Grid>
      </Grid>
    );
  };

  const renderBarChart = () => {
    if (!spendingData || spendingData.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No spending data available
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={spendingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            fontSize={12}
            stroke="rgba(255, 255, 255, 0.7)"
          />
          <YAxis stroke="rgba(255, 255, 255, 0.7)" />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            name="Amount Spent" 
            animationDuration={1000}
            radius={[4, 4, 0, 0]}
          >
            {spendingData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  const getTotalSpending = () => {
    return spendingData.reduce((sum, item) => sum + item.value, 0);
  };

  const getTopSpendingCategory = () => {
    if (spendingData.length === 0) return null;
    return spendingData.reduce((max, item) => item.value > max.value ? item : max);
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="between" mb={3}>
          <Box display="flex" alignItems="center">
            <TrendingDown sx={{ mr: 1, color: (theme) => theme.palette.error.main }} />
            <Typography variant="h6" fontWeight="600" color="text.primary">
              Spending by Category
            </Typography>
          </Box>
          {spendingData.length > 0 && (
            <Box display="flex" gap={2}>
              <Chip 
                label={`Total: ${formatCurrency(getTotalSpending())}`}
                color="error"
                variant="outlined"
              />
              {getTopSpendingCategory() && (
                <Chip 
                  label={`Top: ${getTopSpendingCategory().name}`}
                  color="warning"
                  variant="outlined"
                />
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={chartType} 
            onChange={(event, newValue) => setChartType(newValue)}
            aria-label="chart type tabs"
          >
            <Tab value="pie" label="Pie Chart" />
            <Tab value="bar" label="Bar Chart" />
          </Tabs>
        </Box>

        <AnimatePresence mode="wait">
          <motion.div
            key={chartType}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {chartType === 'pie' ? renderPieChart() : renderBarChart()}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default SpendingChart;