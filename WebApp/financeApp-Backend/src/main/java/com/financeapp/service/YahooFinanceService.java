package com.financeapp.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financeapp.service.StockSymbolLoaderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Yahoo Finance API Service for fetching Indian stock prices
 * Replaces UpstoxIntegrationService with web scraping approach
 */
@Service
public class YahooFinanceService {
    
    @Autowired
    private StockSymbolLoaderService stockSymbolLoaderService;
    
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Value("${yahoo.finance.api.base-url:https://query1.finance.yahoo.com/v8/finance/chart}")
    private String yahooFinanceBaseUrl;
    
    @Value("${yahoo.finance.api.enabled:true}")
    private boolean yahooFinanceEnabled;
    
    // Indian stock symbol to Yahoo Finance symbol mapping (adding .NS for NSE)
    private final Map<String, String> symbolToYahooSymbol = new HashMap<>();
    
    public YahooFinanceService() {
        initializeSymbolMapping();
    }
    
    private void initializeSymbolMapping() {
        // Popular Indian stocks - NSE symbols for Yahoo Finance
        symbolToYahooSymbol.put("RELIANCE", "RELIANCE.NS");
        symbolToYahooSymbol.put("TCS", "TCS.NS");
        symbolToYahooSymbol.put("HDFCBANK", "HDFCBANK.NS");
        symbolToYahooSymbol.put("INFY", "INFY.NS");
        symbolToYahooSymbol.put("HINDUNILVR", "HINDUNILVR.NS");
        symbolToYahooSymbol.put("ICICIBANK", "ICICIBANK.NS");
        symbolToYahooSymbol.put("KOTAKBANK", "KOTAKBANK.NS");
        symbolToYahooSymbol.put("ITC", "ITC.NS");
        symbolToYahooSymbol.put("LT", "LT.NS");
        symbolToYahooSymbol.put("SBIN", "SBIN.NS");
        symbolToYahooSymbol.put("BAJFINANCE", "BAJFINANCE.NS");
        symbolToYahooSymbol.put("BHARTIARTL", "BHARTIARTL.NS");
        symbolToYahooSymbol.put("ASIANPAINT", "ASIANPAINT.NS");
        symbolToYahooSymbol.put("MARUTI", "MARUTI.NS");
        symbolToYahooSymbol.put("AXISBANK", "AXISBANK.NS");
        symbolToYahooSymbol.put("WIPRO", "WIPRO.NS");
        symbolToYahooSymbol.put("ONGC", "ONGC.NS");
        symbolToYahooSymbol.put("NTPC", "NTPC.NS");
        symbolToYahooSymbol.put("TECHM", "TECHM.NS");
        symbolToYahooSymbol.put("POWERGRID", "POWERGRID.NS");
        symbolToYahooSymbol.put("NESTLEIND", "NESTLEIND.NS");
        symbolToYahooSymbol.put("DRREDDY", "DRREDDY.NS");
        symbolToYahooSymbol.put("M&M", "M&M.NS");
        symbolToYahooSymbol.put("TITAN", "TITAN.NS");
        symbolToYahooSymbol.put("SUNPHARMA", "SUNPHARMA.NS");
        
        // Add missing stocks from our database
        symbolToYahooSymbol.put("BRITANNIA", "BRITANNIA.NS");
        symbolToYahooSymbol.put("HCLTECH", "HCLTECH.NS");
        symbolToYahooSymbol.put("IOC", "IOC.NS");
        symbolToYahooSymbol.put("BPCL", "BPCL.NS");
        symbolToYahooSymbol.put("TATAMOTORS", "TATAMOTORS.NS");
        symbolToYahooSymbol.put("BAJAJ-AUTO", "BAJAJ-AUTO.NS");
        symbolToYahooSymbol.put("CIPLA", "CIPLA.NS");
        symbolToYahooSymbol.put("APOLLOHOSP", "APOLLOHOSP.NS");
        symbolToYahooSymbol.put("ULTRACEMCO", "ULTRACEMCO.NS");
        symbolToYahooSymbol.put("GRASIM", "GRASIM.NS");
        symbolToYahooSymbol.put("TATASTEEL", "TATASTEEL.NS");
        symbolToYahooSymbol.put("HINDALCO", "HINDALCO.NS");
        symbolToYahooSymbol.put("JSWSTEEL", "JSWSTEEL.NS");
        symbolToYahooSymbol.put("HDFCLIFE", "HDFCLIFE.NS");
    }
    
