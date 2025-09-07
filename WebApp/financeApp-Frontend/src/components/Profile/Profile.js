import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Avatar,
  Divider,
  Chip,
  LinearProgress,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  IconButton,
  Skeleton,
  Container
} from '@mui/material';
import {
  Person,
  Email,
  AttachMoney,
  EmojiEvents,
  Edit,
  Save,
  Cancel,
  TrendingUp,
  AccountBalance,
  Star,
  Redeem,
  Settings,
  Security,
  Notifications,
  DeleteForever,
  Warning,
  CheckCircle,
  Schedule,
  LocalAtm,
  Assessment
} from '@mui/icons-material';

const Profile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [rewardPoints, setRewardPoints] = useState(0);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [redeemDialog, setRedeemDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [transactionStats, setTransactionStats] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    monthlyBudget: '',
    dailyBudget: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchRewardPoints();
    fetchTransactionStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/user/profile');
      setProfile(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        email: response.data.email || '',
        monthlyBudget: response.data.monthlyBudget || '',
        dailyBudget: response.data.dailyBudget || ''
      });
    } catch (error) {
      toast.error('Failed to load profile');
      console.error('Profile error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardPoints = async () => {
    try {
      const response = await api.get('/user/rewards');
      setRewardPoints(response.data.rewardPoints);
    } catch (error) {
      console.error('Rewards error:', error);
    }
  };

  const fetchTransactionStats = async () => {
    try {
      const response = await api.get('/transactions/summary');
      setTransactionStats(response.data);
    } catch (error) {
      console.error('Transaction stats error:', error);
    }
  };

  const handleSave = async () => {
    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        monthlyBudget: parseFloat(formData.monthlyBudget) || 0,
        dailyBudget: parseFloat(formData.dailyBudget) || 0
      };

      await api.put('/user/profile', updateData);
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
      console.error('Update profile error:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      email: profile.email || '',
      monthlyBudget: profile.monthlyBudget || '',
      dailyBudget: profile.dailyBudget || ''
    });
    setEditing(false);
  };

  const handleRedeemPoints = async () => {
    try {
      const points = parseFloat(redeemAmount);
      if (points <= 0 || points > rewardPoints) {
        toast.error('Invalid redemption amount');
        return;
      }

      const response = await api.post(`/user/rewards/redeem?points=${points}`);
      
      if (response.data.success) {
        toast.success(response.data.message);
        fetchRewardPoints();
        setRedeemDialog(false);
        setRedeemAmount('');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error('Failed to redeem points');
      console.error('Redeem error:', error);
    }
  };

  const handleDeleteAllTransactions = async () => {
    if (deleteConfirmation !== 'DELETE ALL MY TRANSACTIONS') {
      toast.error('Please type the exact confirmation text');
      return;
    }

    setDeleteLoading(true);
    try {
      const response = await api.delete('/user/transactions/all');
      
      if (response.data.success) {
        toast.success('All transactions deleted successfully!');
        setDeleteDialog(false);
        setDeleteConfirmation('');
        // Refresh transaction stats
        fetchTransactionStats();
      } else {
        toast.error(response.data.message || 'Failed to delete transactions');
      }
    } catch (error) {
      toast.error('Failed to delete transactions');
      console.error('Delete error:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const getRewardLevel = (points) => {
    if (points >= 1000) return { level: 'Diamond', color: '#e1f5fe', icon: '💎' };
    if (points >= 500) return { level: 'Gold', color: '#fff3e0', icon: '🥇' };
    if (points >= 200) return { level: 'Silver', color: '#f3e5f5', icon: '🥈' };
    return { level: 'Bronze', color: '#efebe9', icon: '🥉' };
  };

  const rewardLevel = getRewardLevel(rewardPoints);

  if (loading) {
    return (
      <Container maxWidth="xl">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Person sx={{ fontSize: 60, color: (theme) => theme.palette.primary.main }} />
          </motion.div>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography 
              variant="h4" 
              fontWeight="bold" 
              gutterBottom
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Profile Settings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your account settings and preferences
            </Typography>
          </Box>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              startIcon={<DeleteForever />}
              onClick={() => setDeleteDialog(true)}
              sx={{
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                },
                borderRadius: 2,
                px: 3
              }}
            >
              Delete All Transactions
            </Button>
          </motion.div>
        </Box>
      </motion.div>

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="between" alignItems="center" mb={3}>
                  <Typography variant="h6" fontWeight="bold">
                    Personal Information
                  </Typography>
                  {!editing ? (
                    <Button
                      startIcon={<Edit />}
                      onClick={() => setEditing(true)}
                      variant="outlined"
                    >
                      Edit Profile
                    </Button>
                  ) : (
                    <Box display="flex" gap={1}>
                      <Button
                        startIcon={<Save />}
                        onClick={handleSave}
                        variant="contained"
                        color="primary"
                      >
                        Save
                      </Button>
                      <Button
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                        variant="outlined"
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}
                </Box>

                <Grid container spacing={3}>
                  <Grid item xs={12} display="flex" justifyContent="center" mb={2}>
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                        fontSize: '2rem',
                        fontWeight: 'bold'
                      }}
                    >
                      {profile?.firstName?.charAt(0)}{profile?.lastName?.charAt(0)}
                    </Avatar>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="First Name"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Last Name"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      value={formData.email}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" fontWeight="bold" mb={2}>
                      Budget Settings
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Monthly Budget"
                      type="number"
                      value={formData.monthlyBudget}
                      onChange={(e) => setFormData({ ...formData, monthlyBudget: e.target.value })}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Daily Budget"
                      type="number"
                      value={formData.dailyBudget}
                      onChange={(e) => setFormData({ ...formData, dailyBudget: e.target.value })}
                      disabled={!editing}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoney />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Rewards Section */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card 
              sx={{ 
                background: `linear-gradient(135deg, ${rewardLevel.color} 0%, ${rewardLevel.color}50 100%)`,
                mb: 2
              }}
            >
              <CardContent>
                <Box textAlign="center">
                  <Typography variant="h2" sx={{ mb: 1 }}>
                    {rewardLevel.icon}
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {rewardLevel.level} Member
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" sx={{ color: (theme) => theme.palette.primary.main }}>
                    {rewardPoints}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    Reward Points
                  </Typography>
                  
                  <LinearProgress
                    variant="determinate"
                    value={Math.min((rewardPoints % 500) / 5, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      mb: 2,
                      backgroundColor: 'rgba(0,0,0,0.1)',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                      },
                    }}
                  />
                  
                  <Typography variant="caption" color="text.secondary" mb={2} display="block">
                    {500 - (rewardPoints % 500)} points to next level
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Redeem />}
                    onClick={() => setRedeemDialog(true)}
                    disabled={rewardPoints < 10}
                    sx={{
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    }}
                  >
                    Redeem Points
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Account Summary
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <AccountBalance color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Monthly Budget"
                      secondary={formatCurrency(profile?.monthlyBudget)}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <TrendingUp color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Daily Budget"
                      secondary={formatCurrency(profile?.dailyBudget)}
                    />
                  </ListItem>
                  
                  <ListItem>
                    <ListItemIcon>
                      <EmojiEvents sx={{ color: '#FFD700' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Member Since"
                      secondary={new Date(profile?.createdAt).toLocaleDateString()}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Additional Settings */}
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" mb={3}>
                  Additional Settings
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <Security sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main, mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Security
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Change password and security settings
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <Notifications sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main, mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Notifications
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage notification preferences
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <Settings sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main, mb: 1 }} />
                      <Typography variant="h6" fontWeight="bold">
                        Preferences
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Customize app preferences
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Redeem Points Dialog */}
      <Dialog open={redeemDialog} onClose={() => setRedeemDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Redeem Reward Points</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            You have {rewardPoints} points available for redemption.
          </Alert>
          <TextField
            fullWidth
            label="Points to Redeem"
            type="number"
            value={redeemAmount}
            onChange={(e) => setRedeemAmount(e.target.value)}
            inputProps={{ min: 1, max: rewardPoints }}
            sx={{ mt: 2 }}
          />
          <Typography variant="body2" color="text.secondary" mt={1}>
            Minimum redemption: 10 points
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRedeemDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRedeemPoints}
            variant="contained"
            disabled={!redeemAmount || parseFloat(redeemAmount) < 10 || parseFloat(redeemAmount) > rewardPoints}
          >
            Redeem Points
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete All Transactions Confirmation Dialog */}
      <Dialog 
        open={deleteDialog} 
        onClose={() => setDeleteDialog(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Warning sx={{ color: '#ef4444', fontSize: 28 }} />
            <Typography variant="h6" fontWeight="bold" color="text.primary">
              Delete All Transactions
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ⚠️ PERMANENT ACTION WARNING
            </Typography>
            <Typography variant="body2" paragraph>
              This action will permanently delete ALL of your transaction data. This includes:
            </Typography>
            <Typography component="ul" variant="body2" sx={{ mt: 1, pl: 2 }}>
              <li>All income and expense records</li>
              <li>Transaction history and descriptions</li>
              <li>Category breakdowns and analytics</li>
              <li>Financial summaries and reports</li>
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, fontWeight: 'bold', color: '#ef4444' }}>
              This action CANNOT be undone!
            </Typography>
          </Alert>
          
          <Typography variant="body1" gutterBottom color="text.primary">
            To confirm this action, type the following text exactly:
          </Typography>
          <Typography 
            variant="h6" 
            fontWeight="bold" 
            sx={{ 
              p: 2, 
              background: 'rgba(99, 102, 241, 0.1)', 
              border: '1px solid rgba(99, 102, 241, 0.3)',
              borderRadius: 2,
              mb: 2,
              color: '#6366f1',
              textAlign: 'center',
              fontFamily: 'monospace'
            }}
          >
            DELETE ALL MY TRANSACTIONS
          </Typography>
          
          <TextField
            fullWidth
            label="Confirmation Text"
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="Type: DELETE ALL MY TRANSACTIONS"
            error={deleteConfirmation && deleteConfirmation !== 'DELETE ALL MY TRANSACTIONS'}
            helperText={deleteConfirmation && deleteConfirmation !== 'DELETE ALL MY TRANSACTIONS' ? 'Text must match exactly' : ''}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => {
              setDeleteDialog(false);
              setDeleteConfirmation('');
            }}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteAllTransactions}
            variant="contained"
            disabled={deleteConfirmation !== 'DELETE ALL MY TRANSACTIONS' || deleteLoading}
            startIcon={deleteLoading ? null : <DeleteForever />}
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              },
              '&:disabled': {
                background: 'rgba(239, 68, 68, 0.3)',
                color: 'rgba(255, 255, 255, 0.3)',
              }
            }}
          >
            {deleteLoading ? 'Deleting...' : 'Delete All Transactions'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;