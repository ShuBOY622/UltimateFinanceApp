import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import TextField from '@mui/material/TextField';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Divider,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Assessment,
  PictureAsPdf,
  TrendingUp,
  TrendingDown,
  AccountBalance,
  Refresh,
  DateRange,
  BarChart,
  PieChart
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  ResponsiveContainer,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import dayjs from 'dayjs';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('thisMonth');
  const [startDate, setStartDate] = useState(dayjs().startOf('month'));
  const [endDate, setEndDate] = useState(dayjs().endOf('month'));
  const [reportType, setReportType] = useState('overview');

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  useEffect(() => {
    fetchReportData();
  }, [startDate, endDate]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [summaryRes, analysisRes] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions/analysis', {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          }
        })
      ]);

      setSummary(summaryRes.data);
      setAnalysis(analysisRes.data);
    } catch (error) {
      toast.error('Failed to load report data');
      console.error('Reports error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range) => {
    setDateRange(range);
    const today = dayjs();
    
    switch (range) {
      case 'thisWeek':
        setStartDate(today.startOf('week'));
        setEndDate(today.endOf('week'));
        break;
      case 'thisMonth':
        setStartDate(today.startOf('month'));
        setEndDate(today.endOf('month'));
        break;
      case 'lastMonth':
        setStartDate(today.subtract(1, 'month').startOf('month'));
        setEndDate(today.subtract(1, 'month').endOf('month'));
        break;
      case 'thisYear':
        setStartDate(today.startOf('year'));
        setEndDate(today.endOf('year'));
        break;
      case 'custom':
        // Keep current dates for custom range
        break;
      default:
        break;
    }
  };

  const exportToPDF = async (type) => {
    try {
      const endpoint = type === 'transactions'
        ? '/user/export/transactions'
        : '/user/export/summary';
      
      const params = type === 'transactions'
        ? { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        : {};

      const response = await api.get(endpoint, {
        params,
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = type === 'transactions' 
        ? `transactions_${startDate.format('YYYY-MM-DD')}_to_${endDate.format('YYYY-MM-DD')}.pdf`
        : 'financial_summary.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report');
      console.error('Export error:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const prepareChartData = () => {
    if (!analysis?.categorySpending) return [];
    
    return analysis.categorySpending.map(([category, amount], index) => ({
      name: category.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()),
      value: parseFloat(amount),
      color: COLORS[index % COLORS.length]
    }));
  };

  const prepareIncomeExpenseData = () => {
    if (!summary) return [];
    
    return [
      {
        name: 'Income',
        amount: parseFloat(summary.monthlyIncome || 0),
        color: '#4caf50'
      },
      {
        name: 'Expenses',
        amount: parseFloat(summary.monthlyExpenses || 0),
        color: '#f44336'
      }
    ];
  };

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        sx={{ 
          height: '100%',
          background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
          border: `1px solid ${color}30`
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box>
              <Typography color="text.secondary" gutterBottom variant="body2">
                {title}
              </Typography>
              <Typography variant="h4" component="div" fontWeight="bold">
                {value}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <Box
              sx={{
                backgroundColor: color,
                borderRadius: '50%',
                width: 48,
                height: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}
            >
              {icon}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Financial Reports
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Analyze your financial data with detailed reports and insights
            </Typography>
          </Box>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchReportData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Controls */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRange}
                    label="Date Range"
                    onChange={(e) => handleDateRangeChange(e.target.value)}
                  >
                    <MenuItem value="thisWeek">This Week</MenuItem>
                    <MenuItem value="thisMonth">This Month</MenuItem>
                    <MenuItem value="lastMonth">Last Month</MenuItem>
                    <MenuItem value="thisYear">This Year</MenuItem>
                    <MenuItem value="custom">Custom Range</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {dateRange === 'custom' && (
                <>
                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label="Start Date"
                      value={startDate}
                      onChange={(newValue) => setStartDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <DatePicker
                      label="End Date"
                      value={endDate}
                      onChange={(newValue) => setEndDate(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </>
              )}

              <Grid item xs={12} md={3}>
                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdf />}
                    onClick={() => exportToPDF('transactions')}
                    size="small"
                  >
                    Export Transactions
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdf />}
                    onClick={() => exportToPDF('summary')}
                    size="small"
                  >
                    Export Summary
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Income"
              value={formatCurrency(summary?.totalIncome)}
              icon={<TrendingUp />}
              color="#4caf50"
              subtitle="All time"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Expenses"
              value={formatCurrency(summary?.totalExpenses)}
              icon={<TrendingDown />}
              color="#f44336"
              subtitle="All time"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Net Balance"
              value={formatCurrency(summary?.netBalance)}
              icon={<AccountBalance />}
              color="#1976d2"
              subtitle="Current balance"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Period Spending"
              value={formatCurrency(analysis?.totalSpending)}
              icon={<Assessment />}
              color="#ff9800"
              subtitle={`${startDate.format('MMM DD')} - ${endDate.format('MMM DD')}`}
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3}>
          {/* Income vs Expenses */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <BarChart sx={{ mr: 1, color: (theme) => theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="bold">
                      Income vs Expenses
                    </Typography>
                  </Box>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={prepareIncomeExpenseData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                      <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      <Bar dataKey="amount" fill="#8884d8">
                        {prepareIncomeExpenseData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Expense Breakdown */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <PieChart sx={{ mr: 1, color: (theme) => theme.palette.primary.main }} />
                    <Typography variant="h6" fontWeight="bold">
                      Expense Categories
                    </Typography>
                  </Box>
                  {prepareChartData().length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RechartsPieChart>
                        <Pie
                          data={prepareChartData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {prepareChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Typography color="text.secondary">
                        No expense data for selected period
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>

          {/* Detailed Breakdown */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="bold" mb={3}>
                    Category Breakdown
                  </Typography>
                  
                  {prepareChartData().length > 0 ? (
                    <Grid container spacing={2}>
                      {prepareChartData().map((category, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                          <Paper 
                            sx={{ 
                              p: 2, 
                              background: `linear-gradient(135deg, ${category.color}15 0%, ${category.color}05 100%)`,
                              border: `1px solid ${category.color}30`
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="body1" fontWeight="medium">
                                {category.name}
                              </Typography>
                              <Chip
                                label={formatCurrency(category.value)}
                                sx={{
                                  backgroundColor: category.color,
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                              {((category.value / analysis?.totalSpending) * 100).toFixed(1)}% of total spending
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box textAlign="center" py={4}>
                      <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Data Available
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        No transactions found for the selected period
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default Reports;