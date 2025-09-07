package com.financeapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    @Column(precision = 15, scale = 2)
    private BigDecimal amount;

    @NotBlank
    private String description;

    @Enumerated(EnumType.STRING)
    @NotNull
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @NotNull
    private Category category;

    @NotNull
    private LocalDateTime transactionDate;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (transactionDate == null) {
            transactionDate = LocalDateTime.now();
        }
    }

    // Constructors
    public Transaction() {}

    public Transaction(BigDecimal amount, String description, TransactionType type, Category category, User user) {
        this.amount = amount;
        this.description = description;
        this.type = type;
        this.category = category;
        this.user = user;
        this.transactionDate = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // Enums
    public enum TransactionType {
        INCOME, EXPENSE
    }

    public enum Category {
        // Income categories
        SALARY, FREELANCE, INVESTMENT, BUSINESS, OTHER_INCOME, FRIENDS_TRANSFERS,
        
        // Expense categories
        FOOD, TRANSPORTATION, ENTERTAINMENT, SHOPPING, UTILITIES, 
        HEALTHCARE, EDUCATION, TRAVEL, RENT, INSURANCE, OTHER_EXPENSE
    }
}