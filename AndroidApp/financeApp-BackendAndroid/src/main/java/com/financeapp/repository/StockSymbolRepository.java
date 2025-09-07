package com.financeapp.repository;

import com.financeapp.model.StockSymbol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockSymbolRepository extends JpaRepository<StockSymbol, Long> {
    
    Optional<StockSymbol> findBySymbol(String symbol);
    
    List<StockSymbol> findByIsActiveTrue();
    
    @Query("SELECT s FROM StockSymbol s WHERE s.isActive = true AND " +
           "(LOWER(s.symbol) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.companyName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.sector) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY " +
           "CASE WHEN LOWER(s.symbol) = LOWER(:query) THEN 1 " +
           "WHEN LOWER(s.symbol) LIKE LOWER(CONCAT(:query, '%')) THEN 2 " +
           "WHEN LOWER(s.companyName) LIKE LOWER(CONCAT(:query, '%')) THEN 3 " +
           "ELSE 4 END, s.symbol " +
           "LIMIT 20")
    List<StockSymbol> searchSymbols(@Param("query") String query);
    
    @Query("SELECT s FROM StockSymbol s WHERE s.isActive = true AND s.series = 'EQ' " +
           "ORDER BY s.symbol LIMIT 50")
    List<StockSymbol> findPopularEquityStocks();
    
    List<StockSymbol> findBySectorAndIsActiveTrue(String sector);
    
    @Query("SELECT DISTINCT s.sector FROM StockSymbol s WHERE s.isActive = true AND s.sector IS NOT NULL ORDER BY s.sector")
    List<String> findDistinctSectors();
    
    @Query("SELECT COUNT(s) FROM StockSymbol s WHERE s.isActive = true")
    long countActiveSymbols();
    
    List<StockSymbol> findBySeriesAndIsActiveTrue(String series);
}