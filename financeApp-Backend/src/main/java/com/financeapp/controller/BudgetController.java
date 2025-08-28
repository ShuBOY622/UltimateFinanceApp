package com.financeapp.controller;

import com.financeapp.model.Budget;
import com.financeapp.model.User;
import com.financeapp.service.BudgetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin(origins = "http://localhost:3000")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @PostMapping("/create")
    public ResponseEntity<?> createBudget(@RequestBody Map<String, Object> request, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            BigDecimal monthlySalary = new BigDecimal(request.get("monthlySalary").toString());
            Budget budget = budgetService.createOrUpdateBudget(user, monthlySalary);
            
            return ResponseEntity.ok(Map.of(
                "message", "Budget created successfully",
                "budget", budget
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create budget: " + e.getMessage()));
        }
    }

    @GetMapping("/get")
    public ResponseEntity<?> getBudget(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Optional<Budget> budget = budgetService.getBudgetByUser(user);
            if (budget.isPresent()) {
                return ResponseEntity.ok(budget.get());
            } else {
                return ResponseEntity.ok(Map.of("message", "No budget found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get budget: " + e.getMessage()));
        }
    }

    @PutMapping("/update-percentages")
    public ResponseEntity<?> updateBudgetPercentages(@RequestBody Map<String, BigDecimal> percentages,
                                                   Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Budget updatedBudget = budgetService.updateBudgetPercentages(user, percentages);
            
            return ResponseEntity.ok(Map.of(
                "message", "Budget percentages updated successfully",
                "budget", updatedBudget
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to update budget: " + e.getMessage()));
        }
    }

    @GetMapping("/analysis")
    public ResponseEntity<?> getBudgetAnalysis(Authentication authentication) {
        try {
            if (authentication == null || authentication.getPrincipal() == null) {
                System.err.println("Authentication is null for budget analysis request");
                return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
            }
            
            User user = (User) authentication.getPrincipal();
            System.out.println("Fetching budget analysis for user: " + user.getEmail());
            
            Map<String, Object> analysis = budgetService.getBudgetAnalysis(user);
            System.out.println("Budget analysis retrieved successfully");
            
            return ResponseEntity.ok(analysis);
        } catch (Exception e) {
            System.err.println("Error fetching budget analysis: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Failed to get budget analysis: " + e.getMessage()));
        }
    }

    @GetMapping("/breakdown")
    public ResponseEntity<?> getBudgetBreakdown(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            Optional<Budget> budgetOpt = budgetService.getBudgetByUser(user);
            if (budgetOpt.isPresent()) {
                Budget budget = budgetOpt.get();
                Map<String, BigDecimal> breakdown = budget.getBudgetBreakdown();
                
                return ResponseEntity.ok(Map.of(
                    "breakdown", breakdown,
                    "monthlySalary", budget.getMonthlySalary(),
                    "totalBudgeted", budget.getTotalBudgetedAmount()
                ));
            } else {
                return ResponseEntity.ok(Map.of("message", "No budget found"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to get budget breakdown: " + e.getMessage()));
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteBudget(Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            budgetService.deleteBudget(user);
            return ResponseEntity.ok(Map.of("message", "Budget deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to delete budget: " + e.getMessage()));
        }
    }
}