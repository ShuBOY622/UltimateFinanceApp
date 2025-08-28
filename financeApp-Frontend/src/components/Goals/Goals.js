import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  LinearProgress,
  Chip,
  IconButton,
  Fab,
  Avatar,
  Divider,
  Alert,
  Collapse,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  EmojiEvents,
  TrendingUp,
  AttachMoney,
  Psychology,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Schedule,
  Lightbulb,
  Star
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [expandedAdvice, setExpandedAdvice] = useState({});
  const [goalAdvice, setGoalAdvice] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: dayjs().add(1, 'month')
  });

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/goals');
      setGoals(response.data);
      
      // Fetch AI advice for each goal
      const advicePromises = response.data.map(goal =>
        fetchGoalAdvice(goal.id).catch(() => null)
      );
      const adviceResults = await Promise.all(advicePromises);
      
      const adviceMap = {};
      response.data.forEach((goal, index) => {
        if (adviceResults[index]) {
          adviceMap[goal.id] = adviceResults[index];
        }
      });
      setGoalAdvice(adviceMap);
    } catch (error) {
      toast.error('Failed to load goals');
      console.error('Goals error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGoalAdvice = async (goalId) => {
    try {
      const response = await api.get(`/advisor/goal/${goalId}/advice`);
      return response.data;
    } catch (error) {
      console.error('Goal advice error:', error);
      return null;
    }
  };

  const handleOpenDialog = (goal = null) => {
    if (goal) {
      setEditingGoal(goal);
      setFormData({
        name: goal.name,
        description: goal.description || '',
        targetAmount: goal.targetAmount,
        targetDate: dayjs(goal.targetDate)
      });
    } else {
      setEditingGoal(null);
      setFormData({
        name: '',
        description: '',
        targetAmount: '',
        targetDate: dayjs().add(1, 'month')
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingGoal(null);
  };

  const handleSubmit = async () => {
    try {
      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate.format('YYYY-MM-DD')
      };

      if (editingGoal) {
        await api.put(`/goals/${editingGoal.id}`, goalData);
        toast.success('Goal updated successfully!');
      } else {
        await api.post('/goals', goalData);
        toast.success('Goal created successfully!');
      }

      fetchGoals();
      handleCloseDialog();
    } catch (error) {
      toast.error('Failed to save goal');
      console.error('Save goal error:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await api.delete(`/goals/${id}`);
        toast.success('Goal deleted successfully!');
        fetchGoals();
      } catch (error) {
        toast.error('Failed to delete goal');
        console.error('Delete goal error:', error);
      }
    }
  };

  const handleAddProgress = async (goalId, amount) => {
    try {
      await api.put(`/goals/${goalId}/progress?amount=${amount}`);
      toast.success('Progress updated successfully!');
      fetchGoals();
    } catch (error) {
      toast.error('Failed to update progress');
      console.error('Update progress error:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#4caf50';
    if (percentage >= 75) return '#8bc34a';
    if (percentage >= 50) return '#ff9800';
    if (percentage >= 25) return '#ff5722';
    return '#f44336';
  };

  const getDaysRemaining = (targetDate) => {
    const today = dayjs();
    const target = dayjs(targetDate);
    return target.diff(today, 'day');
  };

  const getStatusChip = (goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    const daysRemaining = getDaysRemaining(goal.targetDate);

    if (goal.status === 'COMPLETED') {
      return <Chip label="Completed" color="success" icon={<CheckCircle />} />;
    }
    
    if (daysRemaining < 0) {
      return <Chip label="Overdue" color="error" icon={<Schedule />} />;
    }
    
    if (daysRemaining <= 7) {
      return <Chip label="Due Soon" color="warning" icon={<Schedule />} />;
    }
    
    return <Chip label="Active" color="primary" icon={<TrendingUp />} />;
  };

  const toggleAdviceExpansion = (goalId) => {
    setExpandedAdvice(prev => ({
      ...prev,
      [goalId]: !prev[goalId]
    }));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Financial Goals
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Set and track your financial objectives with AI-powered insights
            </Typography>
          </Box>
        </Box>

        {/* Goals Grid */}
        <Grid container spacing={3}>
          <AnimatePresence>
            {goals.map((goal, index) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const daysRemaining = getDaysRemaining(goal.targetDate);
              const advice = goalAdvice[goal.id];

              return (
                <Grid item xs={12} md={6} lg={4} key={goal.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Card 
                      sx={{ 
                        height: '100%',
                        position: 'relative',
                        background: progress >= 100 
                          ? 'linear-gradient(135deg, #4caf5015 0%, #4caf5005 100%)'
                          : 'linear-gradient(135deg, #667eea15 0%, #764ba205 100%)',
                        border: progress >= 100 
                          ? '2px solid #4caf50'
                          : '1px solid rgba(0,0,0,0.12)'
                      }}
                    >
                      <CardContent>
                        {/* Goal Header */}
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box flex={1}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {goal.name}
                            </Typography>
                            {goal.description && (
                              <Typography variant="body2" color="text.secondary" mb={1}>
                                {goal.description}
                              </Typography>
                            )}
                            {getStatusChip(goal)}
                          </Box>
                          <Box display="flex" gap={0.5}>
                            <IconButton size="small" onClick={() => handleOpenDialog(goal)}>
                              <Edit />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(goal.id)} color="error">
                              <Delete />
                            </IconButton>
                          </Box>
                        </Box>

                        {/* Progress */}
                        <Box mb={2}>
                          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                            <Typography variant="body2" color="text.secondary">
                              Progress
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {Math.round(progress)}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(progress, 100)}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#e0e0e0',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getProgressColor(progress),
                                borderRadius: 4,
                              },
                            }}
                          />
                          <Box display="flex" justifyContent="space-between" mt={1}>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(goal.currentAmount)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {formatCurrency(goal.targetAmount)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Goal Details */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">
                              Remaining
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {formatCurrency(goal.targetAmount - goal.currentAmount)}
                            </Typography>
                          </Box>
                          <Box textAlign="right">
                            <Typography variant="caption" color="text.secondary">
                              Days Left
                            </Typography>
                            <Typography 
                              variant="body1" 
                              fontWeight="bold"
                              color={daysRemaining < 7 ? '#f44336' : 'text.primary'}
                            >
                              {daysRemaining > 0 ? daysRemaining : 'Overdue'}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Add Progress Button */}
                        {goal.status !== 'COMPLETED' && (
                          <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<AttachMoney />}
                            onClick={() => {
                              const amount = prompt('Enter amount to add to this goal:');
                              if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
                                handleAddProgress(goal.id, parseFloat(amount));
                              }
                            }}
                            sx={{ mb: 2 }}
                          >
                            Add Progress
                          </Button>
                        )}

                        {/* AI Advice Section */}
                        {advice && (
                          <Box>
                            <Button
                              fullWidth
                              variant="text"
                              startIcon={<Psychology />}
                              endIcon={expandedAdvice[goal.id] ? <ExpandLess /> : <ExpandMore />}
                              onClick={() => toggleAdviceExpansion(goal.id)}
                              sx={{ 
                                justifyContent: 'space-between',
                                color: (theme) => theme.palette.primary.main,
                                fontWeight: 'bold'
                              }}
                            >
                              AI Insights
                            </Button>
                            <Collapse in={expandedAdvice[goal.id]}>
                              <Box mt={2}>
                                <Alert 
                                  severity={
                                    advice.feasibility === 'ACHIEVABLE' ? 'success' :
                                    advice.feasibility === 'CHALLENGING' ? 'warning' : 'info'
                                  }
                                  icon={<Lightbulb />}
                                  sx={{ mb: 2 }}
                                >
                                  <Typography variant="body2">
                                    {advice.advice}
                                  </Typography>
                                </Alert>
                                
                                {advice.recommendations && (
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" mb={1}>
                                      Recommendations:
                                    </Typography>
                                    <List dense>
                                      {advice.recommendations.map((rec, idx) => (
                                        <ListItem key={idx} sx={{ py: 0.5 }}>
                                          <ListItemIcon sx={{ minWidth: 24 }}>
                                            <Star sx={{ fontSize: 16, color: '#FFD700' }} />
                                          </ListItemIcon>
                                          <ListItemText 
                                            primary={rec}
                                            primaryTypographyProps={{ variant: 'body2' }}
                                          />
                                        </ListItem>
                                      ))}
                                    </List>
                                  </Box>
                                )}
                              </Box>
                            </Collapse>
                          </Box>
                        )}
                      </CardContent>

                      {/* Completion Badge */}
                      {progress >= 100 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            background: '#4caf50',
                            borderRadius: '50%',
                            width: 40,
                            height: 40,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <EmojiEvents sx={{ color: 'white', fontSize: 24 }} />
                        </Box>
                      )}
                    </Card>
                  </motion.div>
                </Grid>
              );
            })}
          </AnimatePresence>

          {/* Empty State */}
          {goals.length === 0 && !loading && (
            <Grid item xs={12}>
              <Card sx={{ textAlign: 'center', py: 6 }}>
                <CardContent>
                  <EmojiEvents sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    No Goals Yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" mb={3}>
                    Start your financial journey by creating your first goal!
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                    }}
                  >
                    Create Your First Goal
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Add Goal FAB */}
        {goals.length > 0 && (
          <Fab
            color="primary"
            aria-label="add"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            }}
            onClick={() => handleOpenDialog()}
          >
            <Add />
          </Fab>
        )}

        {/* Add/Edit Goal Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingGoal ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Goal Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., iPhone 15 Pro, Emergency Fund, Vacation"
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={2}
                  placeholder="Add more details about your goal..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Target Amount"
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
                  }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Target Date"
                  value={formData.targetDate}
                  onChange={(newValue) => setFormData({ ...formData, targetDate: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  minDate={dayjs()}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={!formData.name || !formData.targetAmount}
            >
              {editingGoal ? 'Update' : 'Create'} Goal
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default Goals;