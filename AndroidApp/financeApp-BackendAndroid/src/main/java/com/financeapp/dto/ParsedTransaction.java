package com.financeapp.dto;

import com.financeapp.model.Transaction;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO representing a transaction parsed from bank/UPI statements
 * Used for preview and validation before importing into the database
 */
public class ParsedTransaction {
    
    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotBlank
    private String description;
    
    @NotNull
    private Transaction.TransactionType type;
    
    @NotNull
    private Transaction.Category category;
    
    @NotNull
    private LocalDateTime transactionDate;
    
    // Additional fields specific to statement parsing
    private String originalDescription; // Raw description from statement
    private String counterParty; // UPI ID or merchant name
    private String referenceNumber; // UPI reference or transaction ID
    private String sourceFormat; // PDF, CSV, HTML, EXCEL
    private Double confidence; // Confidence score for categorization (0.0 to 1.0)
    private Boolean isDuplicate; // Flag to indicate potential duplicate
    private String notes; // Any parsing notes or warnings
    
    // Constructors
    public ParsedTransaction() {}
    
    public ParsedTransaction(BigDecimal amount, String description, Transaction.TransactionType type, 
                           Transaction.Category category, LocalDateTime transactionDate) {
        this.amount = amount;
        this.description = description;
        this.type = type;
        this.category = category;
        this.transactionDate = transactionDate;
    }
    
    // Convert to Transaction entity
    public Transaction toTransaction() {
        Transaction transaction = new Transaction();
        transaction.setAmount(this.amount);
        transaction.setDescription(this.description);
        transaction.setType(this.type);
        
        // Ensure category is never null - fallback to OTHER_EXPENSE or OTHER_INCOME
        if (this.category != null) {
            transaction.setCategory(this.category);
        } else {
            // Fallback based on transaction type
            if (this.type == Transaction.TransactionType.INCOME) {
                transaction.setCategory(Transaction.Category.OTHER_INCOME);
            } else {
                transaction.setCategory(Transaction.Category.OTHER_EXPENSE);
            }
        }
        
        transaction.setTransactionDate(this.transactionDate);
        return transaction;
    }
    
    // Getters and Setters
    public BigDecimal getAmount() {
        return amount;
    }
    
    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public Transaction.TransactionType getType() {
        return type;
    }
    
    public void setType(Transaction.TransactionType type) {
        this.type = type;
    }
    
    public Transaction.Category getCategory() {
        return category;
    }
    
    public void setCategory(Transaction.Category category) {
        this.category = category;
    }
    
    public LocalDateTime getTransactionDate() {
        return transactionDate;
    }
    
    public void setTransactionDate(LocalDateTime transactionDate) {
        this.transactionDate = transactionDate;
    }
    
    public String getOriginalDescription() {
        return originalDescription;
    }
    
    public void setOriginalDescription(String originalDescription) {
        this.originalDescription = originalDescription;
    }
    
    public String getCounterParty() {
        return counterParty;
    }
    
    public void setCounterParty(String counterParty) {
        this.counterParty = counterParty;
    }
    
    public String getReferenceNumber() {
        return referenceNumber;
    }
    
    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }
    
    public String getSourceFormat() {
        return sourceFormat;
    }
    
    public void setSourceFormat(String sourceFormat) {
        this.sourceFormat = sourceFormat;
    }
    
    public Double getConfidence() {
        return confidence;
    }
    
    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }
    
    public Boolean getIsDuplicate() {
        return isDuplicate;
    }
    
    public void setIsDuplicate(Boolean isDuplicate) {
        this.isDuplicate = isDuplicate;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}