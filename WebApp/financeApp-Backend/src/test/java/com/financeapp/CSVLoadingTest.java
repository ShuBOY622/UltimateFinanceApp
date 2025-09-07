package com.financeapp;

import com.financeapp.model.StockSymbol;
import com.financeapp.service.StockSymbolLoaderService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class CSVLoadingTest {

    @Autowired
    private StockSymbolLoaderService stockSymbolLoaderService;

    @Test
    public void testCSVLoading() {
        // Load stocks from CSV
        stockSymbolLoaderService.loadStockSymbolsFromCSV();
        
        // Check cache size
        int cacheSize = stockSymbolLoaderService.getCacheSize();
        System.out.println("Cache size: " + cacheSize);
        assertTrue(cacheSize > 1000, "Should have loaded more than 1000 stocks");
        
        // Test specific stock lookup
        StockSymbol reliance = stockSymbolLoaderService.findBySymbol("RELIANCE");
        assertNotNull(reliance, "RELIANCE should be found");
        assertEquals("RELIANCE", reliance.getSymbol());
        assertNotNull(reliance.getCompanyName());
        assertNotNull(reliance.getSector());
        
        // Test search functionality
        List<StockSymbol> results = stockSymbolLoaderService.searchSymbols("RELIANCE");
        assertFalse(results.isEmpty(), "Search should return results");
        
        // Test Yahoo symbol mapping
        String yahooSymbol = stockSymbolLoaderService.getYahooSymbol("RELIANCE");
        assertNotNull(yahooSymbol, "Yahoo symbol should be generated");
        assertTrue(yahooSymbol.endsWith(".NS"), "Yahoo symbol should end with .NS");
        
        System.out.println("All tests passed!");
    }
}