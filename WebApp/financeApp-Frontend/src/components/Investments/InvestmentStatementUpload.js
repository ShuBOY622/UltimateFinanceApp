import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  CheckCircle,
  Error,
  Warning,
  TrendingUp,
  AccountBalance,
  Close,
  InfoOutlined,
  FileUpload,
  Assessment,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { investmentAPI } from '../../services/api';

const SUPPORTED_PLATFORMS = [
  { value: 'GROWW', label: 'Groww', description: 'Holdings statement from Groww app' },
  { value: 'ZERODHA', label: 'Zerodha', description: 'Holdings report from Kite app' },
  { value: 'UPSTOX', label: 'Upstox', description: 'Portfolio statement from Upstox' },
  { value: 'GENERIC', label: 'Other Platform', description: 'Generic Excel format' }
];

const InvestmentStatementUpload = ({ onUploadSuccess, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [platform, setPlatform] = useState('GROWW');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setSelectedFile(file);
        setUploadResult(null);
      } else {
        toast.error('Please select an Excel file (.xlsx or .xls)');
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const validateFile = (file) => {
    if (!file) {
      toast.error('Please select a file');
      return false;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast.error('File size must be less than 10MB');
      return false;
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/excel'
    ];

    const isValidType = allowedTypes.includes(file.type) || 
                       file.name.endsWith('.xlsx') || 
                       file.name.endsWith('.xls');

    if (!isValidType) {
      toast.error('Only Excel files (.xlsx, .xls) are supported');
      return false;
    }

    return true;
  };

  const handleUpload = async () => {
    if (!validateFile(selectedFile)) {
      return;
    }

    setUploading(true);
    try {
      const response = await investmentAPI.uploadStatement(selectedFile, platform);
      const result = response.data;
      
      setUploadResult(result);
      setShowResult(true);
      
      if (result.successCount > 0) {
        toast.success(`Successfully imported ${result.successCount} investments!`);
        if (onUploadSuccess) {
          onUploadSuccess(result);
        }
      } else if (result.totalParsed === 0) {
        toast.warning('No investment data found in the file');
      } else {
        toast.error('Failed to import investments. Please check the file format.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to upload statement';
      toast.error(errorMessage);
      setUploadResult({
        success: false,
        error: errorMessage,
        totalParsed: 0,
        successCount: 0,
        failureCount: 0
      });
      setShowResult(true);
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setShowResult(false);
    setPlatform('GROWW');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      <Card 
        sx={{ 
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 3,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
            <Box display="flex" alignItems="center">
              <FileUpload sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" fontWeight="bold" color="text.primary">
                  Import Investment Statement
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload your Excel investment statement to automatically import your holdings
                </Typography>
              </Box>
            </Box>
            <Tooltip title="How does this work?">
              <IconButton size="small">
                <InfoOutlined sx={{ color: 'text.secondary' }} />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Platform Selection */}
          <Box mb={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Select Platform</InputLabel>
              <Select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                label="Select Platform"
                disabled={uploading}
              >
                {SUPPORTED_PLATFORMS.map((platformOption) => (
                  <MenuItem key={platformOption.value} value={platformOption.value}>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {platformOption.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {platformOption.description}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* File Upload Area */}
          <Paper
            sx={{
              border: `2px dashed ${dragOver ? 'primary.main' : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: 2,
              p: 3,
              textAlign: 'center',
              backgroundColor: dragOver ? 'rgba(103, 126, 234, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'primary.main'
              }
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
              disabled={uploading}
            />
            
            {selectedFile ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <InsertDriveFile sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {selectedFile.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {formatFileSize(selectedFile.size)}
                </Typography>
                <Chip 
                  label="File Selected" 
                  color="success" 
                  size="small" 
                  icon={<CheckCircle />}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Drop your Excel file here
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  or click to browse files
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Supports .xlsx and .xls files up to 10MB
                </Typography>
              </motion.div>
            )}
          </Paper>

          {/* Platform Format Info */}
          <Box mt={2} mb={3}>
            <Alert severity="info" sx={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
              <Typography variant="body2">
                <strong>{SUPPORTED_PLATFORMS.find(p => p.value === platform)?.label} Format:</strong>{' '}
                {platform === 'GROWW' && 'Make sure your file contains columns: Stock Name, ISIN, Quantity, Average buy price, Closing price'}
                {platform === 'ZERODHA' && 'Upload your holdings report from Kite with standard columns'}
                {platform === 'UPSTOX' && 'Upload your portfolio statement with investment details'}
                {platform === 'GENERIC' && 'Ensure your file has columns for company name, quantity, and purchase price'}
              </Typography>
            </Alert>
          </Box>

          {/* Action Buttons */}
          <Box display="flex" gap={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={handleReset}
              disabled={uploading}
              startIcon={<Close />}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              startIcon={uploading ? null : <CloudUpload />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                },
                minWidth: 120
              }}
            >
              {uploading ? 'Processing...' : 'Import Investments'}
            </Button>
          </Box>

          {/* Upload Progress */}
          {uploading && (
            <Box mt={2}>
              <LinearProgress sx={{ borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary" mt={1} display="block" textAlign="center">
                Processing your investment statement...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Results Dialog */}
      <Dialog
        open={showResult}
        onClose={() => setShowResult(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              {uploadResult?.successCount > 0 ? (
                <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
              ) : (
                <Warning sx={{ color: 'warning.main', mr: 1 }} />
              )}
              <Typography variant="h6" fontWeight="bold">
                Import Results
              </Typography>
            </Box>
            <IconButton onClick={() => setShowResult(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {uploadResult && (
            <Box>
              {/* Summary Stats */}
              <Box display="flex" gap={2} mb={3}>
                <Paper sx={{ p: 2, flex: 1, textAlign: 'center', bgcolor: 'rgba(76, 175, 80, 0.1)' }}>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {uploadResult.successCount || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Successfully Imported
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, flex: 1, textAlign: 'center', bgcolor: 'rgba(244, 67, 54, 0.1)' }}>
                  <Typography variant="h4" color="error.main" fontWeight="bold">
                    {uploadResult.failureCount || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Failed to Import
                  </Typography>
                </Paper>
                
                <Paper sx={{ p: 2, flex: 1, textAlign: 'center', bgcolor: 'rgba(33, 150, 243, 0.1)' }}>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {uploadResult.totalParsed || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Processed
                  </Typography>
                </Paper>
              </Box>

              {/* Success Message */}
              {uploadResult.message && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {uploadResult.message}
                </Alert>
              )}

              {/* Error Details */}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2" fontWeight="bold" mb={1} color="error.main">
                    Issues Found:
                  </Typography>
                  <List dense>
                    {uploadResult.errors.slice(0, 5).map((error, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <Error color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={error}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItem>
                    ))}
                    {uploadResult.errors.length > 5 && (
                      <ListItem>
                        <ListItemText 
                          primary={`... and ${uploadResult.errors.length - 5} more issues`}
                          primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>
              )}

              {/* Platform Info */}
              <Divider sx={{ my: 2 }} />
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Platform: <strong>{uploadResult.platform}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  File: <strong>{selectedFile?.name}</strong>
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setShowResult(false)} variant="outlined">
            Close
          </Button>
          {uploadResult?.successCount > 0 && (
            <Button 
              onClick={() => {
                setShowResult(false);
                if (onClose) onClose();
              }}
              variant="contained"
              startIcon={<TrendingUp />}
            >
              View Investments
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvestmentStatementUpload;