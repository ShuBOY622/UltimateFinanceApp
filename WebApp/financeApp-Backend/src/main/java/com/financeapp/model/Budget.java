package com.financeapp.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Entity
@Table(name = "budgets")
public class Budget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @DecimalMin(value = "0.01", message = "Monthly salary must be greater than 0")
    @Column(precision = 15, scale = 2)
    private BigDecimal monthlySalary;

    // Budget allocations as percentages
    @Column(precision = 5, scale = 2)
    private BigDecimal housingPercentage = BigDecimal.valueOf(30.0); // 30%

    @Column(precision = 5, scale = 2)
    private BigDecimal foodPercentage = BigDecimal.valueOf(15.0); // 15%

    @Column(precision = 5, scale = 2)
    private BigDecimal transportationPercentage = BigDecimal.valueOf(10.0); // 10%

    @Column(precision = 5, scale = 2)
    private BigDecimal entertainmentPercentage = BigDecimal.valueOf(5.0); // 5%

    @Column(precision = 5, scale = 2)
    private BigDecimal shoppingPercentage = BigDecimal.valueOf(10.0); // 10%

    @Column(precision = 5, scale = 2)
    private BigDecimal utilitiesPercentage = BigDecimal.valueOf(8.0); // 8%

    @Column(precision = 5, scale = 2)
    private BigDecimal healthcarePercentage = BigDecimal.valueOf(5.0); // 5%

    @Column(precision = 5, scale = 2)
    private BigDecimal educationPercentage = BigDecimal.valueOf(3.0); // 3%

    @Column(precision = 5, scale = 2)
    private BigDecimal savingsPercentage = BigDecimal.valueOf(20.0); // 20%

    @Column(precision = 5, scale = 2)
    private BigDecimal emergencyFundPercentage = BigDecimal.valueOf(10.0); // 10%

    @Column(precision = 5, scale = 2)
    private BigDecimal miscellaneousPercentage = BigDecimal.valueOf(4.0); // 4%

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnore
    private User user;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Constructors
    public Budget() {}

    public Budget(BigDecimal monthlySalary, User user) {
        this.monthlySalary = monthlySalary;
        this.user = user;
    }

    // Helper methods to calculate actual amounts
    public Map<String, BigDecimal> getBudgetBreakdown() {
        Map<String, BigDecimal> breakdown = new HashMap<>();
        breakdown.put("RENT", monthlySalary.multiply(housingPercentage).divide(BigDecimal.valueOf(100)));
        breakdown.put("FOOD", monthlySalary.multiply(foodPercentage).divide(BigDecimal.valueOf(100)));
        breakdown.put("TRANSPORTATION", monthlySalary.multiply(transportationPercentage).divide(BigDecimal.valueOf(100)));
        breakdown.put("ENTERTAINMENT", monthlySalary.multiply(entertainmentPercentage).divide(BigDecimal.valueOf(100)));
        breakdown.put("SHOPPING", monthlySalary.multiply(shoppingPercentage).divide(BigDecimal.valueOf(100)));
        breakdown.put("UTILITIES", monthlySalary.multiply(utilitiesPercentage).divide(BigDecimal.valueOf(100)));
        breakdown.put("HEALTHCARE", monthlySalary.multiply(healthcarePercentage).divide(BigDecimal.valueOf(100)));
        breakdown.put("EDUCATION", monthlySalary.multiply(educationPercentage).divide(BigDecimal.valueOf(100)));
        breakdown.put("SAVINGS", monthlySalary.multiply(savingsPercentage).divide(BigDecimal.valueOf(100)));
        breakdown.put("EMERGENCY_FUND", monthlySalary.multiply(emergencyFundPercentage).divide(BigDecimal.valueOf(100)));
        breakdown.put("OTHER_EXPENSE", monthlySalary.multiply(miscellaneousPercentage).divide(BigDecimal.valueOf(100)));
        return breakdown;
    }

    public BigDecimal getTotalBudgetedAmount() {
        return getBudgetBreakdown().values().stream()
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public BigDecimal getMonthlySalary() { return monthlySalary; }
    public void setMonthlySalary(BigDecimal monthlySalary) { this.monthlySalary = monthlySalary; }

    public BigDecimal getHousingPercentage() { return housingPercentage; }
    public void setHousingPercentage(BigDecimal housingPercentage) { this.housingPercentage = housingPercentage; }

    public BigDecimal getFoodPercentage() { return foodPercentage; }
    public void setFoodPercentage(BigDecimal foodPercentage) { this.foodPercentage = foodPercentage; }

    public BigDecimal getTransportationPercentage() { return transportationPercentage; }
    public void setTransportationPercentage(BigDecimal transportationPercentage) { this.transportationPercentage = transportationPercentage; }

    public BigDecimal getEntertainmentPercentage() { return entertainmentPercentage; }
    public void setEntertainmentPercentage(BigDecimal entertainmentPercentage) { this.entertainmentPercentage = entertainmentPercentage; }

    public BigDecimal getShoppingPercentage() { return shoppingPercentage; }
    public void setShoppingPercentage(BigDecimal shoppingPercentage) { this.shoppingPercentage = shoppingPercentage; }

    public BigDecimal getUtilitiesPercentage() { return utilitiesPercentage; }
    public void setUtilitiesPercentage(BigDecimal utilitiesPercentage) { this.utilitiesPercentage = utilitiesPercentage; }

    public BigDecimal getHealthcarePercentage() { return healthcarePercentage; }
    public void setHealthcarePercentage(BigDecimal healthcarePercentage) { this.healthcarePercentage = healthcarePercentage; }

    public BigDecimal getEducationPercentage() { return educationPercentage; }
    public void setEducationPercentage(BigDecimal educationPercentage) { this.educationPercentage = educationPercentage; }

    public BigDecimal getSavingsPercentage() { return savingsPercentage; }
    public void setSavingsPercentage(BigDecimal savingsPercentage) { this.savingsPercentage = savingsPercentage; }

    public BigDecimal getEmergencyFundPercentage() { return emergencyFundPercentage; }
    public void setEmergencyFundPercentage(BigDecimal emergencyFundPercentage) { this.emergencyFundPercentage = emergencyFundPercentage; }

    public BigDecimal getMiscellaneousPercentage() { return miscellaneousPercentage; }
    public void setMiscellaneousPercentage(BigDecimal miscellaneousPercentage) { this.miscellaneousPercentage = miscellaneousPercentage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}