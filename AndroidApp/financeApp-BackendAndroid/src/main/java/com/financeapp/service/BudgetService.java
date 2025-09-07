package com.financeapp.service;

import com.financeapp.model.Budget;
import com.financeapp.model.Transaction;
import com.financeapp.model.User;
import com.financeapp.repository.BudgetRepository;
import com.financeapp.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public Budget createOrUpdateBudget(User user, BigDecimal monthlySalary) {
        Optional<Budget> existingBudget = budgetRepository.findByUser(user);
        
        Budget budget;
        if (existingBudget.isPresent()) {
            budget = existingBudget.get();
            budget.setMonthlySalary(monthlySalary);
        } else {
            budget = new Budget(monthlySalary, user);
        }
        
        return budgetRepository.save(budget);
    }

    public Optional<Budget> getBudgetByUser(User user) {
        return budgetRepository.findByUser(user);
    }

    public Budget updateBudgetPercentages(User user, Map<String, BigDecimal> percentages) {
        Budget budget = budgetRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Budget not found for user"));

        // Update percentages
        if (percentages.containsKey("housing")) {
            budget.setHousingPercentage(percentages.get("housing"));
        }
        if (percentages.containsKey("food")) {
            budget.setFoodPercentage(percentages.get("food"));
        }
        if (percentages.containsKey("transportation")) {
            budget.setTransportationPercentage(percentages.get("transportation"));
        }
        if (percentages.containsKey("entertainment")) {
            budget.setEntertainmentPercentage(percentages.get("entertainment"));
        }
        if (percentages.containsKey("shopping")) {
            budget.setShoppingPercentage(percentages.get("shopping"));
        }
        if (percentages.containsKey("utilities")) {
            budget.setUtilitiesPercentage(percentages.get("utilities"));
        }
        if (percentages.containsKey("healthcare")) {
            budget.setHealthcarePercentage(percentages.get("healthcare"));
        }
        if (percentages.containsKey("education")) {
            budget.setEducationPercentage(percentages.get("education"));
        }
        if (percentages.containsKey("savings")) {
            budget.setSavingsPercentage(percentages.get("savings"));
        }
        if (percentages.containsKey("emergencyFund")) {
            budget.setEmergencyFundPercentage(percentages.get("emergencyFund"));
        }
        if (percentages.containsKey("miscellaneous")) {
            budget.setMiscellaneousPercentage(percentages.get("miscellaneous"));
        }

        return budgetRepository.save(budget);
    }

    public Map<String, Object> getBudgetAnalysis(User user) {
        Optional<Budget> budgetOpt = budgetRepository.findByUser(user);
        if (budgetOpt.isEmpty()) {
            return createEmptyAnalysis();
        }

        Budget budget = budgetOpt.get();
        YearMonth currentMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = currentMonth.atEndOfMonth().atTime(23, 59, 59);

        // Get current month's transactions
        List<Transaction> monthlyTransactions = transactionRepository
                .findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(user, startOfMonth, endOfMonth);

        Map<String, BigDecimal> budgetBreakdown = budget.getBudgetBreakdown();
        Map<String, BigDecimal> actualSpending = calculateActualSpending(monthlyTransactions);
        Map<String, BigDecimal> remainingBudget = calculateRemainingBudget(budgetBreakdown, actualSpending);
        Map<String, Boolean> overBudgetCategories = findOverBudgetCategories(budgetBreakdown, actualSpending);

        Map<String, Object> analysis = new HashMap<>();
        analysis.put("budget", budget);
        analysis.put("budgetBreakdown", budgetBreakdown);
        analysis.put("actualSpending", actualSpending);
        analysis.put("remainingBudget", remainingBudget);
        analysis.put("overBudgetCategories", overBudgetCategories);
        analysis.put("totalBudgeted", budget.getTotalBudgetedAmount());
        analysis.put("totalSpent", actualSpending.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add));
        analysis.put("totalRemaining", remainingBudget.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add));
        analysis.put("monthlyTransactions", monthlyTransactions);
        analysis.put("warnings", generateWarnings(budgetBreakdown, actualSpending, overBudgetCategories));

        return analysis;
    }

    private Map<String, BigDecimal> calculateActualSpending(List<Transaction> transactions) {
        Map<String, BigDecimal> spending = new HashMap<>();
        
        // Initialize budget categories with zero
        spending.put("RENT", BigDecimal.ZERO);
        spending.put("FOOD", BigDecimal.ZERO);
        spending.put("TRANSPORTATION", BigDecimal.ZERO);
        spending.put("ENTERTAINMENT", BigDecimal.ZERO);
        spending.put("SHOPPING", BigDecimal.ZERO);
        spending.put("UTILITIES", BigDecimal.ZERO);
        spending.put("HEALTHCARE", BigDecimal.ZERO);
        spending.put("EDUCATION", BigDecimal.ZERO);
        spending.put("SAVINGS", BigDecimal.ZERO);
        spending.put("EMERGENCY_FUND", BigDecimal.ZERO);
        spending.put("OTHER_EXPENSE", BigDecimal.ZERO);
        
        // Initialize additional transaction categories that might not have budget allocations
        spending.put("TRAVEL", BigDecimal.ZERO);
        spending.put("INSURANCE", BigDecimal.ZERO);

        for (Transaction transaction : transactions) {
            if (transaction.getType() == Transaction.TransactionType.EXPENSE) {
                String category = transaction.getCategory().name();
                
                // Handle categories that map to budget categories
                String budgetCategory = mapToBudgetCategory(category);
                
                // Safely add to spending using getOrDefault to avoid null pointer
                spending.put(budgetCategory, spending.getOrDefault(budgetCategory, BigDecimal.ZERO).add(transaction.getAmount()));
            }
        }

        return spending;
    }
    
    /**
     * Maps transaction categories to budget categories
     */
    private String mapToBudgetCategory(String transactionCategory) {
        switch (transactionCategory) {
            case "TRAVEL":
            case "INSURANCE":
                return "OTHER_EXPENSE";
            default:
                return transactionCategory;
        }
    }

    private Map<String, BigDecimal> calculateRemainingBudget(Map<String, BigDecimal> budgetBreakdown, 
                                                           Map<String, BigDecimal> actualSpending) {
        Map<String, BigDecimal> remaining = new HashMap<>();
        
        for (String category : budgetBreakdown.keySet()) {
            BigDecimal budgeted = budgetBreakdown.get(category);
            BigDecimal spent = actualSpending.getOrDefault(category, BigDecimal.ZERO);
            remaining.put(category, budgeted.subtract(spent));
        }
        
        return remaining;
    }

    private Map<String, Boolean> findOverBudgetCategories(Map<String, BigDecimal> budgetBreakdown, 
                                                        Map<String, BigDecimal> actualSpending) {
        Map<String, Boolean> overBudget = new HashMap<>();
        
        for (String category : budgetBreakdown.keySet()) {
            BigDecimal budgeted = budgetBreakdown.get(category);
            BigDecimal spent = actualSpending.getOrDefault(category, BigDecimal.ZERO);
            overBudget.put(category, spent.compareTo(budgeted) > 0);
        }
        
        return overBudget;
    }

    private Map<String, Object> generateWarnings(Map<String, BigDecimal> budgetBreakdown, 
                                               Map<String, BigDecimal> actualSpending,
                                               Map<String, Boolean> overBudgetCategories) {
        Map<String, Object> warnings = new HashMap<>();
        Map<String, String> categoryWarnings = new HashMap<>();
        Map<String, String> suggestions = new HashMap<>();

        for (String category : overBudgetCategories.keySet()) {
            if (Boolean.TRUE.equals(overBudgetCategories.get(category))) {
                BigDecimal budgeted = budgetBreakdown.get(category);
                BigDecimal spent = actualSpending.getOrDefault(category, BigDecimal.ZERO);
                
                if (budgeted != null && spent != null) {
                    BigDecimal overspent = spent.subtract(budgeted);
                    
                    categoryWarnings.put(category, String.format("Over budget by $%.2f", overspent));
                    suggestions.put(category, generateCompensationSuggestion(category, overspent, budgetBreakdown, actualSpending));
                }
            }
        }

        warnings.put("categoryWarnings", categoryWarnings);
        warnings.put("suggestions", suggestions);
        warnings.put("hasWarnings", !categoryWarnings.isEmpty());

        return warnings;
    }

    private String generateCompensationSuggestion(String overBudgetCategory, BigDecimal overspentAmount,
                                                Map<String, BigDecimal> budgetBreakdown, 
                                                Map<String, BigDecimal> actualSpending) {
        // Find categories with remaining budget that could compensate
        StringBuilder suggestion = new StringBuilder();
        suggestion.append("Consider reducing spending in: ");
        
        Map<String, BigDecimal> availableReductions = new HashMap<>();
        for (String category : budgetBreakdown.keySet()) {
            if (!category.equals(overBudgetCategory) && !category.equals("SAVINGS") && !category.equals("EMERGENCY_FUND")) {
                BigDecimal budgeted = budgetBreakdown.get(category);
                BigDecimal spent = actualSpending.getOrDefault(category, BigDecimal.ZERO);
                BigDecimal remaining = budgeted.subtract(spent);
                
                if (remaining.compareTo(BigDecimal.ZERO) > 0) {
                    availableReductions.put(category, remaining);
                }
            }
        }

        if (availableReductions.isEmpty()) {
            return "Consider increasing your budget allocation for " + formatCategoryName(overBudgetCategory) + 
                   " or reducing spending in other areas next month.";
        }

        // Sort by available amount and suggest top categories
        availableReductions.entrySet().stream()
                .sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed())
                .limit(3)
                .forEach(entry -> {
                    suggestion.append(formatCategoryName(entry.getKey()))
                            .append(" ($").append(entry.getValue().setScale(2, RoundingMode.HALF_UP))
                            .append(" available), ");
                });

        return suggestion.toString().replaceAll(", $", ".");
    }

    private String formatCategoryName(String category) {
        return category.toLowerCase().replace("_", " ");
    }

    private Map<String, Object> createEmptyAnalysis() {
        Map<String, Object> analysis = new HashMap<>();
        analysis.put("budget", null);
        analysis.put("budgetBreakdown", new HashMap<>());
        analysis.put("actualSpending", new HashMap<>());
        analysis.put("remainingBudget", new HashMap<>());
        analysis.put("overBudgetCategories", new HashMap<>());
        analysis.put("totalBudgeted", BigDecimal.ZERO);
        analysis.put("totalSpent", BigDecimal.ZERO);
        analysis.put("totalRemaining", BigDecimal.ZERO);
        analysis.put("monthlyTransactions", List.of());
        analysis.put("warnings", Map.of("hasWarnings", false));
        return analysis;
    }

    public void deleteBudget(User user) {
        budgetRepository.deleteByUser(user);
    }
}