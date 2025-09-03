import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
  CircularProgress,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Add,
  Notifications,
  CheckCircle,
  Edit,
  Delete,
  CalendarToday,
  AttachMoney,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { subscriptionAPI, transactionAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format, addDays } from 'date-fns';
import { enIN } from 'date-fns/locale';

const SubscriptionTracker = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    frequency: 'MONTHLY',
    category: 'OTHER_EXPENSE',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: '',
    description: '',
  });

  const categories = [
    'RENT', 'INSURANCE', 'SUBSCRIPTION', 'UTILITIES', 'ENTERTAINMENT', 
    'HEALTHCARE', 'EDUCATION', 'TRANSPORTATION', 'SHOPPING', 'OTHER_EXPENSE'
  ];

  const frequencies = [
    { value: 'DAILY', label: 'Daily' },
    { value: 'WEEKLY', label: 'Weekly' },
    { value: 'BIWEEKLY', label: 'Bi-weekly' },
    { value: 'MONTHLY', label: 'Monthly' },
    { value: 'QUARTERLY', label: 'Quarterly' },
    { value: 'YEARLY', label: 'Yearly' },
  ];

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const targetDate = format(addDays(new Date(), 30), 'yyyy-MM-dd');
      const response = await subscriptionAPI.getUpcoming(targetDate);
      setSubscriptions(response.data);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return format(new Date(dateString), 'dd MMM yyyy', { locale: enIN });
  };

  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const handleOpenDialog = (subscription = null) => {
    if (subscription) {
      setEditingSubscription(subscription);
      setFormData({
        name: subscription.name,
        amount: subscription.amount,
        frequency: subscription.frequency,
        category: subscription.category,
        startDate: subscription.startDate,
        endDate: subscription.endDate || '',
        description: subscription.description || '',
      });
    } else {
      setEditingSubscription(null);
      setFormData({
        name: '',
        amount: '',
        frequency: 'MONTHLY',
        category: 'OTHER_EXPENSE',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        description: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSubscription(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const subscriptionData = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (editingSubscription) {
        await subscriptionAPI.update(editingSubscription.id, subscriptionData);
        toast.success('Subscription updated successfully');
      } else {
        await subscriptionAPI.create(subscriptionData);
        toast.success('Subscription created successfully');
      }

      handleCloseDialog();
      fetchSubscriptions();
    } catch (error) {
      console.error('Error saving subscription:', error);
      toast.error(editingSubscription ? 'Failed to update subscription' : 'Failed to create subscription');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscription?')) {
      try {
        await subscriptionAPI.delete(id);
        toast.success('Subscription deleted successfully');
        fetchSubscriptions();
      } catch (error) {
        console.error('Error deleting subscription:', error);
        toast.error('Failed to delete subscription');
      }
    }
  };

  const handleMarkAsPaid = async (subscription) => {
    try {
      await subscriptionAPI.markAsPaid(subscription.id);
      toast.success(`${subscription.name} marked as paid`);
      // Update local state to remove the paid subscription
      setSubscriptions(prev => prev.filter(sub => sub.id !== subscription.id));
      // Refresh dashboard data
      if (window.refreshDashboardData) {
        window.refreshDashboardData();
      }
    } catch (error) {
      console.error('Error marking subscription as paid:', error);
      toast.error('Failed to mark subscription as paid');
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      RENT: '#ef4444',
      INSURANCE: '#f59e0b',
      SUBSCRIPTION: '#8b5cf6',
      UTILITIES: '#3b82f6',
      ENTERTAINMENT: '#ec4899',
      HEALTHCARE: '#10b981',
      EDUCATION: '#6366f1',
      TRANSPORTATION: '#f97316',
      SHOPPING: '#06b6d4',
      OTHER_EXPENSE: '#64748b',
    };
    return colors[category] || '#64748b';
  };

  const getFrequencyLabel = (frequency) => {
    const freq = frequencies.find(f => f.value === frequency);
    return freq ? freq.label : frequency;
  };

  const getTotalUpcomingAmount = () => {
    return subscriptions.reduce((total, sub) => total + parseFloat(sub.amount || 0), 0);
  };

  if (loading) {
    return (
      <Card sx={{ height: '100%' }}>
        <CardContent sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <Notifications sx={{ mr: 1, color: (theme) => theme.palette.info.main }} />
            <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
              Upcoming Payments
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add
          </Button>
        </Box>

        {subscriptions.length === 0 ? (
          <Box 
            display="flex" 
            alignItems="center" 
            justifyContent="center" 
            height="100%"
            flexDirection="column"
          >
            <Notifications sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
              No upcoming payments
            </Typography>
            <Button 
              variant="contained" 
              size="small"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Add Subscription
            </Button>
          </Box>
        ) : (
          <>
            <Box mb={2}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Total upcoming: {formatCurrency(getTotalUpcomingAmount())} in next 30 days
                </Typography>
              </Alert>
            </Box>
            
            <Box sx={{ flex: 1, overflowY: 'auto' }}>
              <List disablePadding>
                {subscriptions.map((subscription, index) => (
                  <motion.div
                    key={subscription.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <ListItem
                      divider={index < subscriptions.length - 1}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                      }}
                    >
                      <Box mr={2}>
                        <Avatar 
                          sx={{ 
                            bgcolor: getCategoryColor(subscription.category),
                            width: 36,
                            height: 36,
                          }}
                        >
                          <AttachMoney sx={{ fontSize: 18 }} />
                        </Avatar>
                      </Box>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight="500" sx={{ color: 'text.primary' }}>
                            {subscription.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                              {formatCurrency(subscription.amount)} • {getFrequencyLabel(subscription.frequency)}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', mt: 0.5 }}>
                              <CalendarToday sx={{ fontSize: 12, mr: 0.5 }} />
                              Due: {formatDate(subscription.nextPaymentDate)}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Mark as Paid">
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={() => handleMarkAsPaid(subscription)}
                            sx={{ 
                              color: 'success.main',
                              mr: 1,
                              '&:hover': {
                                backgroundColor: 'success.light',
                                color: 'success.contrastText',
                              }
                            }}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={() => handleOpenDialog(subscription)}
                            sx={{ 
                              color: 'primary.main',
                              mr: 1,
                              '&:hover': {
                                backgroundColor: 'primary.light',
                                color: 'primary.contrastText',
                              }
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            edge="end" 
                            size="small"
                            onClick={() => handleDelete(subscription.id)}
                            sx={{ 
                              color: 'error.main',
                              '&:hover': {
                                backgroundColor: 'error.light',
                                color: 'error.contrastText',
                              }
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </motion.div>
                ))}
              </List>
            </Box>
          </>
        )}
      </CardContent>

      {/* Subscription Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  InputProps={{
                    startAdornment: '₹',
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                    label="Frequency"
                  >
                    {frequencies.map((freq) => (
                      <MenuItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    label="Category"
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="End Date (Optional)"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={!formData.name || !formData.amount}
          >
            {editingSubscription ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SubscriptionTracker;