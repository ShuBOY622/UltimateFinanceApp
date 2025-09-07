import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShowChart,
  PieChart as PieChartIcon,
  Assessment,
  EmojiEvents,
  Warning
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../../utils/api';
import { useThemeContext } from '../../contexts/ThemeContext';

const ChartCard = styled(Card)(({ theme }) => ({
  height: '100%',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8',
  '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff0000'
];

const CHART_TYPES = [
  { value: 'distribution', label: 'Distribution' },
  { value: 'performance', label: 'Performance' },
  { value: 'sectors', label: 'Sectors' }
];

const InvestmentCharts = () => {
  const { currentTheme } = useThemeContext();
  const [chartType, setChartType] = useState('distribution');
  const [portfolioData, setPortfolioData] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      const [distributionRes, performanceRes] = await Promise.all([
        api.get('/investments/portfolio/distribution'),
        api.get('/investments/portfolio/performance')
      ]);

      setPortfolioData(distributionRes.data);
      setPerformanceData(performanceRes.data);
    } catch (error) {
      console.error('Chart data error:', error);
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Box
          sx={{
            backgroundColor: currentTheme === 'dark' 
              ? 'rgba(30, 41, 59, 0.9)' 
              : 'rgba(255, 255, 255, 0.9)',
            border: '1px solid',
            borderColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            borderRadius: 1,
            p: 1.5,
            boxShadow: currentTheme === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
              : '0 4px 20px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <Typography 
            variant="body2" 
            fontWeight="bold"
            sx={{ color: currentTheme === 'dark' ? '#fff' : '#000' }}
          >
            {label}
          </Typography>
          {payload.map((entry, index) => (
            <Typography
              key={index}
              variant="body2"
              sx={{ color: entry.color }}
            >
              {entry.name}: {formatCurrency(entry.value)}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={currentTheme === 'dark' ? "white" : "rgba(15, 23, 42, 0.95)"}
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderDistributionChart = () => {
    if (!portfolioData?.byType || portfolioData.byType.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <PieChartIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No investment data available
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
                data={portfolioData.byType}
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
                {portfolioData.byType.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </Grid>
        <Grid item xs={12} md={4}>
          <List dense>
            {portfolioData.byType.map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem sx={{ 
                  color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)'
                }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: COLORS[index % COLORS.length], width: 24, height: 24 }}>
                      <Box 
                        width={12} 
                        height={12} 
                        bgcolor={currentTheme === 'dark' ? "white" : "black"} 
                        borderRadius="50%" 
                      />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.name}
                    secondary={formatCurrency(item.value)}
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontWeight: 'medium',
                      sx: { color: currentTheme === 'dark' ? '#fff' : 'rgba(15, 23, 42, 0.95)' }
                    }}
                    secondaryTypographyProps={{ 
                      variant: 'caption',
                      sx: { color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)' }
                    }}
                  />
                </ListItem>
                {index < portfolioData.byType.length - 1 && <Divider sx={{ 
                  borderColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
                }} />}
              </motion.div>
            ))}
          </List>
        </Grid>
      </Grid>
    );
  };

  const renderPerformanceChart = () => {
    if (!performanceData?.topPerformers || performanceData.topPerformers.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No performance data available
          </Typography>
        </Box>
      );
    }

    const chartData = [
      ...performanceData.topPerformers.slice(0, 5).map(item => ({
        name: item.symbol,
        gainLoss: item.gainLoss,
        gainLossPercentage: item.gainLossPercentage,
        type: 'profit'
      })),
      ...performanceData.bottomPerformers.slice(0, 5).map(item => ({
        name: item.symbol,
        gainLoss: item.gainLoss,
        gainLossPercentage: item.gainLossPercentage,
        type: 'loss'
      }))
    ];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 
              />
              <XAxis 
                dataKey="name" 
                stroke={currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'}
              />
              <YAxis 
                stroke={currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="gainLoss"
                fill="#8884d8"
                name="Gain/Loss"
                animationDuration={1000}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.gainLoss >= 0 ? '#4caf50' : '#f44336'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Grid>
      </Grid>
    );
  };

  const renderSectorChart = () => {
    if (!portfolioData?.bySector || portfolioData.bySector.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <ShowChart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No sector data available
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Add sector information to your investments to see this chart.
          </Typography>
        </Box>
      );
    }

    return (
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={portfolioData.bySector}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 
          />
          <XAxis 
            dataKey="name" 
            stroke={currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'}
          />
          <YAxis 
            stroke={currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    );
  };

  const renderTopPerformers = () => {
    if (!performanceData?.topPerformers || performanceData.topPerformers.length === 0) {
      return null;
    }

    return (
      <ChartCard sx={{ 
        background: currentTheme === 'dark' 
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
          : 'rgba(255, 255, 255, 0.8)',
        border: currentTheme === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(10px)'
      }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <EmojiEvents sx={{ color: '#FFD700', mr: 1 }} />
            <Typography 
              variant="h6" 
              fontWeight="bold"
              sx={{ color: currentTheme === 'dark' ? '#fff' : 'rgba(15, 23, 42, 0.95)' }}
            >
              Top Performers
            </Typography>
          </Box>
          <List dense>
            {performanceData.topPerformers.slice(0, 5).map((investment, index) => (
              <motion.div
                key={investment.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem sx={{ 
                  color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)'
                }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#4caf50', width: 32, height: 32 }}>
                      <TrendingUp />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={investment.symbol}
                    secondary={investment.name}
                    primaryTypographyProps={{ 
                      fontWeight: 'bold',
                      sx: { color: currentTheme === 'dark' ? '#fff' : 'rgba(15, 23, 42, 0.95)' }
                    }}
                    secondaryTypographyProps={{ 
                      sx: { color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)' }
                    }}
                  />
                  <Box textAlign="right">
                    <Typography 
                      variant="body2" 
                      color="#4caf50" 
                      fontWeight="bold"
                      sx={{ color: currentTheme === 'dark' ? '#4caf50' : '#2e7d32' }}
                    >
                      +{formatCurrency(investment.gainLoss)}
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ color: currentTheme === 'dark' ? '#4caf50' : '#2e7d32' }}
                    >
                      +{investment.gainLossPercentage?.toFixed(2)}%
                    </Typography>
                  </Box>
                </ListItem>
                {index < 4 && <Divider sx={{ 
                  borderColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
                }} />}
              </motion.div>
            ))}
          </List>
        </CardContent>
      </ChartCard>
    );
  };

  const renderBottomPerformers = () => {
    if (!performanceData?.bottomPerformers || performanceData.bottomPerformers.length === 0) {
      return null;
    }

    return (
      <ChartCard sx={{ 
        background: currentTheme === 'dark' 
          ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
          : 'rgba(255, 255, 255, 0.8)',
        border: currentTheme === 'dark' 
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.08)',
        backdropFilter: 'blur(10px)'
      }}>
        <CardContent>
          <Box display="flex" alignItems="center" mb={2}>
            <Warning sx={{ color: '#f44336', mr: 1 }} />
            <Typography 
              variant="h6" 
              fontWeight="bold"
              sx={{ color: currentTheme === 'dark' ? '#fff' : 'rgba(15, 23, 42, 0.95)' }}
            >
              Needs Attention
            </Typography>
          </Box>
          <List dense>
            {performanceData.bottomPerformers.slice(0, 5).map((investment, index) => (
              <motion.div
                key={investment.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem sx={{ 
                  color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.87)' : 'rgba(0, 0, 0, 0.87)'
                }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: '#f44336', width: 32, height: 32 }}>
                      <TrendingDown />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={investment.symbol}
                    secondary={investment.name}
                    primaryTypographyProps={{ 
                      fontWeight: 'bold',
                      sx: { color: currentTheme === 'dark' ? '#fff' : 'rgba(15, 23, 42, 0.95)' }
                    }}
                    secondaryTypographyProps={{ 
                      sx: { color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(15, 23, 42, 0.7)' }
                    }}
                  />
                  <Box textAlign="right">
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      sx={{ color: currentTheme === 'dark' ? '#f44336' : '#c62828' }}
                    >
                      {formatCurrency(investment.gainLoss)}
                    </Typography>
                    <Typography 
                      variant="caption"
                      sx={{ color: currentTheme === 'dark' ? '#f44336' : '#c62828' }}
                    >
                      {investment.gainLossPercentage?.toFixed(2)}%
                    </Typography>
                  </Box>
                </ListItem>
                {index < 4 && <Divider sx={{ 
                  borderColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' 
                }} />}
              </motion.div>
            ))}
          </List>
        </CardContent>
      </ChartCard>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Assessment sx={{ 
            fontSize: 60, 
            color: currentTheme === 'dark' ? '#818cf8' : '#4f46e5' 
          }} />
        </motion.div>
      </Box>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Grid container spacing={3} mb={4}>
        {/* Chart Type Toggle */}
        <Grid item xs={12}>
          <Box display="flex" justifyContent="center" mb={2}>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(event, newType) => newType && setChartType(newType)}
              aria-label="chart type"
              sx={{
                '& .MuiToggleButton-root': {
                  color: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                  borderColor: currentTheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
                  '&.Mui-selected': {
                    backgroundColor: currentTheme === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                    color: currentTheme === 'dark' ? '#fff' : '#4f46e5',
                    borderColor: currentTheme === 'dark' ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.5)',
                  }
                }
              }}
            >
              {CHART_TYPES.map((type) => (
                <ToggleButton 
                  key={type.value} 
                  value={type.value}
                  sx={{
                    '&:hover': {
                      backgroundColor: currentTheme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                    }
                  }}
                >
                  {type.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
        </Grid>

        {/* Main Chart */}
        <Grid item xs={12} lg={8}>
          <ChartCard sx={{ 
            background: currentTheme === 'dark' 
              ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)'
              : 'rgba(255, 255, 255, 0.8)',
            border: currentTheme === 'dark' 
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(0, 0, 0, 0.08)',
            backdropFilter: 'blur(10px)'
          }}>
            <CardContent>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                mb={2}
                sx={{ color: currentTheme === 'dark' ? '#fff' : 'rgba(15, 23, 42, 0.95)' }}
              >
                {chartType === 'distribution' && 'Portfolio Distribution by Type'}
                {chartType === 'performance' && 'Investment Performance'}
                {chartType === 'sectors' && 'Sector Allocation'}
              </Typography>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={chartType}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  {chartType === 'distribution' && renderDistributionChart()}
                  {chartType === 'performance' && renderPerformanceChart()}
                  {chartType === 'sectors' && renderSectorChart()}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </ChartCard>
        </Grid>

        {/* Side Performance Cards */}
        <Grid item xs={12} lg={4}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {renderTopPerformers()}
            </Grid>
            <Grid item xs={12}>
              {renderBottomPerformers()}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default InvestmentCharts;