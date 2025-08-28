package com.financeapp.service;

import com.financeapp.model.Investment;
import com.financeapp.model.InvestmentType;
import com.financeapp.model.User;
import com.financeapp.repository.InvestmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InvestmentService {

    @Autowired
    private InvestmentRepository investmentRepository;

    @Autowired
    private YahooFinanceService yahooFinanceService;

    @Value("${investment.price-update.enabled:true}")
    private boolean priceUpdateEnabled;

    private final RestTemplate restTemplate = new RestTemplate();

    // CRUD Operations
    public Investment createInvestment(Investment investment, User user) {
        System.out.println("Creating investment with data:");
        System.out.println("Symbol: " + investment.getSymbol());
        System.out.println("Name: " + investment.getName());
        System.out.println("Type: " + investment.getType());
        System.out.println("Quantity: " + investment.getQuantity());
        System.out.println("Purchase Price: " + investment.getPurchasePrice());
        System.out.println("Purchase Date: " + investment.getPurchaseDate());
        System.out.println("Platform: " + investment.getPlatform());
        System.out.println("Sector: " + investment.getSector());
        
        investment.setUser(user);
        
        // Initialize price tracking fields
        investment.setPriceSource("MANUAL");
        investment.setLivePriceEnabled(true);
        investment.setLastPriceError(null);
        
        // Smart price fetching based on API availability and symbol support
        if (priceUpdateEnabled && yahooFinanceService.isApiAvailable() && 
            yahooFinanceService.isSymbolSupported(investment.getSymbol())) {
            
            try {
                // Fetch current price for real-time market value
                BigDecimal currentPrice = yahooFinanceService.getCurrentPrice(investment.getSymbol());
                
                if (currentPrice != null) {
                    // If no purchase price provided, use current price as baseline
                    if (investment.getPurchasePrice() == null) {
                        investment.setPurchasePrice(currentPrice);
                        investment.setPriceSource("YAHOO_AUTO");
                        System.out.println("Auto-set purchase price for " + investment.getSymbol() + ": " + currentPrice);
                    }
                    
                    // Always set current price from live data
                    investment.setCurrentPrice(currentPrice);
                    investment.setLastPriceUpdate(LocalDateTime.now());
                    investment.setPriceSource("YAHOO_FINANCE");
                } else {
                    // API failed, use manual prices
                    if (investment.getCurrentPrice() == null) {
                        investment.setCurrentPrice(investment.getPurchasePrice());
                    }
                    investment.setLastPriceError("Live price unavailable for " + investment.getSymbol());
                }
            } catch (Exception e) {
                // Handle API errors gracefully
                if (investment.getCurrentPrice() == null) {
                    investment.setCurrentPrice(investment.getPurchasePrice());
                }
                
                String errorMessage = e.getMessage();
                investment.setLastPriceError("Price fetch failed: " + (errorMessage != null ? errorMessage.substring(0, Math.min(errorMessage.length(), 50)) : "Unknown error"));
                
                System.err.println("Error fetching price for " + investment.getSymbol() + ": " + errorMessage);
            }
        } else {
            // API not available or symbol not supported - use manual pricing
            if (investment.getCurrentPrice() == null) {
                investment.setCurrentPrice(investment.getPurchasePrice());
            }
            
            if (!yahooFinanceService.isApiAvailable()) {
                investment.setLastPriceError("Yahoo Finance API not configured");
            } else if (!yahooFinanceService.isSymbolSupported(investment.getSymbol())) {
                investment.setLastPriceError("Symbol " + investment.getSymbol() + " not supported by Yahoo Finance");
            }
        }
        
        Investment savedInvestment = investmentRepository.save(investment);
        
        // Log the result for debugging
        System.out.println("Created investment: " + savedInvestment.getSymbol() + 
                          " | Purchase: " + savedInvestment.getPurchasePrice() + 
                          " | Current: " + savedInvestment.getCurrentPrice() + 
                          " | Source: " + savedInvestment.getPriceSource());
        
        return savedInvestment;
    }

    public List<Investment> getUserInvestments(User user) {
        return investmentRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Optional<Investment> getInvestmentById(Long id, User user) {
        return investmentRepository.findByIdAndUser(id, user);
    }

    public Investment updateInvestment(Long id, Investment updatedInvestment, User user) {
        Optional<Investment> existingInvestment = investmentRepository.findByIdAndUser(id, user);
        if (existingInvestment.isPresent()) {
            Investment investment = existingInvestment.get();
            investment.setSymbol(updatedInvestment.getSymbol());
            investment.setName(updatedInvestment.getName());
            investment.setType(updatedInvestment.getType());
            investment.setQuantity(updatedInvestment.getQuantity());
            investment.setPurchasePrice(updatedInvestment.getPurchasePrice());
            investment.setCurrentPrice(updatedInvestment.getCurrentPrice());
            investment.setPurchaseDate(updatedInvestment.getPurchaseDate());
            investment.setPlatform(updatedInvestment.getPlatform());
            investment.setSector(updatedInvestment.getSector());
            investment.setNotes(updatedInvestment.getNotes());
            investment.setUpdatedAt(LocalDateTime.now());
            return investmentRepository.save(investment);
        }
        throw new RuntimeException("Investment not found");
    }

    public void deleteInvestment(Long id, User user) {
        Optional<Investment> investment = investmentRepository.findByIdAndUser(id, user);
        if (investment.isPresent()) {
            investmentRepository.delete(investment.get());
        } else {
            throw new RuntimeException("Investment not found");
        }
    }

    // Portfolio Analytics
    public Map<String, Object> getPortfolioSummary(User user) {
        Map<String, Object> summary = new HashMap<>();
        
        try {
            List<Investment> investments = investmentRepository.findByUserOrderByCreatedAtDesc(user);
            
            BigDecimal totalInvestment = BigDecimal.ZERO;
            BigDecimal currentValue = BigDecimal.ZERO;
            
            for (Investment investment : investments) {
                try {
                    if (investment.getTotalInvestment() != null) {
                        totalInvestment = totalInvestment.add(investment.getTotalInvestment());
                    }
                    if (investment.getCurrentValue() != null) {
                        currentValue = currentValue.add(investment.getCurrentValue());
                    }
                } catch (Exception e) {
                    System.err.println("Error calculating values for investment " + investment.getId() + ": " + e.getMessage());
                    // Continue with other investments
                }
            }
            
            BigDecimal totalGainLoss = currentValue.subtract(totalInvestment);
            BigDecimal gainLossPercentage = BigDecimal.ZERO;
            
            if (totalInvestment.compareTo(BigDecimal.ZERO) > 0) {
                try {
                    gainLossPercentage = totalGainLoss.divide(totalInvestment, 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100"));
                } catch (ArithmeticException e) {
                    System.err.println("Error calculating gain/loss percentage: " + e.getMessage());
                    gainLossPercentage = BigDecimal.ZERO;
                }
            }
            
            summary.put("totalInvestment", totalInvestment);
            summary.put("currentValue", currentValue);
            summary.put("totalGainLoss", totalGainLoss);
            summary.put("gainLossPercentage", gainLossPercentage);
            summary.put("totalHoldings", investments.size());
            summary.put("isProfit", totalGainLoss.compareTo(BigDecimal.ZERO) >= 0);
            
            System.out.println("Portfolio summary calculated: " + investments.size() + " investments, Total: " + totalInvestment);
            
        } catch (Exception e) {
            System.err.println("Error fetching portfolio summary from database: " + e.getMessage());
            e.printStackTrace();
            
            // Return empty portfolio instead of failing
            summary.put("totalInvestment", BigDecimal.ZERO);
            summary.put("currentValue", BigDecimal.ZERO);
            summary.put("totalGainLoss", BigDecimal.ZERO);
            summary.put("gainLossPercentage", BigDecimal.ZERO);
            summary.put("totalHoldings", 0);
            summary.put("isProfit", true);
            summary.put("error", "Unable to fetch investment data: " + e.getMessage());
        }
        
        return summary;
    }

    public Map<String, Object> getPortfolioDistribution(User user) {
        Map<String, Object> distribution = new HashMap<>();
        
        // Distribution by Investment Type
        List<Object[]> typeDistribution = investmentRepository.getPortfolioDistributionByType(user);
        List<Map<String, Object>> typeData = typeDistribution.stream()
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", ((InvestmentType) row[0]).getDisplayName());
                    item.put("value", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
        
        // Distribution by Sector
        List<Object[]> sectorDistribution = investmentRepository.getPortfolioDistributionBySector(user);
        List<Map<String, Object>> sectorData = sectorDistribution.stream()
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("name", row[0]);
                    item.put("value", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
        
        distribution.put("byType", typeData);
        distribution.put("bySector", sectorData);
        
        return distribution;
    }

    public Map<String, Object> getPortfolioPerformance(User user) {
        Map<String, Object> performance = new HashMap<>();
        
        List<Investment> topProfitable = investmentRepository.getTopProfitableInvestments(user);
        List<Investment> topLosing = investmentRepository.getTopLosingInvestments(user);
        
        // Top 5 performers
        List<Map<String, Object>> topPerformers = topProfitable.stream()
                .limit(5)
                .map(this::investmentToMap)
                .collect(Collectors.toList());
        
        // Bottom 5 performers
        List<Map<String, Object>> bottomPerformers = topLosing.stream()
                .limit(5)
                .map(this::investmentToMap)
                .collect(Collectors.toList());
        
        performance.put("topPerformers", topPerformers);
        performance.put("bottomPerformers", bottomPerformers);
        
        return performance;
    }

    public List<Map<String, Object>> getInvestmentsByType(User user, InvestmentType type) {
        List<Investment> investments = investmentRepository.findByUserAndTypeOrderByCreatedAtDesc(user, type);
        return investments.stream()
                .map(this::investmentToMap)
                .collect(Collectors.toList());
    }

    // Live Market Data Integration using Yahoo Finance API
    public void updateMarketPrices(User user) {
        if (!priceUpdateEnabled) {
            return;
        }
        
        List<Investment> investments = investmentRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .filter(inv -> inv.getLivePriceEnabled() != null && inv.getLivePriceEnabled())
                .collect(Collectors.toList());
        
        if (investments.isEmpty()) {
            return;
        }
        
        // Group investments by symbol to avoid duplicate API calls
        Map<String, List<Investment>> investmentsBySymbol = investments.stream()
                .collect(Collectors.groupingBy(Investment::getSymbol));
        
        // Get all unique symbols
        List<String> symbols = new ArrayList<>(investmentsBySymbol.keySet());
        
        try {
            // Fetch current prices for all symbols at once
            Map<String, BigDecimal> currentPrices = yahooFinanceService.getCurrentPrices(symbols);
            
            // Update each investment with fetched prices
            for (Map.Entry<String, List<Investment>> entry : investmentsBySymbol.entrySet()) {
                String symbol = entry.getKey();
                List<Investment> symbolInvestments = entry.getValue();
                BigDecimal currentPrice = currentPrices.get(symbol);
                
                for (Investment investment : symbolInvestments) {
                    updateInvestmentPrice(investment, currentPrice, symbol);
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error updating market prices: " + e.getMessage());
            // Mark all investments with error
            for (Investment investment : investments) {
                investment.setLastPriceError("Price update failed: " + e.getMessage());
                investmentRepository.save(investment);
            }
        }
    }
    
    // Update price for a single investment
    public void updateSingleInvestmentPrice(Investment investment) {
        if (!priceUpdateEnabled || !investment.getLivePriceEnabled()) {
            return;
        }
        
        try {
            BigDecimal currentPrice = yahooFinanceService.getCurrentPrice(investment.getSymbol());
            updateInvestmentPrice(investment, currentPrice, investment.getSymbol());
        } catch (Exception e) {
            investment.setLastPriceError("Price fetch failed: " + e.getMessage());
            investmentRepository.save(investment);
        }
    }
    
    // Helper method to update investment price with proper tracking
    private void updateInvestmentPrice(Investment investment, BigDecimal currentPrice, String symbol) {
        if (currentPrice != null && currentPrice.compareTo(BigDecimal.ZERO) > 0) {
            investment.setCurrentPrice(currentPrice);
            investment.setPriceSource("YAHOO_FINANCE");
            investment.setLastPriceUpdate(LocalDateTime.now());
            investment.setLastPriceError(null);
        } else {
            // Keep existing price and mark as fallback
            investment.setPriceSource("FALLBACK");
            investment.setLastPriceError("Live price unavailable for " + symbol);
        }
        
        investment.setUpdatedAt(LocalDateTime.now());
        investmentRepository.save(investment);
    }

    // Get suggested stocks/popular investments (using Yahoo Finance supported symbols)
    public List<Map<String, String>> getPopularInvestments() {
        List<Map<String, String>> suggestions = new ArrayList<>();
        
        // Get supported symbols from Yahoo Finance service
        List<String> supportedSymbols = yahooFinanceService.getSupportedSymbols();
        
        // Popular Indian stocks with full names
        Map<String, String> stockNames = new HashMap<>();
        stockNames.put("RELIANCE", "Reliance Industries Ltd");
        stockNames.put("TCS", "Tata Consultancy Services");
        stockNames.put("HDFCBANK", "HDFC Bank Ltd");
        stockNames.put("INFY", "Infosys Ltd");
        stockNames.put("HINDUNILVR", "Hindustan Unilever Ltd");
        stockNames.put("ICICIBANK", "ICICI Bank Ltd");
        stockNames.put("KOTAKBANK", "Kotak Mahindra Bank");
        stockNames.put("ITC", "ITC Ltd");
        stockNames.put("LT", "Larsen & Toubro Ltd");
        stockNames.put("SBIN", "State Bank of India");
        stockNames.put("BAJFINANCE", "Bajaj Finance Ltd");
        stockNames.put("BHARTIARTL", "Bharti Airtel Ltd");
        stockNames.put("ASIANPAINT", "Asian Paints Ltd");
        stockNames.put("MARUTI", "Maruti Suzuki India Ltd");
        stockNames.put("AXISBANK", "Axis Bank Ltd");
        
        for (String symbol : supportedSymbols) {
            if (stockNames.containsKey(symbol)) {
                Map<String, String> suggestion = new HashMap<>();
                suggestion.put("symbol", symbol);
                suggestion.put("name", stockNames.get(symbol));
                suggestion.put("type", "STOCK");
                suggestion.put("supported", "true");
                suggestions.add(suggestion);
            }
        }
        
        return suggestions;
    }
    
    // Get API status and supported symbols count
    public Map<String, Object> getApiStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("yahooFinanceApiAvailable", yahooFinanceService.isApiAvailable());
        status.put("priceUpdateEnabled", priceUpdateEnabled);
        status.put("supportedSymbolsCount", yahooFinanceService.getSupportedSymbols().size());
        status.put("marketOpen", yahooFinanceService.isMarketOpen());
        return status;
    }

    // Helper method to convert Investment to Map for API responses
    private Map<String, Object> investmentToMap(Investment investment) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", investment.getId());
        map.put("symbol", investment.getSymbol());
        map.put("name", investment.getName());
        map.put("type", investment.getType());
        map.put("quantity", investment.getQuantity());
        map.put("purchasePrice", investment.getPurchasePrice());
        map.put("currentPrice", investment.getCurrentPrice());
        map.put("totalInvestment", investment.getTotalInvestment());
        map.put("currentValue", investment.getCurrentValue());
        map.put("gainLoss", investment.getGainLoss());
        map.put("gainLossPercentage", investment.getGainLossPercentage());
        map.put("isProfit", investment.isProfit());
        map.put("purchaseDate", investment.getPurchaseDate());
        map.put("platform", investment.getPlatform());
        map.put("sector", investment.getSector());
        map.put("notes", investment.getNotes());
        map.put("createdAt", investment.getCreatedAt());
        map.put("updatedAt", investment.getUpdatedAt());
        
        // Price tracking fields
        map.put("lastPriceUpdate", investment.getLastPriceUpdate());
        map.put("priceSource", investment.getPriceSource());
        map.put("livePriceEnabled", investment.getLivePriceEnabled());
        map.put("lastPriceError", investment.getLastPriceError());
        
        return map;
    }
}