    /**
     * Fetches current price for a single stock symbol
     */
    public BigDecimal getCurrentPrice(String symbol) {
        try {
            String yahooSymbol = getYahooSymbol(symbol);
            if (yahooSymbol == null) {
                System.err.println("Symbol not supported: " + symbol);
                return null;
            }
            
            Map<String, BigDecimal> prices = getCurrentPrices(List.of(symbol));
            return prices.get(symbol);
        } catch (Exception e) {
            System.err.println("Error fetching current price for " + symbol + ": " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Fetches current prices for multiple stock symbols
     */
    public Map<String, BigDecimal> getCurrentPrices(List<String> symbols) {
        Map<String, BigDecimal> result = new HashMap<>();
        
        if (!yahooFinanceEnabled) {
            // If Yahoo Finance is disabled, return null prices (will use purchase price as fallback)
            symbols.forEach(symbol -> result.put(symbol, null));
            return result;
        }
        
        try {
            // Process each symbol individually for better error handling
            for (String symbol : symbols) {
                String yahooSymbol = getYahooSymbol(symbol);
                if (yahooSymbol == null) {
                    System.err.println("Symbol not supported: " + symbol);
                    result.put(symbol, null);
                    continue;
                }
                
                try {
                    BigDecimal price = fetchPriceFromYahoo(yahooSymbol);
                    result.put(symbol, price);
                    
                    if (price != null) {
                        System.out.println("Fetched price for " + symbol + " (" + yahooSymbol + "): " + price);
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching price for " + symbol + ": " + e.getMessage());
                    result.put(symbol, null);
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error fetching prices from Yahoo Finance: " + e.getMessage());
            // Return null prices if API fails (will fallback to purchase price)
            symbols.forEach(symbol -> result.put(symbol, null));
        }
        
        return result;
    }
    
    /**
     * Fetch price from Yahoo Finance API for a single symbol
     */
    private BigDecimal fetchPriceFromYahoo(String yahooSymbol) {
        try {
            String url = yahooFinanceBaseUrl + "/" + yahooSymbol + "?interval=1d&range=1mo";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            headers.set("Accept", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            // Make API call
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                return parsePriceFromResponse(response.getBody());
            } else {
                System.err.println("Yahoo Finance API returned status: " + response.getStatusCode());
                return null;
            }
            
        } catch (Exception e) {
            System.err.println("Error calling Yahoo Finance API for " + yahooSymbol + ": " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Parse price from Yahoo Finance API response
     */
    private BigDecimal parsePriceFromResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode chart = root.get("chart");
            
            if (chart != null && chart.has("result")) {
                JsonNode results = chart.get("result");
                if (results.isArray() && results.size() > 0) {
                    JsonNode result = results.get(0);
                    JsonNode meta = result.get("meta");
                    
                    if (meta != null && meta.has("regularMarketPrice")) {
                        double price = meta.get("regularMarketPrice").asDouble();
                        return BigDecimal.valueOf(price);
                    }
                }
            }
            
            System.err.println("Could not find regularMarketPrice in Yahoo Finance response");
            return null;
            
        } catch (Exception e) {
            System.err.println("Error parsing Yahoo Finance response: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Get Yahoo Finance symbol for a given symbol with smart fallback
     */
    private String getYahooSymbol(String symbol) {
        // First try the database-loaded cache
        String yahooSymbol = stockSymbolLoaderService.getYahooSymbol(symbol);
        if (yahooSymbol != null) {
            return yahooSymbol;
        }
        
        // Fallback to explicit mapping
        String upperSymbol = symbol.toUpperCase();
        if (symbolToYahooSymbol.containsKey(upperSymbol)) {
            return symbolToYahooSymbol.get(upperSymbol);
        }
        
        // Ultimate fallback: Add .NS suffix
        return upperSymbol + ".NS";
    }
    
    /**
     * Check if API integration is available
     */
    public boolean isApiAvailable() {
        return yahooFinanceEnabled;
    }
    
    /**
     * Get list of supported symbols
     */
    public List<String> getSupportedSymbols() {
        return symbolToYahooSymbol.keySet().stream()
                .sorted()
                .collect(Collectors.toList());
    }
    
    /**
     * Add or update symbol mapping
     */
    public void addSymbolMapping(String symbol, String yahooSymbol) {
        symbolToYahooSymbol.put(symbol.toUpperCase(), yahooSymbol);
    }
    
    /**
     * Validate if symbol is supported
     * With smart fallback, we support most NSE symbols
     */
    public boolean isSymbolSupported(String symbol) {
        // Check database cache first
        if (stockSymbolLoaderService.isSymbolSupported(symbol)) {
            return true;
        }
        
        // Check explicit mapping
        String upperSymbol = symbol.toUpperCase();
        if (symbolToYahooSymbol.containsKey(upperSymbol)) {
            return true;
        }
        
        // With smart fallback (.NS suffix), we support most symbols
        // Only exclude obviously invalid symbols
        if (symbol == null || symbol.trim().isEmpty() || symbol.length() > 20) {
            return false;
        }
        
        // Support any reasonable symbol as we have fallback mechanism
        return true;
    }
    
    /**
     * Get market status (simplified - you can enhance this)
     */
    public boolean isMarketOpen() {
        // Simplified market hours check (9:15 AM to 3:30 PM IST on weekdays)
        // You can enhance this with actual market calendar API
        java.time.LocalTime now = java.time.LocalTime.now();
        java.time.DayOfWeek dayOfWeek = java.time.LocalDate.now().getDayOfWeek();
        
        boolean isWeekday = dayOfWeek.getValue() >= 1 && dayOfWeek.getValue() <= 5;
        boolean isMarketHours = now.isAfter(java.time.LocalTime.of(9, 15)) && 
                               now.isBefore(java.time.LocalTime.of(15, 30));
        
        return isWeekday && isMarketHours;
    }
    
    /**
     * Fetch historical price for a symbol on a specific date using Yahoo Finance
     */
    public BigDecimal getHistoricalPrice(String symbol, LocalDateTime purchaseDate) {
        try {
            String yahooSymbol = getYahooSymbol(symbol);
            if (yahooSymbol == null || !isApiAvailable()) {
                return null;
            }
            
            // Convert LocalDateTime to Unix timestamp
            Instant startInstant = purchaseDate.toInstant(ZoneOffset.UTC);
            Instant endInstant = purchaseDate.plusDays(1).toInstant(ZoneOffset.UTC);
            
            long period1 = startInstant.getEpochSecond();
            long period2 = endInstant.getEpochSecond();
            
            String url = yahooFinanceBaseUrl + "/" + yahooSymbol + 
                        "?period1=" + period1 + "&period2=" + period2 + "&interval=1d";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            headers.set("Accept", "application/json");
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                return parseHistoricalPriceFromResponse(response.getBody());
            }
            
        } catch (Exception e) {
            System.err.println("Error fetching historical price for " + symbol + ": " + e.getMessage());
        }
        
        // Fallback to current price if historical price is not available
        return getCurrentPrice(symbol);
    }
    
    /**
     * Parse historical price from Yahoo Finance API response
     */
    private BigDecimal parseHistoricalPriceFromResponse(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode chart = root.get("chart");
            
            if (chart != null && chart.has("result")) {
                JsonNode results = chart.get("result");
                if (results.isArray() && results.size() > 0) {
                    JsonNode result = results.get(0);
                    JsonNode indicators = result.get("indicators");
                    
                    if (indicators != null && indicators.has("quote")) {
                        JsonNode quotes = indicators.get("quote");
                        if (quotes.isArray() && quotes.size() > 0) {
                            JsonNode quote = quotes.get(0);
                            JsonNode closeArray = quote.get("close");
                            
                            if (closeArray != null && closeArray.isArray() && closeArray.size() > 0) {
                                // Get the last available closing price
                                for (int i = closeArray.size() - 1; i >= 0; i--) {
                                    JsonNode closePrice = closeArray.get(i);
                                    if (!closePrice.isNull()) {
                                        double price = closePrice.asDouble();
                                        return BigDecimal.valueOf(price);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            System.err.println("Could not find historical price in Yahoo Finance response");
            return null;
            
        } catch (Exception e) {
            System.err.println("Error parsing Yahoo Finance historical response: " + e.getMessage());
            return null;
        }
    }
}