import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Box,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Slide,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Edit,
  Save,
  Cancel,
  AttachMoney,
  PieChart,
  Assessment
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import api from '../../utils/api';

const StyledCard = styled(Card)(({ theme, overbudget }) => ({
  transition: 'all 0.3s ease-in-out',
  transform: 'translateY(0)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
  border: overbudget ? `2px solid ${theme.palette.error.main}` : 'none',
  background: overbudget 
    ? `linear-gradient(135deg, ${theme.palette.error.light}10, ${theme.palette.background.paper})`
    : theme.palette.background.paper,
}));

const ProgressContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const AnimatedLinearProgress = styled(LinearProgress)(({ theme, overbudget }) => ({
  height: 8,
  borderRadius: 4,
  '& .MuiLinearProgress-bar': {
    backgroundColor: overbudget ? theme.palette.error.main : theme.palette.primary.main,
    transition: 'all 0.5s ease-in-out',
  },
  '& .MuiLinearProgress-root': {
    backgroundColor: theme.palette.grey[200],
  }
}));

const CategoryChip = styled(Chip)(({ theme, overbudget }) => ({
  margin: theme.spacing(0.5),
  transition: 'all 0.3s ease',
  backgroundColor: overbudget ? theme.palette.error.light : theme.palette.primary.light,
  color: overbudget ? theme.palette.error.contrastText : theme.palette.primary.contrastText,
  '&:hover': {
    transform: 'scale(1.05)',
  }
}));

