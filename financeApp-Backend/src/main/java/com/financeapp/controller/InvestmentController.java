package com.financeapp.controller;

import com.financeapp.model.Investment;
import com.financeapp.model.InvestmentType;
import com.financeapp.model.User;
import com.financeapp.service.InvestmentService;
import com.financeapp.service.PriceUpdateSchedulerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/investments")
public class InvestmentController {

    @Autowired
    private InvestmentService investmentService;

    @Autowired
    private PriceUpdateSchedulerService priceUpdateSchedulerService;

    // CRUD Operations
    @PostMapping
    public ResponseEntity<?> createInvestment(@Valid @RequestBody Investment investment, 
                                                     Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            // Additional validation
            if (investment.getQuantity() == null || investment.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be a positive number"));
            }
            
            if (investment.getPurchasePrice() == null || investment.getPurchasePrice().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Purchase price must be a positive number"));
            }
            
            if (investment.getPurchaseDate() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Purchase date is required"));
            }
            
            Investment createdInvestment = investmentService.createInvestment(investment, user);
            return ResponseEntity.ok(createdInvestment);
        } catch (Exception e) {
            System.err.println("Error creating investment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create investment: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<List<Investment>> getUserInvestments(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Investment> investments = investmentService.getUserInvestments(user);
        return ResponseEntity.ok(investments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Investment> getInvestmentById(@PathVariable Long id, 
                                                      Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Optional<Investment> investment = investmentService.getInvestmentById(id, user);
        
        if (investment.isPresent()) {
            return ResponseEntity.ok(investment.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateInvestment(@PathVariable Long id, 
                                                     @Valid @RequestBody Investment investment,
                                                     Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            
            // Additional validation
            if (investment.getQuantity() == null || investment.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Quantity must be a positive number"));
            }
            
            if (investment.getPurchasePrice() == null || investment.getPurchasePrice().compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(Map.of("error", "Purchase price must be a positive number"));
            }
            
            if (investment.getPurchaseDate() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Purchase date is required"));
            }
            
            Investment updatedInvestment = investmentService.updateInvestment(id, investment, user);
            return ResponseEntity.ok(updatedInvestment);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            System.err.println("Error updating investment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update investment: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInvestment(@PathVariable Long id, 
                                            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            investmentService.deleteInvestment(id, user);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Portfolio Analytics Endpoints
    @GetMapping("/portfolio/summary")
    public ResponseEntity<Map<String, Object>> getPortfolioSummary(Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                System.err.println("Authentication is null for portfolio summary request");
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            }
            
            User user = (User) authentication.getPrincipal();
            System.out.println("Fetching portfolio summary for user: " + user.getEmail());
            
            Map<String, Object> summary = investmentService.getPortfolioSummary(user);
            System.out.println("Portfolio summary retrieved successfully: " + summary);
            
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            System.err.println("Error fetching portfolio summary: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch portfolio summary: " + e.getMessage()));
        }
    }

    @GetMapping("/portfolio/distribution")
    public ResponseEntity<Map<String, Object>> getPortfolioDistribution(Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            }
            
            User user = (User) authentication.getPrincipal();
            Map<String, Object> distribution = investmentService.getPortfolioDistribution(user);
            return ResponseEntity.ok(distribution);
        } catch (Exception e) {
            System.err.println("Error fetching portfolio distribution: " + e.getMessage());
            return ResponseEntity.status(500).body(Map.of("error", "Failed to fetch portfolio distribution: " + e.getMessage()));
        }
    }

    @GetMapping("/portfolio/performance")
    public ResponseEntity<Map<String, Object>> getPortfolioPerformance(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Map<String, Object> performance = investmentService.getPortfolioPerformance(user);
        return ResponseEntity.ok(performance);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Map<String, Object>>> getInvestmentsByType(@PathVariable InvestmentType type,
                                                                         Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Map<String, Object>> investments = investmentService.getInvestmentsByType(user, type);
        return ResponseEntity.ok(investments);
    }

    // Market Data Operations
    @PostMapping("/update-prices")
    public ResponseEntity<Map<String, String>> updateMarketPrices(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        investmentService.updateMarketPrices(user);
        return ResponseEntity.ok(Map.of("message", "Market prices updated successfully"));
    }

    // Investment Suggestions
    @GetMapping("/suggestions")
    public ResponseEntity<List<Map<String, String>>> getInvestmentSuggestions() {
        List<Map<String, String>> suggestions = investmentService.getPopularInvestments();
        return ResponseEntity.ok(suggestions);
    }

    // Stock Search for Autocomplete
    @GetMapping("/search-stocks")
    public ResponseEntity<List<Map<String, Object>>> searchStocks(@RequestParam String query) {
        List<Map<String, Object>> stockSuggestions = investmentService.searchStocks(query);
        return ResponseEntity.ok(stockSuggestions);
    }
    
    // Get Current Price for a Symbol
    @GetMapping("/current-price/{symbol}")
    public ResponseEntity<Map<String, Object>> getCurrentPrice(@PathVariable String symbol) {
        try {
            Map<String, Object> priceData = investmentService.getCurrentPrice(symbol);
            return ResponseEntity.ok(priceData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Could not fetch price for " + symbol));
        }
    }

    // Investment Types
    @GetMapping("/types")
    public ResponseEntity<InvestmentType[]> getInvestmentTypes() {
        return ResponseEntity.ok(InvestmentType.values());
    }

    // Analytics Dashboard Data
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardData(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Map<String, Object> dashboardData = Map.of(
            "summary", investmentService.getPortfolioSummary(user),
            "distribution", investmentService.getPortfolioDistribution(user),
            "performance", investmentService.getPortfolioPerformance(user)
        );
        
        return ResponseEntity.ok(dashboardData);
    }

    // Bulk Operations
    @PostMapping("/bulk")
    public ResponseEntity<Map<String, Object>> createBulkInvestments(@RequestBody List<Investment> investments,
                                                                    Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        int successCount = 0;
        int failureCount = 0;
        
        for (Investment investment : investments) {
            try {
                investmentService.createInvestment(investment, user);
                successCount++;
            } catch (Exception e) {
                failureCount++;
            }
        }
        
        Map<String, Object> result = Map.of(
            "success", successCount,
            "failures", failureCount,
            "total", investments.size()
        );
        
        return ResponseEntity.ok(result);
    }

    // Search Investments
    @GetMapping("/search")
    public ResponseEntity<List<Investment>> searchInvestments(@RequestParam String query,
                                                            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Investment> allInvestments = investmentService.getUserInvestments(user);
        
        List<Investment> filteredInvestments = allInvestments.stream()
                .filter(investment -> 
                    investment.getSymbol().toLowerCase().contains(query.toLowerCase()) ||
                    investment.getName().toLowerCase().contains(query.toLowerCase()) ||
                    (investment.getSector() != null && investment.getSector().toLowerCase().contains(query.toLowerCase()))
                )
                .toList();
        
        return ResponseEntity.ok(filteredInvestments);
    }

    // Live Price Management Endpoints
    @GetMapping("/api-status")
    public ResponseEntity<Map<String, Object>> getApiStatus() {
        Map<String, Object> status = investmentService.getApiStatus();
        return ResponseEntity.ok(status);
    }

    @PostMapping("/trigger-price-update")
    public ResponseEntity<Map<String, String>> triggerPriceUpdate(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            priceUpdateSchedulerService.updateUserPrices(user);
            return ResponseEntity.ok(Map.of("message", "Price update triggered successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/price-update-status")
    public ResponseEntity<PriceUpdateSchedulerService.PriceUpdateStatus> getPriceUpdateStatus() {
        PriceUpdateSchedulerService.PriceUpdateStatus status = priceUpdateSchedulerService.getUpdateStatus();
        return ResponseEntity.ok(status);
    }

    @PostMapping("/{id}/toggle-live-price")
    public ResponseEntity<Map<String, Object>> toggleLivePrice(@PathVariable Long id,
                                                              @RequestParam boolean enabled,
                                                              Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Optional<Investment> investmentOpt = investmentService.getInvestmentById(id, user);
            
            if (investmentOpt.isPresent()) {
                Investment investment = investmentOpt.get();
                investment.setLivePriceEnabled(enabled);
                Investment updatedInvestment = investmentService.updateInvestment(id, investment, user);
                
                Map<String, Object> response = Map.of(
                    "message", "Live price " + (enabled ? "enabled" : "disabled") + " successfully",
                    "investment", updatedInvestment
                );
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/refresh-price")
    public ResponseEntity<Map<String, Object>> refreshSinglePrice(@PathVariable Long id,
                                                                 Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Optional<Investment> investmentOpt = investmentService.getInvestmentById(id, user);
            
            if (investmentOpt.isPresent()) {
                Investment investment = investmentOpt.get();
                investmentService.updateSingleInvestmentPrice(investment);
                
                // Reload the investment to get updated price
                Investment updatedInvestment = investmentService.getInvestmentById(id, user).get();
                
                Map<String, Object> response = Map.of(
                    "message", "Price refreshed successfully",
                    "investment", updatedInvestment
                );
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}