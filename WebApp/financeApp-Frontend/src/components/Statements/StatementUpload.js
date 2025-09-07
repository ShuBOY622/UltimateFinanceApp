import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Divider
} from '@mui/material';
import {
  CloudUpload,
  Description,
  PictureAsPdf,
  TableChart,
  Code,
  CheckCircle,
  Error,
  Warning,
  Close,
  Upload,
  Visibility
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { statementAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import TransactionPreview from './TransactionPreview';

const StatementUpload = ({ onUploadSuccess, onClose }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [parseResult, setParseResult] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [statementType, setStatementType] = useState('PHONEPE'); // Default to PhonePe

  // Debug logging for statementType changes
  const handleStatementTypeChange = (event) => {
    const newType = event.target.value;
    console.log('Statement type changed from', statementType, 'to', newType);
    setStatementType(newType);
  };

  // Supported statement types
  const statementTypes = [
    {
      value: 'PHONEPE',
      label: 'PhonePe',
      description: 'PhonePe transaction statements (PDF/Excel/CSV/HTML)',
      supported: true,
      icon: '📱',
      formats: ['PDF', 'CSV', 'Excel', 'HTML']
    },
    {
      value: 'KOTAK_BANK',
      label: 'Kotak Mahindra Bank',
      description: 'Kotak Bank account statements with comprehensive parsing (PDF/Excel/CSV)',
      supported: true,
      icon: '🏦',
      formats: ['PDF', 'Excel', 'CSV']
    },
    {
      value: 'GOOGLEPAY',
      label: 'Google Pay',
      description: 'Google Pay transaction reports (Coming Soon)',
      supported: false,
      icon: '💳'
    },
    {
      value: 'BHIM_UPI',
      label: 'BHIM UPI',
      description: 'BHIM UPI transaction statements (Coming Soon)',
      supported: false,
      icon: '🏛️'
    },
    {
      value: 'PAYTM',
      label: 'Paytm',
      description: 'Paytm wallet and UPI transactions (Coming Soon)',
      supported: false,
      icon: '🛒'
    },
    {
      value: 'BANK_STATEMENT',
      label: 'Generic Bank Statement',
      description: 'Generic bank statements (Coming Soon)',
      supported: false,
      icon: '📄'
    }
  ];

  // Supported file formats
  const supportedFormats = [
    { name: 'PDF', extensions: '.pdf', icon: <PictureAsPdf />, color: '#f44336' },
    { name: 'CSV', extensions: '.csv', icon: <TableChart />, color: '#4caf50' },
    { name: 'Excel', extensions: '.xlsx,.xls', icon: <Description />, color: '#2196f3' },
    { name: 'HTML', extensions: '.html,.htm', icon: <Code />, color: '#ff9800' }
  ];

  const onDrop = useCallback((acceptedFiles) => {
    console.log('onDrop triggered with files:', acceptedFiles, 'current statementType:', statementType);
    if (acceptedFiles.length > 0) {
      console.log('File selected:', acceptedFiles[0]);
      setSelectedFile(acceptedFiles[0]);
      // Pass the current statementType explicitly to avoid closure issues
      handleFileUploadWithType(acceptedFiles[0], statementType);
    } else {
      console.log('No files accepted');
    }
  }, [statementType]); // Add statementType to dependencies

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/html': ['.html', '.htm']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const handleFileUpload = async (file) => {
    // Use current statementType from state
    await handleFileUploadWithType(file, statementType);
  };

  const handleFileUploadWithType = async (file, currentStatementType) => {
    console.log('handleFileUploadWithType called with:', file.name, 'statementType:', currentStatementType);
    
    // Check if the selected statement type is supported
    const selectedType = statementTypes.find(type => type.value === currentStatementType);
    if (!selectedType || !selectedType.supported) {
      toast.error(`${selectedType?.label || currentStatementType} parsing is not yet supported. Please select PhonePe or Kotak Bank.`);
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    setParseResult(null);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      console.log('Calling statementAPI.upload with:', file.name, 'statementType:', currentStatementType);
      const response = await statementAPI.upload(file, currentStatementType);
      console.log('Upload response:', response);

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success) {
        setParseResult(response.data);
        toast.success(`Successfully parsed ${response.data.transactions.length} transactions`);
      } else {
        toast.error(response.data.message || 'Failed to parse statement');
      }

    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload statement: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleImportTransactions = async (transactions, skipDuplicates = true) => {
    try {
      const response = await statementAPI.import(transactions, skipDuplicates);

      if (response.data.success) {
        toast.success(`Imported ${response.data.successCount} transactions successfully`);
        if (onUploadSuccess) {
          onUploadSuccess(response.data);
        }
        handleReset();
      } else {
        toast.error(response.data.message || 'Failed to import transactions');
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import transactions: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParseResult(null);
    setShowPreview(false);
    setUploadProgress(0);
  };

  const getDropzoneStyle = () => {
    let borderColor = 'rgba(255, 255, 255, 0.2)';
    let backgroundColor = 'rgba(255, 255, 255, 0.02)';

    if (isDragAccept) {
      borderColor = '#4caf50';
      backgroundColor = 'rgba(76, 175, 80, 0.1)';
    } else if (isDragReject) {
      borderColor = '#f44336';
      backgroundColor = 'rgba(244, 67, 54, 0.1)';
    } else if (isDragActive) {
      borderColor = '#2196f3';
      backgroundColor = 'rgba(33, 150, 243, 0.1)';
    }

    return {
      borderColor,
      backgroundColor,
      transition: 'all 0.3s ease'
    };
  };

  const getFileIcon = (filename) => {
    const extension = filename.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf': return <PictureAsPdf sx={{ color: '#f44336' }} />;
      case 'csv': return <TableChart sx={{ color: '#4caf50' }} />;
      case 'xlsx':
      case 'xls': return <Description sx={{ color: '#2196f3' }} />;
      case 'html':
      case 'htm': return <Code sx={{ color: '#ff9800' }} />;
      default: return <Description />;
    }
  };

  return (
    <>
      <Dialog
        open={true}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(15, 15, 35, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Upload sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="600">
                Upload Bank Statement
              </Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <AnimatePresence mode="wait">
            {!parseResult ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Statement Type Selection */}
                <Paper
                  sx={{
                    p: 3,
                    mb: 3,
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <FormControl component="fieldset">
                    <FormLabel
                      component="legend"
                      sx={{
                        color: 'primary.main',
                        fontWeight: 600,
                        mb: 2,
                        '&.Mui-focused': {
                          color: 'primary.main'
                        }
                      }}
                    >
                      Select Statement Type
                    </FormLabel>
                    <RadioGroup
                      value={statementType}
                      onChange={handleStatementTypeChange}
                      name="statement-type"
                    >
                      <Grid container spacing={1}>
                        {statementTypes.map((type) => (
                          <Grid item xs={12} sm={6} key={type.value}>
                            <Paper
                              sx={{
                                p: 1.5,
                                border: statementType === type.value 
                                  ? '2px solid' 
                                  : '1px solid rgba(255, 255, 255, 0.1)',
                                borderColor: statementType === type.value 
                                  ? 'primary.main' 
                                  : 'rgba(255, 255, 255, 0.1)',
                                background: statementType === type.value 
                                  ? 'rgba(33, 150, 243, 0.1)' 
                                  : 'rgba(255, 255, 255, 0.02)',
                                cursor: type.supported ? 'pointer' : 'not-allowed',
                                opacity: type.supported ? 1 : 0.5,
                                transition: 'all 0.3s ease'
                              }}
                              onClick={() => {
                                if (type.supported) {
                                  console.log('Paper clicked for type:', type.value);
                                  handleStatementTypeChange({ target: { value: type.value } });
                                }
                              }}
                            >
                              <FormControlLabel
                                value={type.value}
                                control={
                                  <Radio
                                    disabled={!type.supported}
                                    sx={{
                                      color: 'rgba(255, 255, 255, 0.7)',
                                      '&.Mui-checked': {
                                        color: 'primary.main'
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Box>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                      sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1
                                      }}
                                    >
                                      {type.icon && <span style={{ fontSize: '16px' }}>{type.icon}</span>}
                                      {type.label}
                                      {!type.supported && (
                                        <Chip
                                          label="Coming Soon"
                                          size="small"
                                          color="warning"
                                          variant="outlined"
                                        />
                                      )}
                                      {type.supported && type.formats && (
                                        <Chip
                                          label={type.formats.join(', ')}
                                          size="small"
                                          color="info"
                                          variant="outlined"
                                        />
                                      )}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ display: 'block', mt: 0.5 }}
                                    >
                                      {type.description}
                                    </Typography>
                                  </Box>
                                }
                                disabled={!type.supported}
                                sx={{
                                  m: 0,
                                  width: '100%',
                                  '& .MuiFormControlLabel-label': {
                                    width: '100%'
                                  }
                                }}
                              />
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </RadioGroup>
                  </FormControl>
                </Paper>

                <Divider sx={{ mb: 3, borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                {/* File Upload Area */}
                <Paper
                  {...getRootProps()}
                  sx={{
                    border: '2px dashed',
                    borderRadius: 3,
                    p: 4,
                    textAlign: 'center',
                    cursor: statementTypes.find(type => type.value === statementType)?.supported ? 'pointer' : 'not-allowed',
                    mb: 3,
                    opacity: statementTypes.find(type => type.value === statementType)?.supported ? 1 : 0.5,
                    ...getDropzoneStyle()
                  }}
                >
                  <input {...getInputProps()} disabled={!statementTypes.find(type => type.value === statementType)?.supported} />
                  <CloudUpload sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                  
                  {!statementTypes.find(type => type.value === statementType)?.supported ? (
                    <>
                      <Typography variant="h6" color="warning.main" mb={1}>
                        Upload Disabled
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        Please select PhonePe or Kotak Bank to upload statements. Other vendors are coming soon.
                      </Typography>
                    </>
                  ) : isDragActive ? (
                    <Typography variant="h6" color="primary.main">
                      Drop the file here...
                    </Typography>
                  ) : (
                    <>
                      <Typography variant="h6" fontWeight="600" mb={1}>
                        Drag & drop your statement file here
                      </Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        or click to browse files
                      </Typography>
                      <Button variant="outlined" component="span">
                        Select File
                      </Button>
                    </>
                  )}
                </Paper>

                {/* Upload Progress */}
                {uploading && (
                  <Box mb={3}>
                    <Typography variant="body2" color="text.secondary" mb={1}>
                      {selectedFile?.name} - Processing...
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: 'linear-gradient(90deg, #4caf50, #8bc34a)'
                        }
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {uploadProgress}% completed
                    </Typography>
                  </Box>
                )}

                {/* Supported Formats */}
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" mb={2}>
                    Supported Formats
                  </Typography>
                  <Grid container spacing={2}>
                    {supportedFormats.map((format) => (
                      <Grid item xs={12} sm={6} key={format.name}>
                        <Paper
                          sx={{
                            p: 2,
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                        >
                          <Box display="flex" alignItems="center">
                            <Box sx={{ color: format.color, mr: 1 }}>
                              {format.icon}
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="600">
                                {format.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {format.extensions}
                              </Typography>
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                {/* Upload Tips */}
                <Alert
                  severity="info"
                  sx={{
                    mt: 3,
                    background: 'rgba(33, 150, 243, 0.1)',
                    border: '1px solid rgba(33, 150, 243, 0.3)'
                  }}
                >
                  <Typography variant="body2">
                    <strong>Tips:</strong> Upload statements from PhonePe, Kotak Bank, GPay, or other financial apps. 
                    Kotak Bank statements are now fully supported with comprehensive parsing for PDF, CSV, and Excel formats.
                  </Typography>
                </Alert>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Parse Results */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={2}>
                      <CheckCircle sx={{ color: 'success.main', mr: 1 }} />
                      <Typography variant="h6" fontWeight="600">
                        Statement Parsed Successfully
                      </Typography>
                    </Box>
                    
                    {/* File Info */}
                    <Box display="flex" alignItems="center" mb={2}>
                      {getFileIcon(parseResult.metadata.fileName)}
                      <Box ml={1}>
                        <Typography variant="subtitle2" fontWeight="600">
                          {parseResult.metadata.fileName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {parseResult.metadata.fileFormat.toUpperCase()} • {(parseResult.metadata.fileSize / 1024).toFixed(1)} KB
                        </Typography>
                      </Box>
                    </Box>

                    {/* Statistics */}
                    <Grid container spacing={2} mb={2}>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 1.5, textAlign: 'center', background: 'rgba(76, 175, 80, 0.1)' }}>
                          <Typography variant="h6" fontWeight="bold" color="success.main">
                            {parseResult.metadata.parsedTransactions}
                          </Typography>
                          <Typography variant="caption">Transactions</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 1.5, textAlign: 'center', background: 'rgba(255, 152, 0, 0.1)' }}>
                          <Typography variant="h6" fontWeight="bold" color="warning.main">
                            {parseResult.metadata.duplicateTransactions}
                          </Typography>
                          <Typography variant="caption">Duplicates</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper sx={{ p: 1.5, textAlign: 'center', background: 'rgba(33, 150, 243, 0.1)' }}>
                          <Typography variant="body2" fontWeight="600" color="info.main">
                            {parseResult.metadata.dateRange || 'Various dates'}
                          </Typography>
                          <Typography variant="caption">Date Range</Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Warning for duplicates */}
                    {parseResult.metadata.duplicateTransactions > 0 && (
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                          Found {parseResult.metadata.duplicateTransactions} potential duplicate transactions.
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <Box display="flex" gap={2} justifyContent="center">
                  <Button
                    variant="outlined"
                    startIcon={<Visibility />}
                    onClick={() => setShowPreview(true)}
                  >
                    Preview Transactions
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Upload />}
                    onClick={() => handleImportTransactions(parseResult.transactions)}
                    disabled={parseResult.transactions.length === 0}
                  >
                    Import {parseResult.transactions.length} Transactions
                  </Button>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>

      {/* Transaction Preview Dialog */}
      {showPreview && parseResult && (
        <TransactionPreview
          transactions={parseResult.transactions}
          onClose={() => setShowPreview(false)}
          onImport={handleImportTransactions}
        />
      )}
    </>
  );
};

export default StatementUpload;