package com.financeapp.service;

import com.financeapp.model.StockSymbol;
import com.financeapp.repository.StockSymbolRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class StockSymbolLoaderService {
    
    @Autowired
    private StockSymbolRepository stockSymbolRepository;
    
    // In-memory cache for O(1) access
    private final Map<String, StockSymbol> symbolCache = new ConcurrentHashMap<>();
    private final Map<String, String> symbolToYahooMapping = new ConcurrentHashMap<>();
    private final DateTimeFormatter[] dateFormatters = {
        DateTimeFormatter.ofPattern("dd-MMM-yyyy"),
        DateTimeFormatter.ofPattern("dd-MM-yyyy"),
        DateTimeFormatter.ofPattern("yyyy-MM-dd")
    };
    
    @Transactional
    public void loadStockSymbolsFromCSV() {
        try {
            // Check if data already exists
            long count = stockSymbolRepository.countActiveSymbols();
            if (count > 0) {
                System.out.println("Stock symbols already loaded (" + count + " symbols). Loading cache from database...");
                loadCacheFromDatabase();
                return;
            }
            
            System.out.println("Loading stock symbols from CSV file: stocksData.csv");
            
            ClassPathResource resource = new ClassPathResource("stocksData.csv");
            BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()));
            
            String line;
            int processed = 0;
            int skipped = 0;
            boolean isFirstLine = true;
            
            while ((line = reader.readLine()) != null) {
                try {
                    // Skip header
                    if (isFirstLine) {
                        isFirstLine = false;
                        continue;
                    }
                    
                    StockSymbol symbol = parseCSVLine(line);
                    if (symbol != null) {
                        stockSymbolRepository.save(symbol);
                        processed++;
                        
                        if (processed % 500 == 0) {
                            System.out.println("Processed " + processed + " stock symbols...");
                        }
                    } else {
                        skipped++;
                    }
                } catch (Exception e) {
                    System.err.println("Error processing line: " + line + " - " + e.getMessage());
                    skipped++;
                }
            }
            
            reader.close();
            
            System.out.println("Stock symbol loading completed:");
            System.out.println("- Processed: " + processed);
            System.out.println("- Skipped: " + skipped);
            
            // Load into cache
            loadCacheFromDatabase();
            
        } catch (Exception e) {
            System.err.println("Error loading stock symbols from CSV: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private StockSymbol parseCSVLine(String line) {
        // CSV format: SYMBOL,NAME OF COMPANY, SERIES, DATE OF LISTING, PAID UP VALUE, MARKET LOT, ISIN NUMBER, FACE VALUE
        
        String[] parts = line.split(",(?=([^\"]*\"[^\"]*\")*[^\"]*$)");
        
        if (parts.length < 3) {
            return null;
        }
        
        try {
            String symbol = cleanValue(parts[0]);
            String companyName = cleanValue(parts[1]);
            String series = parts.length > 2 ? cleanValue(parts[2]) : "EQ";
            
            // Skip invalid symbols
            if (symbol.isEmpty() || companyName.isEmpty()) {
                return null;
            }
            
            StockSymbol stockSymbol = new StockSymbol(symbol, companyName, series);
            
            // Parse optional fields
            if (parts.length > 3) {
                String dateStr = cleanValue(parts[3]);
                if (!dateStr.isEmpty()) {
                    stockSymbol.setListingDate(parseDate(dateStr));
                }
            }
            
            if (parts.length > 4) {
                String paidUpStr = cleanValue(parts[4]);
                if (!paidUpStr.isEmpty()) {
                    try {
                        stockSymbol.setPaidUpValue(Double.parseDouble(paidUpStr));
                    } catch (NumberFormatException e) {
                        // Ignore invalid number
                    }
                }
            }
            
            if (parts.length > 5) {
                String marketLotStr = cleanValue(parts[5]);
                if (!marketLotStr.isEmpty()) {
                    try {
                        stockSymbol.setMarketLot(Integer.parseInt(marketLotStr));
                    } catch (NumberFormatException e) {
                        // Ignore invalid number
                    }
                }
            }
            
            if (parts.length > 6) {
                stockSymbol.setIsinNumber(cleanValue(parts[6]));
            }
            
            if (parts.length > 7) {
                String faceValueStr = cleanValue(parts[7]);
                if (!faceValueStr.isEmpty()) {
                    try {
                        stockSymbol.setFaceValue(Double.parseDouble(faceValueStr));
                    } catch (NumberFormatException e) {
                        // Ignore invalid number
                    }
                }
            }
            
            return stockSymbol;
            
        } catch (Exception e) {
            System.err.println("Error parsing CSV line: " + line + " - " + e.getMessage());
            return null;
        }
    }
    
    private String cleanValue(String value) {
        if (value == null) return "";
        return value.trim().replace("\"", "");
    }
    
    private LocalDate parseDate(String dateStr) {
        for (DateTimeFormatter formatter : dateFormatters) {
            try {
                return LocalDate.parse(dateStr, formatter);
            } catch (DateTimeParseException e) {
                // Try next formatter
            }
        }
        System.err.println("Could not parse date: " + dateStr);
        return null;
    }
    
    public void loadCacheFromDatabase() {
        System.out.println("Loading stock symbols into memory cache...");
        
        List<StockSymbol> symbols = stockSymbolRepository.findByIsActiveTrue();
        
        symbolCache.clear();
        symbolToYahooMapping.clear();
        
        for (StockSymbol symbol : symbols) {
            symbolCache.put(symbol.getSymbol().toUpperCase(), symbol);
            if (symbol.getYahooSymbol() != null) {
                symbolToYahooMapping.put(symbol.getSymbol().toUpperCase(), symbol.getYahooSymbol());
            }
        }
        
        System.out.println("Loaded " + symbols.size() + " stock symbols into cache");
        System.out.println("Memory usage: ~" + (symbols.size() * 200 / 1024) + "KB");
    }
    
    // Fast lookup methods using cache
    public StockSymbol findBySymbol(String symbol) {
        return symbolCache.get(symbol.toUpperCase());
    }
    
    public String getYahooSymbol(String symbol) {
        String yahooSymbol = symbolToYahooMapping.get(symbol.toUpperCase());
        if (yahooSymbol != null) {
            return yahooSymbol;
        }
        // Fallback: auto-generate .NS suffix
        return symbol.toUpperCase() + ".NS";
    }
    
    public Map<String, String> getAllYahooSymbolMappings() {
        return new HashMap<>(symbolToYahooMapping);
    }
    
    public List<StockSymbol> searchSymbols(String query) {
        // Use database search for complex queries with ranking
        return stockSymbolRepository.searchSymbols(query);
    }
    
    public boolean isSymbolSupported(String symbol) {
        return symbolCache.containsKey(symbol.toUpperCase());
    }
    
    public List<StockSymbol> getPopularStocks() {
        return stockSymbolRepository.findPopularEquityStocks();
    }
    
    public List<String> getAllSectors() {
        return stockSymbolRepository.findDistinctSectors();
    }
    
    public int getCacheSize() {
        return symbolCache.size();
    }
    
    public Map<String, Object> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSymbols", symbolCache.size());
        stats.put("yahooMappings", symbolToYahooMapping.size());
        stats.put("memoryUsageKB", symbolCache.size() * 200 / 1024);
        return stats;
    }
}