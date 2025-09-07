package com.financeapp.service;

import com.financeapp.model.User;
import com.financeapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PriceUpdateSchedulerService {

    @Autowired
    private InvestmentService investmentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private YahooFinanceService yahooFinanceService;

    @Value("${investment.price-update.enabled:true}")
    private boolean priceUpdateEnabled;

    @Value("${investment.price-update.market-hours-only:true}")
    private boolean marketHoursOnly;

    /**
     * Scheduled task to update investment prices every 5 minutes
     * Runs only if price updates are enabled and optionally only during market hours
     */
    @Scheduled(fixedDelayString = "${investment.price-update.interval:300000}") // Default 5 minutes
    public void updateAllInvestmentPrices() {
        if (!priceUpdateEnabled) {
            return;
        }

        // Check market hours if enabled
        if (marketHoursOnly && !yahooFinanceService.isMarketOpen()) {
            System.out.println("Market is closed, skipping price update");
            return;
        }

        System.out.println("Starting scheduled price update...");

        try {
            // Get all users who have investments
            List<User> usersWithInvestments = userRepository.findUsersWithInvestments();

            int totalUsersUpdated = 0;
            for (User user : usersWithInvestments) {
                try {
                    investmentService.updateMarketPrices(user);
                    totalUsersUpdated++;
                } catch (Exception e) {
                    System.err.println("Failed to update prices for user " + user.getEmail() + ": " + e.getMessage());
                }
            }

            System.out.println("Price update completed for " + totalUsersUpdated + " users");

        } catch (Exception e) {
            System.err.println("Error in scheduled price update: " + e.getMessage());
        }
    }

    /**
     * Manual trigger for price updates (can be called via API)
     */
    public void triggerPriceUpdate() {
        if (!priceUpdateEnabled) {
            throw new RuntimeException("Price updates are disabled");
        }

        updateAllInvestmentPrices();
    }

    /**
     * Update prices for a specific user
     */
    public void updateUserPrices(User user) {
        if (!priceUpdateEnabled) {
            throw new RuntimeException("Price updates are disabled");
        }

        investmentService.updateMarketPrices(user);
    }

    /**
     * Get price update status
     */
    public PriceUpdateStatus getUpdateStatus() {
        PriceUpdateStatus status = new PriceUpdateStatus();
        status.setEnabled(priceUpdateEnabled);
        status.setMarketHoursOnly(marketHoursOnly);
        status.setMarketOpen(yahooFinanceService.isMarketOpen());
        status.setApiAvailable(yahooFinanceService.isApiAvailable());
        return status;
    }

    /**
     * Inner class for price update status
     */
    public static class PriceUpdateStatus {
        private boolean enabled;
        private boolean marketHoursOnly;
        private boolean marketOpen;
        private boolean apiAvailable;

        // Getters and setters
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }

        public boolean isMarketHoursOnly() { return marketHoursOnly; }
        public void setMarketHoursOnly(boolean marketHoursOnly) { this.marketHoursOnly = marketHoursOnly; }

        public boolean isMarketOpen() { return marketOpen; }
        public void setMarketOpen(boolean marketOpen) { this.marketOpen = marketOpen; }

        public boolean isApiAvailable() { return apiAvailable; }
        public void setApiAvailable(boolean apiAvailable) { this.apiAvailable = apiAvailable; }
    }
}