const Budget = () => {
  const [budget, setBudget] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [monthlySalary, setMonthlySalary] = useState('');
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editPercentages, setEditPercentages] = useState({});
  const [showWarnings, setShowWarnings] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchBudget();
    fetchAnalysis();
  }, []);

  const fetchBudget = async () => {
    try {
      const response = await api.get('/budget/get');
      if (response.data && response.data.id) {
        // Ensure proper number conversion for BigDecimal values
        const budgetData = {
          ...response.data,
          monthlySalary: Number(response.data.monthlySalary),
          housingPercentage: Number(response.data.housingPercentage),
          foodPercentage: Number(response.data.foodPercentage),
          transportationPercentage: Number(response.data.transportationPercentage),
          entertainmentPercentage: Number(response.data.entertainmentPercentage),
          shoppingPercentage: Number(response.data.shoppingPercentage),
          utilitiesPercentage: Number(response.data.utilitiesPercentage),
          healthcarePercentage: Number(response.data.healthcarePercentage),
          educationPercentage: Number(response.data.educationPercentage),
          savingsPercentage: Number(response.data.savingsPercentage),
          emergencyFundPercentage: Number(response.data.emergencyFundPercentage),
          miscellaneousPercentage: Number(response.data.miscellaneousPercentage)
        };
        setBudget(budgetData);
        setMonthlySalary(String(budgetData.monthlySalary));
      }
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  };

  const fetchAnalysis = async () => {
    try {
      const response = await api.get('/budget/analysis');
      
      // Ensure proper number conversion for all analysis data
      const analysisData = {
        ...response.data,
        totalBudgeted: Number(response.data.totalBudgeted || 0),
        totalSpent: Number(response.data.totalSpent || 0),
        totalRemaining: Number(response.data.totalRemaining || 0)
      };
      
      // Convert budget breakdown values
      if (analysisData.budgetBreakdown) {
        const convertedBreakdown = {};
        Object.entries(analysisData.budgetBreakdown).forEach(([key, value]) => {
          convertedBreakdown[key] = Number(value || 0);
        });
        analysisData.budgetBreakdown = convertedBreakdown;
      }
      
      // Convert actual spending values
      if (analysisData.actualSpending) {
        const convertedSpending = {};
        Object.entries(analysisData.actualSpending).forEach(([key, value]) => {
          convertedSpending[key] = Number(value || 0);
        });
        analysisData.actualSpending = convertedSpending;
      }
      
      // Convert remaining budget values
      if (analysisData.remainingBudget) {
        const convertedRemaining = {};
        Object.entries(analysisData.remainingBudget).forEach(([key, value]) => {
          convertedRemaining[key] = Number(value || 0);
        });
        analysisData.remainingBudget = convertedRemaining;
      }
      
      setAnalysis(analysisData);
      
      // Check for warnings
      if (analysisData.warnings && analysisData.warnings.hasWarnings) {
        setShowWarnings(true);
      }
    } catch (error) {
      console.error('Error fetching analysis:', error);
    }
  };

  const handleCreateBudget = async () => {
    if (!monthlySalary || parseFloat(monthlySalary) <= 0) {
      setError('Please enter a valid monthly salary');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await api.post('/budget/create', { monthlySalary: parseFloat(monthlySalary) });
      setSuccess('Budget created successfully!');
      await fetchBudget();
      await fetchAnalysis();
    } catch (error) {
      setError('Failed to create budget: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePercentages = async () => {
    setLoading(true);
    setError('');
    
    try {
      await api.put('/budget/update-percentages', editPercentages);
      setSuccess('Budget percentages updated successfully!');
      setEditMode(false);
      await fetchBudget();
      await fetchAnalysis();
    } catch (error) {
      setError('Failed to update budget: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const startEdit = () => {
    if (budget) {
      setEditPercentages({
        housing: Number(budget.housingPercentage) || 0,
        food: Number(budget.foodPercentage) || 0,
        transportation: Number(budget.transportationPercentage) || 0,
        entertainment: Number(budget.entertainmentPercentage) || 0,
        shopping: Number(budget.shoppingPercentage) || 0,
        utilities: Number(budget.utilitiesPercentage) || 0,
        healthcare: Number(budget.healthcarePercentage) || 0,
        education: Number(budget.educationPercentage) || 0,
        savings: Number(budget.savingsPercentage) || 0,
        emergencyFund: Number(budget.emergencyFundPercentage) || 0,
        miscellaneous: Number(budget.miscellaneousPercentage) || 0
      });
      setEditMode(true);
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

  const formatCategoryName = (category) => {
    return category.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getProgressValue = (spent, budgeted) => {
    if (budgeted === 0) return 0;
    return Math.min((spent / budgeted) * 100, 100);
  };

  const isOverBudget = (spent, budgeted) => {
    return spent > budgeted;
  };

  if (!budget) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Fade in timeout={800}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <AttachMoney sx={{ fontSize: 60, color: (theme) => theme.palette.primary.main, mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Set Up Your Budget
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Enter your monthly salary to get personalized budget recommendations
            </Typography>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <TextField
              label="Monthly Salary"
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              fullWidth
              sx={{ mb: 3, maxWidth: 400 }}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>₹</Typography>,
              }}
            />
            
            <Button
              variant="contained"
              size="large"
              onClick={handleCreateBudget}
              disabled={loading}
              startIcon={<Save />}
              sx={{ 
                px: 4, 
                py: 1.5,
                borderRadius: 3,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              {loading ? 'Creating Budget...' : 'Create Budget'}
            </Button>
          </Paper>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Slide direction="down" in timeout={600}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: (theme) => theme.palette.primary.main }}>
            Budget Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Monthly Salary: {formatCurrency(budget.monthlySalary)}
          </Typography>
          
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={startEdit}
              disabled={editMode}
            >
              Edit Percentages
            </Button>
            {analysis && (
              <Button
                variant="outlined"
                startIcon={<Assessment />}
                onClick={() => setShowWarnings(true)}
                color={analysis.warnings?.hasWarnings ? 'error' : 'primary'}
              >
                {analysis.warnings?.hasWarnings ? 'View Warnings' : 'View Analysis'}
              </Button>
            )}
          </Box>
        </Box>
      </Slide>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Budget Overview */}
      {analysis && (
        <Fade in timeout={1000}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PieChart sx={{ fontSize: 40, color: (theme) => theme.palette.primary.main, mb: 1 }} />
                  <Typography variant="h6">Total Budgeted</Typography>
                  <Typography variant="h4" sx={{ color: (theme) => theme.palette.primary.main }}>
                    {formatCurrency(analysis.totalBudgeted)}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingDown sx={{ fontSize: 40, color: (theme) => theme.palette.error.main, mb: 1 }} />
                  <Typography variant="h6">Total Spent</Typography>
                  <Typography variant="h4" sx={{ color: (theme) => theme.palette.error.main }}>
                    {formatCurrency(analysis.totalSpent)}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <StyledCard>
                <CardContent sx={{ textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 40, color: (theme) => theme.palette.success.main, mb: 1 }} />
                  <Typography variant="h6">Remaining</Typography>
                  <Typography variant="h4" sx={{ color: (theme) => theme.palette.success.main }}>
                    {formatCurrency(analysis.totalRemaining)}
                  </Typography>
                </CardContent>
              </StyledCard>
            </Grid>
          </Grid>
        </Fade>
      )}

      {/* Budget Categories */}
      {analysis && analysis.budgetBreakdown && (
        <Grid container spacing={3}>
          {Object.entries(analysis.budgetBreakdown).map(([category, budgetedAmount], index) => {
            const spentAmount = analysis.actualSpending[category] || 0;
            const remainingAmount = analysis.remainingBudget[category] || 0;
            const overbudget = isOverBudget(spentAmount, budgetedAmount);
            const progressValue = getProgressValue(spentAmount, budgetedAmount);

            return (
              <Grid item xs={12} md={6} lg={4} key={category}>
                <Slide direction="up" in timeout={800 + index * 100}>
                  <StyledCard overbudget={overbudget}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          {formatCategoryName(category)}
                        </Typography>
                        {overbudget && (
                          <Tooltip title="Over Budget!">
                            <Warning color="error" />
                          </Tooltip>
                        )}
                      </Box>

                      {editMode ? (
                        <TextField
                          label="Percentage"
                          type="number"
                          value={editPercentages[category.toLowerCase().replace(/_/g, '')] || 0}
                          onChange={(e) => setEditPercentages({
                            ...editPercentages,
                            [category.toLowerCase().replace(/_/g, '')]: parseFloat(e.target.value) || 0
                          })}
                          size="small"
                          fullWidth
                          InputProps={{
                            endAdornment: <Typography>%</Typography>,
                          }}
                          sx={{ mb: 2 }}
                        />
                      ) : (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            Budget: {formatCurrency(budgetedAmount)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Spent: {formatCurrency(spentAmount)}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              color: (theme) => remainingAmount >= 0 ? theme.palette.success.main : theme.palette.error.main,
                              fontWeight: 'bold'
                            }}
                          >
                            Remaining: {formatCurrency(remainingAmount)}
                          </Typography>
                        </Box>
                      )}

                      {!editMode && (
                        <ProgressContainer>
                          <AnimatedLinearProgress
                            variant="determinate"
                            value={progressValue}
                            overbudget={overbudget}
                          />
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ position: 'absolute', right: 0, top: -20 }}
                          >
                            {progressValue.toFixed(1)}%
                          </Typography>
                        </ProgressContainer>
                      )}
                    </CardContent>
                  </StyledCard>
                </Slide>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Edit Mode Actions */}
      {editMode && (
        <Fade in>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleUpdatePercentages}
              disabled={loading}
              sx={{ mr: 2 }}
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
          </Box>
        </Fade>
      )}

      {/* Warnings Dialog */}
      <Dialog
        open={showWarnings}
        onClose={() => setShowWarnings(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {analysis?.warnings?.hasWarnings ? (
              <Warning color="error" sx={{ mr: 1 }} />
            ) : (
              <CheckCircle color="success" sx={{ mr: 1 }} />
            )}
            Budget Analysis
          </Box>
        </DialogTitle>
        <DialogContent>
          {analysis?.warnings?.hasWarnings ? (
            <Box>
              <Typography variant="h6" sx={{ color: (theme) => theme.palette.error.main }} gutterBottom>
                Budget Warnings
              </Typography>
              {Object.entries(analysis.warnings.categoryWarnings || {}).map(([category, warning]) => (
                <Alert severity="warning" sx={{ mb: 2 }} key={category}>
                  <Typography variant="subtitle2">
                    {formatCategoryName(category)}: {warning}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {analysis.warnings.suggestions[category]}
                  </Typography>
                </Alert>
              ))}
            </Box>
          ) : (
            <Alert severity="success">
              <Typography variant="h6">Great job!</Typography>
              <Typography>You're staying within your budget across all categories.</Typography>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarnings(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Budget;