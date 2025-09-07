import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { udhaariAPI } from '../../services/api';
import { useTheme } from '@mui/material/styles';

const Udhaari = () => {
  const theme = useTheme();
  const [udhaariList, setUdhaariList] = useState([]);
  const [summary, setSummary] = useState({ totalBorrowed: 0, totalLent: 0, netUdhaari: 0 });
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUdhaari, setEditingUdhaari] = useState(null);
  const [formData, setFormData] = useState({
    personName: '',
    amount: '',
    description: '',
    type: 'BORROWED',
    transactionDate: new Date().toISOString().split('T')[0], // Default to today
  });

  useEffect(() => {
    fetchUdhaariData();
  }, []);

  const fetchUdhaariData = async () => {
    setLoading(true);
    try {
      const [udhaariRes, summaryRes] = await Promise.all([
        udhaariAPI.getAll(),
        udhaariAPI.getSummary(),
      ]);
      setUdhaariList(udhaariRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching Udhaari data:', error);
      toast.error('Failed to load Udhaari data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const udhaariData = {
        ...formData,
        amount: parseFloat(formData.amount),
        transactionDate: new Date(formData.transactionDate + 'T00:00:00').toISOString(),
      };

      if (editingUdhaari) {
        await udhaariAPI.update(editingUdhaari.id, udhaariData);
        toast.success('Udhaari entry updated successfully');
      } else {
        await udhaariAPI.create(udhaariData);
        toast.success('Udhaari entry added successfully');
      }

      fetchUdhaariData();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving Udhaari:', error);
      toast.error('Failed to save Udhaari entry');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this Udhaari entry?')) {
      try {
        await udhaariAPI.delete(id);
        toast.success('Udhaari entry deleted successfully');
        fetchUdhaariData();
      } catch (error) {
        console.error('Error deleting Udhaari:', error);
        toast.error('Failed to delete Udhaari entry');
      }
    }
  };

  const handleOpenDialog = (udhaari = null) => {
    if (udhaari) {
      setEditingUdhaari(udhaari);
      setFormData({
        personName: udhaari.personName,
        amount: udhaari.amount.toString(),
        description: udhaari.description,
        type: udhaari.type,
        transactionDate: new Date(udhaari.transactionDate).toISOString().split('T')[0],
      });
    } else {
      setEditingUdhaari(null);
      setFormData({
        personName: '',
        amount: '',
        description: '',
        type: 'BORROWED',
        transactionDate: new Date().toISOString().split('T')[0],
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingUdhaari(null);
    setFormData({
      personName: '',
      amount: '',
      description: '',
      type: 'BORROWED',
      transactionDate: new Date().toISOString().split('T')[0],
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const borrowedList = udhaariList.filter(item => item.type === 'BORROWED');
  const lentList = udhaariList.filter(item => item.type === 'LENT');

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h4" fontWeight="700" sx={{ color: 'text.primary', mb: 1 }}>
              Udhaari (Borrowings & Lendings)
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Track money borrowed from others and lent to others
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1.5,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5b5fff 0%, #7c3aed 100%)',
              },
            }}
          >
            Add Entry
          </Button>
        </Box>
      </motion.div>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingDownIcon sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="600">
                    Total Borrowed
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="700">
                  {formatCurrency(summary.totalBorrowed)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Money you owe to others
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card
              sx={{
                background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <TrendingUpIcon sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="600">
                    Total Lent
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="700">
                  {formatCurrency(summary.totalLent)}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Money others owe you
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card
              sx={{
                background: summary.netUdhaari >= 0
                  ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
                  : 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 2 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <BalanceIcon sx={{ mr: 1, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight="600">
                    Net Balance
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="700">
                  {formatCurrency(Math.abs(summary.netUdhaari))}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {summary.netUdhaari >= 0 ? 'You are owed' : 'You owe'} this amount
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Two Column Layout */}
      <Grid container spacing={3}>
        {/* Borrowed Column */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar
                    sx={{
                      bgcolor: 'error.main',
                      mr: 2,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <TrendingDownIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
                      Money Borrowed
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      People you owe money to
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                  {borrowedList.length > 0 ? (
                    <Box>
                      {borrowedList.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            p={2}
                            mb={2}
                            borderRadius={2}
                            sx={{
                              backgroundColor: theme.palette.mode === 'dark'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(239, 68, 68, 0.1)',
                              border: '1px solid',
                              borderColor: 'error.light',
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark'
                                  ? 'rgba(239, 68, 68, 0.25)'
                                  : 'rgba(239, 68, 68, 0.15)',
                              },
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle1" fontWeight="600" sx={{ color: 'text.primary' }}>
                                {item.personName}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                {item.description}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {new Date(item.transactionDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="h6" fontWeight="700" sx={{ color: 'error.main' }}>
                                {formatCurrency(item.amount)}
                              </Typography>
                              <Box display="flex" gap={1} mt={1}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDialog(item)}
                                    sx={{ color: 'text.secondary' }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(item.id)}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Box>
                        </motion.div>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      height="300px"
                    >
                      <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography sx={{ color: 'text.secondary', textAlign: 'center' }}>
                        No borrowed amounts yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Lent Column */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Box display="flex" alignItems="center" mb={3}>
                  <Avatar
                    sx={{
                      bgcolor: 'success.main',
                      mr: 2,
                      width: 40,
                      height: 40,
                    }}
                  >
                    <TrendingUpIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="600" sx={{ color: 'text.primary' }}>
                      Money Lent
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      People who owe you money
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ flex: 1, overflowY: 'auto' }}>
                  {lentList.length > 0 ? (
                    <Box>
                      {lentList.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                            p={2}
                            mb={2}
                            borderRadius={2}
                            sx={{
                              backgroundColor: theme.palette.mode === 'dark'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(16, 185, 129, 0.1)',
                              border: '1px solid',
                              borderColor: 'success.light',
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'dark'
                                  ? 'rgba(16, 185, 129, 0.25)'
                                  : 'rgba(16, 185, 129, 0.15)',
                              },
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle1" fontWeight="600" sx={{ color: 'text.primary' }}>
                                {item.personName}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                                {item.description}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                {new Date(item.transactionDate).toLocaleDateString()}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="h6" fontWeight="700" sx={{ color: 'success.main' }}>
                                {formatCurrency(item.amount)}
                              </Typography>
                              <Box display="flex" gap={1} mt={1}>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDialog(item)}
                                    sx={{ color: 'text.secondary' }}
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Delete">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(item.id)}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                          </Box>
                        </motion.div>
                      ))}
                    </Box>
                  ) : (
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      height="300px"
                    >
                      <PersonIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                      <Typography sx={{ color: 'text.secondary', textAlign: 'center' }}>
                        No lent amounts yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ fontWeight: 600 }}>
            {editingUdhaari ? 'Edit Udhaari Entry' : 'Add New Udhaari Entry'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Person Name"
                value={formData.personName}
                onChange={(e) => setFormData({ ...formData, personName: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="BORROWED">Borrowed (I owe this person)</MenuItem>
                  <MenuItem value="LENT">Lent (This person owes me)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Transaction Date"
                type="date"
                value={formData.transactionDate}
                onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                required
                sx={{ mb: 2 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5b5fff 0%, #7c3aed 100%)',
                },
              }}
            >
              {editingUdhaari ? 'Update' : 'Add'} Entry
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Udhaari;