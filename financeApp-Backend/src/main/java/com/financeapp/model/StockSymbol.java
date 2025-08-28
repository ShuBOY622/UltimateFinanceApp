package com.financeapp.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_symbols", indexes = {
    @Index(name = "idx_symbol", columnList = "symbol"),
    @Index(name = "idx_company_name", columnList = "companyName"),
    @Index(name = "idx_sector", columnList = "sector")
})
public class StockSymbol {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 20)
    private String symbol;
    
    @Column(nullable = false, length = 200)
    private String companyName;
    
    @Column(length = 10)
    private String series; // EQ, BE, etc.
    
    @Column
    private LocalDate listingDate;
    
    @Column
    private Double paidUpValue;
    
    @Column
    private Integer marketLot;
    
    @Column(length = 20)
    private String isinNumber;
    
    @Column
    private Double faceValue;
    
    @Column(length = 50)
    private String sector; // Will be auto-categorized based on company name
    
    @Column(length = 20)
    private String yahooSymbol; // AUTO-GENERATED: SYMBOL.NS
    
    @Column
    private boolean isActive = true;
    
    @Column
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        // Auto-generate Yahoo symbol
        if (yahooSymbol == null) {
            yahooSymbol = symbol + ".NS";
        }
        // Auto-categorize sector if not set
        if (sector == null) {
            sector = autoCategorizeSector(companyName);
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    private String autoCategorizeSector(String companyName) {
        if (companyName == null) return "Other";
        
        String name = companyName.toLowerCase();
        
        // Banking & Finance
        if (name.contains("bank") || name.contains("finance") || name.contains("financial") || 
            name.contains("capital") || name.contains("insurance") || name.contains("credit")) {
            return "Finance";
        }
        
        // Technology
        if (name.contains("tech") || name.contains("software") || name.contains("infotech") || 
            name.contains("information") || name.contains("systems") || name.contains("solutions")) {
            return "Technology";
        }
        
        // Healthcare & Pharma
        if (name.contains("pharma") || name.contains("drug") || name.contains("hospital") || 
            name.contains("health") || name.contains("medical") || name.contains("bio")) {
            return "Healthcare";
        }
        
        // Manufacturing & Industrial
        if (name.contains("industries") || name.contains("manufacturing") || name.contains("steel") || 
            name.contains("metals") || name.contains("engineering") || name.contains("machinery")) {
            return "Industrials";
        }
        
        // Energy & Oil
        if (name.contains("oil") || name.contains("gas") || name.contains("petroleum") || 
            name.contains("energy") || name.contains("power") || name.contains("coal")) {
            return "Energy";
        }
        
        // Consumer Goods
        if (name.contains("consumer") || name.contains("food") || name.contains("beverages") || 
            name.contains("textiles") || name.contains("retail")) {
            return "Consumer Goods";
        }
        
        // Real Estate & Construction
        if (name.contains("real estate") || name.contains("construction") || name.contains("builders") || 
            name.contains("infrastructure") || name.contains("cement")) {
            return "Real Estate";
        }
        
        // Telecommunications
        if (name.contains("telecom") || name.contains("communication") || name.contains("broadband")) {
            return "Telecommunications";
        }
        
        return "Other";
    }
    
    // Constructors
    public StockSymbol() {}
    
    public StockSymbol(String symbol, String companyName, String series) {
        this.symbol = symbol;
        this.companyName = companyName;
        this.series = series;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }
    
    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    
    public String getSeries() { return series; }
    public void setSeries(String series) { this.series = series; }
    
    public LocalDate getListingDate() { return listingDate; }
    public void setListingDate(LocalDate listingDate) { this.listingDate = listingDate; }
    
    public Double getPaidUpValue() { return paidUpValue; }
    public void setPaidUpValue(Double paidUpValue) { this.paidUpValue = paidUpValue; }
    
    public Integer getMarketLot() { return marketLot; }
    public void setMarketLot(Integer marketLot) { this.marketLot = marketLot; }
    
    public String getIsinNumber() { return isinNumber; }
    public void setIsinNumber(String isinNumber) { this.isinNumber = isinNumber; }
    
    public Double getFaceValue() { return faceValue; }
    public void setFaceValue(Double faceValue) { this.faceValue = faceValue; }
    
    public String getSector() { return sector; }
    public void setSector(String sector) { this.sector = sector; }
    
    public String getYahooSymbol() { return yahooSymbol; }
    public void setYahooSymbol(String yahooSymbol) { this.yahooSymbol = yahooSymbol; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}