package com.financeapp.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonFormat;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "investments")
public class Investment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String symbol; // Stock symbol like RELIANCE, TCS, etc.

    @NotBlank
    @Column(nullable = false)
    private String name; // Company name

    @NotNull
    @Enumerated(EnumType.STRING)
    private InvestmentType type; // STOCK, MUTUAL_FUND, ETF, BOND, CRYPTO

    @NotNull
    @Positive
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal quantity;

    @NotNull
    @Positive
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal purchasePrice;

    @Column(precision = 15, scale = 2)
    private BigDecimal currentPrice;

    @NotNull
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime purchaseDate;

    @Column
    private String platform; // Groww, Zerodha, etc.

    @Column
    private String sector; // Technology, Finance, Healthcare, etc.

    @Column(length = 500)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    // Price tracking fields for live updates
    @Column
    private LocalDateTime lastPriceUpdate;

    @Column(length = 50)
    private String priceSource; // "YAHOO_FINANCE", "MANUAL", "FALLBACK"

    @Column
    private Boolean livePriceEnabled = true;

    @Column(length = 100)
    private String lastPriceError; // Store last error message if price fetch fails

    // Daily return calculation (for mutual funds)
    @Column(precision = 10, scale = 4)
    private BigDecimal dailyReturn;

    // Constructors
    public Investment() {}

    public Investment(String symbol, String name, InvestmentType type, BigDecimal quantity, 
                     BigDecimal purchasePrice, LocalDateTime purchaseDate, User user) {
        this.symbol = symbol;
        this.name = name;
        this.type = type;
        this.quantity = quantity;
        this.purchasePrice = purchasePrice;
        this.purchaseDate = purchaseDate;
        this.user = user;
        this.currentPrice = purchasePrice; // Default to purchase price
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public InvestmentType getType() { return type; }
    public void setType(InvestmentType type) { this.type = type; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public BigDecimal getPurchasePrice() { return purchasePrice; }
    public void setPurchasePrice(BigDecimal purchasePrice) { this.purchasePrice = purchasePrice; }

    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }

    public LocalDateTime getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(LocalDateTime purchaseDate) { this.purchaseDate = purchaseDate; }

    public String getPlatform() { return platform; }
    public void setPlatform(String platform) { this.platform = platform; }

    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getLastPriceUpdate() { return lastPriceUpdate; }
    public void setLastPriceUpdate(LocalDateTime lastPriceUpdate) { this.lastPriceUpdate = lastPriceUpdate; }

    public String getPriceSource() { return priceSource; }
    public void setPriceSource(String priceSource) { this.priceSource = priceSource; }

    public Boolean getLivePriceEnabled() { return livePriceEnabled; }
    public void setLivePriceEnabled(Boolean livePriceEnabled) { this.livePriceEnabled = livePriceEnabled; }

    public String getLastPriceError() { return lastPriceError; }
    public void setLastPriceError(String lastPriceError) { this.lastPriceError = lastPriceError; }

    public BigDecimal getDailyReturn() { return dailyReturn; }
    public void setDailyReturn(BigDecimal dailyReturn) { this.dailyReturn = dailyReturn; }

    // Calculated fields
    public BigDecimal getTotalInvestment() {
        return purchasePrice.multiply(quantity);
    }

    public BigDecimal getCurrentValue() {
        if (currentPrice != null) {
            return currentPrice.multiply(quantity);
        }
        return getTotalInvestment();
    }

    public BigDecimal getGainLoss() {
        return getCurrentValue().subtract(getTotalInvestment());
    }

    public BigDecimal getGainLossPercentage() {
        BigDecimal totalInvestment = getTotalInvestment();
        if (totalInvestment.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return getGainLoss().divide(totalInvestment, 4, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }

    public Boolean isProfit() {
        return getGainLoss().compareTo(BigDecimal.ZERO) >= 0;
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Override
    public String toString() {
        return "Investment{" +
                "id=" + id +
                ", symbol='" + symbol + '\'' +
                ", name='" + name + '\'' +
                ", type=" + type +
                ", quantity=" + quantity +
                ", purchasePrice=" + purchasePrice +
                ", currentPrice=" + currentPrice +
                '}';
    }
}