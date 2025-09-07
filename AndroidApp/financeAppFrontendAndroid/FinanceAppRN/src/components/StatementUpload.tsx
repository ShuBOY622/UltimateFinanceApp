import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Button,
  ProgressBar,
  Chip,
  List,
  Surface,
  Portal,
  Modal,
  ActivityIndicator,
} from 'react-native-paper';
import { pick, types } from '@react-native-documents/picker';
import axios from 'axios';
import { useDashboard } from '../contexts/DashboardContext';

const BASE_URL = 'http://192.168.1.2:8080';

interface StatementUploadProps {
  visible: boolean;
  onDismiss: () => void;
  onUploadSuccess: (result: any) => void;
}

const StatementUpload: React.FC<StatementUploadProps> = ({
  visible,
  onDismiss,
  onUploadSuccess,
}) => {
  const { refreshDashboard } = useDashboard();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [statementType, setStatementType] = useState('PHONEPE');
  const [parsingResult, setParsingResult] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  const statementTypes = [
    {
      value: 'PHONEPE',
      label: 'PhonePe',
      description: 'PhonePe transaction statements',
      supported: true,
    },
    {
      value: 'KOTAK_BANK',
      label: 'Kotak Mahindra Bank',
      description: 'Kotak Bank account statements',
      supported: true,
    },
    {
      value: 'GOOGLEPAY',
      label: 'Google Pay',
      description: 'Google Pay transaction reports',
      supported: false,
    },
    {
      value: 'PAYTM',
      label: 'Paytm',
      description: 'Paytm transaction statements',
      supported: false,
    },
  ];

  const pickDocument = async () => {
    try {
      const result = await pick({
        type: [
          types.pdf,
          types.csv,
          types.xlsx,
          types.xls,
          types.plainText, // For HTML files
        ],
        allowMultiSelection: false,
      });

      if (result && result[0]) {
        const file = result[0];

        // Validate file size (max 10MB to match backend)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size && file.size > maxSize) {
          Alert.alert(
            'File Too Large',
            'Please select a file smaller than 10MB.',
            [{ text: 'OK' }]
          );
          return;
        }

        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'text/csv',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/html',
          'text/plain'
        ];

        const fileType = file.type || 'application/pdf';
        if (!allowedTypes.some(type => fileType.includes(type.split('/')[1]))) {
          Alert.alert(
            'Unsupported File Type',
            'Please select a PDF, CSV, Excel, or HTML file.',
            [{ text: 'OK' }]
          );
          return;
        }

        setSelectedFile({
          uri: file.uri,
          type: fileType,
          name: file.name || 'Unknown File',
          size: file.size || 0,
        });
      }
    } catch (err: any) {
      if (err?.code === 'DOCUMENT_PICKER_CANCELED') {
        // User cancelled the picker
        console.log('User cancelled document picker');
      } else {
        // Error occurred
        console.error('Document picker error:', err);
        Alert.alert(
          'Error',
          'Failed to select file. Please try again.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const uploadStatement = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name,
      });
      formData.append('statementType', statementType);

      const response = await axios.post(
        `${BASE_URL}/api/statements/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress(percentCompleted / 100);
            }
          },
        }
      );

      setParsingResult(response.data);
      setShowResult(true);

      if (response.data.successCount > 0) {
        Alert.alert(
          'Success',
          `Successfully parsed ${response.data.successCount} transactions!`,
          [
            {
              text: 'Import',
              onPress: () => handleImportTransactions(response.data),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      } else {
        Alert.alert('Info', 'No transactions found in the statement');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload and parse statement');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleImportTransactions = async (result: any) => {
    try {
      await axios.post(`${BASE_URL}/api/statements/import`, {
        transactions: result.transactions,
        skipDuplicates: true,
      });

      Alert.alert('Success', `Imported ${result.transactions.length} transactions successfully!`);
      onUploadSuccess(result);
      await refreshDashboard();
      handleClose();
    } catch (error) {
      console.error('Import error:', error);
      Alert.alert('Error', 'Failed to import transactions');
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setParsingResult(null);
    setShowResult(false);
    setUploadProgress(0);
    onDismiss();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleClose}
        contentContainerStyle={styles.modalContainer}
      >
        <Surface style={styles.modalContent} elevation={4}>
          <Title style={styles.modalTitle}>Upload Bank Statement</Title>

          {/* Statement Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statement Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeContainer}>
                {statementTypes.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    onPress={() => setStatementType(type.value)}
                    disabled={!type.supported}
                  >
                    <Chip
                      mode={statementType === type.value ? 'flat' : 'outlined'}
                      style={[
                        styles.typeChip,
                        statementType === type.value && styles.selectedTypeChip,
                        !type.supported && styles.disabledTypeChip,
                      ]}
                      textStyle={!type.supported && styles.disabledTypeText}
                    >
                      {type.label}
                      {!type.supported && ' (Soon)'}
                    </Chip>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <Text style={styles.typeDescription}>
              {statementTypes.find(t => t.value === statementType)?.description}
            </Text>
          </View>

          {/* File Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select File</Text>
            <Button
              mode="outlined"
              onPress={pickDocument}
              style={styles.fileButton}
              icon="file-upload"
            >
              Choose File
            </Button>

            {selectedFile && (
              <Card style={styles.fileCard}>
                <Card.Content>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{selectedFile.name}</Text>
                    <Text style={styles.fileSize}>
                      {formatFileSize(selectedFile.size)}
                    </Text>
                  </View>
                </Card.Content>
              </Card>
            )}
          </View>

          {/* Upload Progress */}
          {uploading && (
            <View style={styles.progressSection}>
              <Text style={styles.progressText}>
                Uploading and parsing... {Math.round(uploadProgress * 100)}%
              </Text>
              <ProgressBar progress={uploadProgress} style={styles.progressBar} />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actions}>
            <Button onPress={handleClose} style={styles.cancelButton}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={uploadStatement}
              disabled={!selectedFile || uploading}
              loading={uploading}
            >
              {uploading ? 'Processing...' : 'Upload & Parse'}
            </Button>
          </View>
        </Surface>

        {/* Parsing Results Modal */}
        <Modal
          visible={showResult}
          onDismiss={() => setShowResult(false)}
          contentContainerStyle={styles.resultModalContainer}
        >
          <Surface style={styles.resultModalContent} elevation={4}>
            <Title style={styles.resultTitle}>Parsing Results</Title>

            {parsingResult && (
              <ScrollView style={styles.resultScroll}>
                <View style={styles.resultSummary}>
                  <Chip style={styles.successChip}>
                    {parsingResult.successCount} Success
                  </Chip>
                  {parsingResult.errorCount > 0 && (
                    <Chip style={styles.errorChip}>
                      {parsingResult.errorCount} Errors
                    </Chip>
                  )}
                </View>

                {parsingResult.transactions && parsingResult.transactions.length > 0 && (
                  <View style={styles.transactionsPreview}>
                    <Text style={styles.previewTitle}>Preview (First 5 transactions):</Text>
                    {parsingResult.transactions.slice(0, 5).map((transaction: any, index: number) => (
                      <List.Item
                        key={index}
                        title={transaction.description}
                        description={`${transaction.type} - ₹${transaction.amount}`}
                        left={props => <List.Icon {...props} icon="cash" />}
                      />
                    ))}
                  </View>
                )}

                {parsingResult.errors && parsingResult.errors.length > 0 && (
                  <View style={styles.errorsSection}>
                    <Text style={styles.errorsTitle}>Errors:</Text>
                    {parsingResult.errors.map((error: string, index: number) => (
                      <Text key={index} style={styles.errorText}>
                        • {error}
                      </Text>
                    ))}
                  </View>
                )}
              </ScrollView>
            )}

            <View style={styles.resultActions}>
              <Button onPress={() => setShowResult(false)}>Close</Button>
              {parsingResult && parsingResult.successCount > 0 && (
                <Button
                  mode="contained"
                  onPress={() => handleImportTransactions(parsingResult)}
                >
                  Import Transactions
                </Button>
              )}
            </View>
          </Surface>
        </Modal>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    padding: 20,
  },
  modalContent: {
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e293b',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeChip: {
    marginRight: 8,
  },
  selectedTypeChip: {
    backgroundColor: '#6366f1',
  },
  disabledTypeChip: {
    opacity: 0.5,
  },
  disabledTypeText: {
    color: '#94a3b8',
  },
  typeDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
  },
  fileButton: {
    marginBottom: 16,
  },
  fileCard: {
    marginTop: 8,
  },
  fileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    flex: 1,
  },
  fileSize: {
    fontSize: 14,
    color: '#64748b',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    marginRight: 8,
  },
  resultModalContainer: {
    padding: 20,
  },
  resultModalContent: {
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  resultTitle: {
    textAlign: 'center',
    marginBottom: 20,
  },
  resultScroll: {
    maxHeight: 300,
  },
  resultSummary: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  successChip: {
    backgroundColor: '#10b981',
  },
  errorChip: {
    backgroundColor: '#ef4444',
  },
  transactionsPreview: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  errorsSection: {
    marginBottom: 16,
  },
  errorsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ef4444',
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 4,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
  },
});

export default StatementUpload;