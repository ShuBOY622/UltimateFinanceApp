package com.financeapp;

import com.financeapp.service.StockSymbolLoaderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TestCSVLoading implements CommandLineRunner {
    
    @Autowired
    private StockSymbolLoaderService stockSymbolLoaderService;
    
    @Override
    public void run(String... args) throws Exception {
        System.out.println("=== Testing CSV Loading ===");
        stockSymbolLoaderService.loadStockSymbolsFromCSV();
        System.out.println("=== CSV Loading Test Completed ===");
        
        // Print some stats
        var stats = stockSymbolLoaderService.getCacheStats();
        System.out.println("Cache Stats: " + stats);
        
        // Test a few lookups
        System.out.println("Testing symbol lookups:");
        String[] testSymbols = {"RELIANCE", "TCS", "HDFCBANK", "BRITANNIA"};
        for (String symbol : testSymbols) {
            var stock = stockSymbolLoaderService.findBySymbol(symbol);
            if (stock != null) {
                System.out.println("Found: " + stock.getSymbol() + " - " + stock.getCompanyName() + " (" + stock.getSector() + ")");
            } else {
                System.out.println("Not found: " + symbol);
            }
        }
    }
}