package com.financeapp.config;

import com.financeapp.service.StockSymbolLoaderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class DataLoaderStartup implements ApplicationRunner {
    
    @Autowired
    private StockSymbolLoaderService stockSymbolLoaderService;
    
    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("=== Starting Stock Symbol Data Loading ===");
        long startTime = System.currentTimeMillis();
        
        stockSymbolLoaderService.loadStockSymbolsFromCSV();
        
        long endTime = System.currentTimeMillis();
        System.out.println("=== Stock Symbol Data Loading Completed in " + (endTime - startTime) + "ms ===");
        
        // Print cache stats
        var stats = stockSymbolLoaderService.getCacheStats();
        System.out.println("Cache Stats: " + stats);
    }
}