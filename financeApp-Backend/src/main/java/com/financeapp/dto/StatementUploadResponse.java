package com.financeapp.dto;

import java.util.List;
import java.util.ArrayList;

/**
 * DTO for statement upload API response
 * Contains parsed transactions and metadata about the parsing operation
 */
public class StatementUploadResponse {
    
    private boolean success;
    private String message;
    private List<ParsedTransaction> transactions;
    private StatementMetadata metadata;
    private List<String> warnings;
    private List<String> errors;
    
    // Constructors
    public StatementUploadResponse() {
        this.transactions = new ArrayList<>();
        this.warnings = new ArrayList<>();
        this.errors = new ArrayList<>();
    }
    
    public StatementUploadResponse(boolean success, String message) {
        this();
        this.success = success;
        this.message = message;
    }
    
    // Static factory methods
    public static StatementUploadResponse success(List<ParsedTransaction> transactions, StatementMetadata metadata) {
        StatementUploadResponse response = new StatementUploadResponse(true, "Statement parsed successfully");
        response.setTransactions(transactions);
        response.setMetadata(metadata);
        return response;
    }
    
    public static StatementUploadResponse error(String message) {
        StatementUploadResponse response = new StatementUploadResponse(false, message);
        response.getErrors().add(message);
        return response;
    }
    
    // Helper methods
    public void addWarning(String warning) {
        this.warnings.add(warning);
    }
    
    public void addError(String error) {
        this.errors.add(error);
    }
    
    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }
    
    public void setSuccess(boolean success) {
        this.success = success;
    }
    
    public String getMessage() {
        return message;
    }
    
    public void setMessage(String message) {
        this.message = message;
    }
    
    public List<ParsedTransaction> getTransactions() {
        return transactions;
    }
    
    public void setTransactions(List<ParsedTransaction> transactions) {
        this.transactions = transactions;
    }
    
    public StatementMetadata getMetadata() {
        return metadata;
    }
    
    public void setMetadata(StatementMetadata metadata) {
        this.metadata = metadata;
    }
    
    public List<String> getWarnings() {
        return warnings;
    }
    
    public void setWarnings(List<String> warnings) {
        this.warnings = warnings;
    }
    
    public List<String> getErrors() {
        return errors;
    }
    
    public void setErrors(List<String> errors) {
        this.errors = errors;
    }
    
    /**
     * Nested class for statement parsing metadata
     */
    public static class StatementMetadata {
        private String fileName;
        private String fileFormat;
        private long fileSize;
        private int totalTransactions;
        private int parsedTransactions;
        private int duplicateTransactions;
        private int errorTransactions;
        private String dateRange;
        private String accountInfo;
        
        // Constructors
        public StatementMetadata() {}
        
        public StatementMetadata(String fileName, String fileFormat, long fileSize) {
            this.fileName = fileName;
            this.fileFormat = fileFormat;
            this.fileSize = fileSize;
        }
        
        // Getters and Setters
        public String getFileName() {
            return fileName;
        }
        
        public void setFileName(String fileName) {
            this.fileName = fileName;
        }
        
        public String getFileFormat() {
            return fileFormat;
        }
        
        public void setFileFormat(String fileFormat) {
            this.fileFormat = fileFormat;
        }
        
        public long getFileSize() {
            return fileSize;
        }
        
        public void setFileSize(long fileSize) {
            this.fileSize = fileSize;
        }
        
        public int getTotalTransactions() {
            return totalTransactions;
        }
        
        public void setTotalTransactions(int totalTransactions) {
            this.totalTransactions = totalTransactions;
        }
        
        public int getParsedTransactions() {
            return parsedTransactions;
        }
        
        public void setParsedTransactions(int parsedTransactions) {
            this.parsedTransactions = parsedTransactions;
        }
        
        public int getDuplicateTransactions() {
            return duplicateTransactions;
        }
        
        public void setDuplicateTransactions(int duplicateTransactions) {
            this.duplicateTransactions = duplicateTransactions;
        }
        
        public int getErrorTransactions() {
            return errorTransactions;
        }
        
        public void setErrorTransactions(int errorTransactions) {
            this.errorTransactions = errorTransactions;
        }
        
        public String getDateRange() {
            return dateRange;
        }
        
        public void setDateRange(String dateRange) {
            this.dateRange = dateRange;
        }
        
        public String getAccountInfo() {
            return accountInfo;
        }
        
        public void setAccountInfo(String accountInfo) {
            this.accountInfo = accountInfo;
        }
    }
}