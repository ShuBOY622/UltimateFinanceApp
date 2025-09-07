package com.financeapp.repository;

import com.financeapp.model.Investment;
import com.financeapp.model.InvestmentType;
import com.financeapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    
    List<Investment> findByUserOrderByCreatedAtDesc(User user);
    
    List<Investment> findByUserAndTypeOrderByCreatedAtDesc(User user, InvestmentType type);
    
    List<Investment> findByUserAndSymbolOrderByCreatedAtDesc(User user, String symbol);
    
    Optional<Investment> findByIdAndUser(Long id, User user);
    
    @Query("SELECT i FROM Investment i WHERE i.user = :user AND i.purchaseDate BETWEEN :startDate AND :endDate ORDER BY i.createdAt DESC")
    List<Investment> findByUserAndPurchaseDateBetween(@Param("user") User user, 
                                                     @Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT SUM(i.quantity * i.purchasePrice) FROM Investment i WHERE i.user = :user")
    BigDecimal getTotalInvestmentByUser(@Param("user") User user);
    
    @Query("SELECT SUM(i.quantity * COALESCE(i.currentPrice, i.purchasePrice)) FROM Investment i WHERE i.user = :user")
    BigDecimal getCurrentPortfolioValueByUser(@Param("user") User user);
    
    @Query("SELECT i.type, SUM(i.quantity * COALESCE(i.currentPrice, i.purchasePrice)) FROM Investment i WHERE i.user = :user GROUP BY i.type")
    List<Object[]> getPortfolioDistributionByType(@Param("user") User user);
    
    @Query("SELECT i.sector, SUM(i.quantity * COALESCE(i.currentPrice, i.purchasePrice)) FROM Investment i WHERE i.user = :user AND i.sector IS NOT NULL GROUP BY i.sector")
    List<Object[]> getPortfolioDistributionBySector(@Param("user") User user);
    
    @Query("SELECT COUNT(i) FROM Investment i WHERE i.user = :user")
    Long countInvestmentsByUser(@Param("user") User user);
    
    @Query("SELECT i FROM Investment i WHERE i.user = :user AND " +
           "(i.quantity * COALESCE(i.currentPrice, i.purchasePrice) - i.quantity * i.purchasePrice) > 0 " +
           "ORDER BY (i.quantity * COALESCE(i.currentPrice, i.purchasePrice) - i.quantity * i.purchasePrice) DESC")
    List<Investment> getTopProfitableInvestments(@Param("user") User user);
    
    @Query("SELECT i FROM Investment i WHERE i.user = :user AND " +
           "(i.quantity * COALESCE(i.currentPrice, i.purchasePrice) - i.quantity * i.purchasePrice) < 0 " +
           "ORDER BY (i.quantity * COALESCE(i.currentPrice, i.purchasePrice) - i.quantity * i.purchasePrice) ASC")
    List<Investment> getTopLosingInvestments(@Param("user") User user);
}