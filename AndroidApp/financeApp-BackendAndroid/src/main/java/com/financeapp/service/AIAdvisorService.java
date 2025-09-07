package com.financeapp.service;

import com.financeapp.model.Goal;
import com.financeapp.model.Transaction;
import com.financeapp.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AIAdvisorService {

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private GoalService goalService;

    public Map<String, Object> getPersonalizedAdvice(User user) {
        Map<String, Object> advice = new HashMap<>();
        
        // Get financial summary
        Map<String, Object> summary = transactionService.getFinancialSummary(user);
        
        // Get active goals
        List<Goal> activeGoals = goalService.getActiveGoals(user);
        
        // Generate spending advice
        advice.put("spendingAdvice", generateSpendingAdvice(summary, user));
        
        // Generate savings advice
        advice.put("savingsAdvice", generateSavingsAdvice(summary, activeGoals, user));
        
        // Generate budget advice
        advice.put("budgetAdvice", generateBudgetAdvice(summary, user));
        
        // Generate goal advice
        advice.put("goalAdvice", generateGoalAdvice(activeGoals, user));
        
        // Overall financial health score
        advice.put("financialHealthScore", calculateFinancialHealthScore(summary, user));
        
        return advice;
    }

    private Map<String, Object> generateSpendingAdvice(Map<String, Object> summary, User user) {
        Map<String, Object> spendingAdvice = new HashMap<>();
        
        BigDecimal monthlyExpenses = (BigDecimal) summary.get("monthlyExpenses");
        BigDecimal monthlyIncome = (BigDecimal) summary.get("monthlyIncome");
        
        if (monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal expenseRatio = monthlyExpenses.divide(monthlyIncome, 4, BigDecimal.ROUND_HALF_UP);
            
            if (expenseRatio.compareTo(BigDecimal.valueOf(0.8)) > 0) {
                spendingAdvice.put("level", "HIGH_CONCERN");
                spendingAdvice.put("message", "You're spending " + expenseRatio.multiply(BigDecimal.valueOf(100)).intValue() + 
                    "% of your income. Consider reducing discretionary expenses like entertainment and dining out.");
                spendingAdvice.put("recommendations", List.of(
                    "Track daily expenses more carefully",
                    "Set spending limits for non-essential categories",
                    "Look for subscription services you can cancel",
                    "Consider cooking at home more often"
                ));
            } else if (expenseRatio.compareTo(BigDecimal.valueOf(0.6)) > 0) {
                spendingAdvice.put("level", "MODERATE");
                spendingAdvice.put("message", "Your spending is at " + expenseRatio.multiply(BigDecimal.valueOf(100)).intValue() + 
                    "% of income. You have room for improvement in building savings.");
                spendingAdvice.put("recommendations", List.of(
                    "Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
                    "Review your largest expense categories",
                    "Set up automatic savings transfers"
                ));
            } else {
                spendingAdvice.put("level", "GOOD");
                spendingAdvice.put("message", "Great job! You're spending only " + expenseRatio.multiply(BigDecimal.valueOf(100)).intValue() + 
                    "% of your income. Keep up the good work!");
                spendingAdvice.put("recommendations", List.of(
                    "Continue your current spending habits",
                    "Consider increasing your savings rate",
                    "Look into investment opportunities"
                ));
            }
        }
        
        return spendingAdvice;
    }

    private Map<String, Object> generateSavingsAdvice(Map<String, Object> summary, List<Goal> activeGoals, User user) {
        Map<String, Object> savingsAdvice = new HashMap<>();
        
        BigDecimal monthlyBalance = (BigDecimal) summary.get("monthlyBalance");
        BigDecimal totalGoalAmount = activeGoals.stream()
            .map(Goal::getRemainingAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        if (monthlyBalance.compareTo(BigDecimal.ZERO) > 0) {
            if (totalGoalAmount.compareTo(BigDecimal.ZERO) > 0) {
                // Calculate average time to complete goals
                long avgDaysToGoal = activeGoals.stream()
                    .mapToLong(goal -> ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate()))
                    .sum() / activeGoals.size();
                
                BigDecimal monthlySavingsNeeded = totalGoalAmount.divide(
                    BigDecimal.valueOf(avgDaysToGoal / 30.0), 2, BigDecimal.ROUND_HALF_UP);
                
                if (monthlyBalance.compareTo(monthlySavingsNeeded) >= 0) {
                    savingsAdvice.put("level", "ON_TRACK");
                    savingsAdvice.put("message", "You're saving enough to meet your goals! Your current surplus of $" + 
                        monthlyBalance + " exceeds the $" + monthlySavingsNeeded + " needed monthly for your goals.");
                } else {
                    savingsAdvice.put("level", "NEEDS_IMPROVEMENT");
                    savingsAdvice.put("message", "You need to save $" + monthlySavingsNeeded + 
                        " monthly for your goals, but you currently have $" + monthlyBalance + " surplus.");
                    savingsAdvice.put("recommendations", List.of(
                        "Reduce expenses by $" + monthlySavingsNeeded.subtract(monthlyBalance),
                        "Consider extending goal timelines",
                        "Look for additional income sources"
                    ));
                }
            } else {
                savingsAdvice.put("level", "GOOD");
                savingsAdvice.put("message", "You have a positive monthly balance of $" + monthlyBalance + 
                    ". Consider setting some financial goals!");
            }
        } else {
            savingsAdvice.put("level", "CRITICAL");
            savingsAdvice.put("message", "You're spending more than you earn. Focus on reducing expenses immediately.");
            savingsAdvice.put("recommendations", List.of(
                "Create a strict budget",
                "Cut all non-essential expenses",
                "Consider additional income sources",
                "Review all subscriptions and recurring payments"
            ));
        }
        
        return savingsAdvice;
    }

    private Map<String, Object> generateBudgetAdvice(Map<String, Object> summary, User user) {
        Map<String, Object> budgetAdvice = new HashMap<>();
        
        BigDecimal monthlyIncome = (BigDecimal) summary.get("monthlyIncome");
        
        if (user.getMonthlyBudget().compareTo(BigDecimal.ZERO) == 0) {
            budgetAdvice.put("message", "Set up a monthly budget to better track your spending!");
            budgetAdvice.put("suggestedBudget", monthlyIncome.multiply(BigDecimal.valueOf(0.8)));
            budgetAdvice.put("recommendations", List.of(
                "Start with the 50/30/20 rule",
                "Track expenses for a month to understand spending patterns",
                "Set up budget categories"
            ));
        } else {
            BigDecimal monthlyExpenses = (BigDecimal) summary.get("monthlyExpenses");
            if (monthlyExpenses.compareTo(user.getMonthlyBudget()) > 0) {
                budgetAdvice.put("level", "OVER_BUDGET");
                budgetAdvice.put("message", "You're over budget by $" + 
                    monthlyExpenses.subtract(user.getMonthlyBudget()));
            } else {
                budgetAdvice.put("level", "WITHIN_BUDGET");
                budgetAdvice.put("message", "Great job staying within budget!");
            }
        }
        
        return budgetAdvice;
    }

    private Map<String, Object> generateGoalAdvice(List<Goal> activeGoals, User user) {
        Map<String, Object> goalAdvice = new HashMap<>();
        
        if (activeGoals.isEmpty()) {
            goalAdvice.put("message", "Set some financial goals to stay motivated!");
            goalAdvice.put("suggestions", List.of(
                "Emergency fund (3-6 months expenses)",
                "Vacation fund",
                "New device or gadget",
                "Investment fund"
            ));
        } else {
            Goal mostUrgentGoal = activeGoals.stream()
                .min((g1, g2) -> g1.getTargetDate().compareTo(g2.getTargetDate()))
                .orElse(null);
            
            if (mostUrgentGoal != null) {
                long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), mostUrgentGoal.getTargetDate());
                goalAdvice.put("urgentGoal", mostUrgentGoal.getName());
                goalAdvice.put("daysRemaining", daysRemaining);
                
                if (daysRemaining < 30) {
                    goalAdvice.put("level", "URGENT");
                    goalAdvice.put("message", "Your goal '" + mostUrgentGoal.getName() + 
                        "' is due in " + daysRemaining + " days!");
                }
            }
        }
        
        return goalAdvice;
    }

    private int calculateFinancialHealthScore(Map<String, Object> summary, User user) {
        int score = 50; // Base score
        
        BigDecimal monthlyIncome = (BigDecimal) summary.get("monthlyIncome");
        BigDecimal monthlyExpenses = (BigDecimal) summary.get("monthlyExpenses");
        BigDecimal netBalance = (BigDecimal) summary.get("netBalance");
        
        // Income vs Expenses ratio (30 points max)
        if (monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal expenseRatio = monthlyExpenses.divide(monthlyIncome, 4, BigDecimal.ROUND_HALF_UP);
            if (expenseRatio.compareTo(BigDecimal.valueOf(0.5)) <= 0) {
                score += 30;
            } else if (expenseRatio.compareTo(BigDecimal.valueOf(0.7)) <= 0) {
                score += 20;
            } else if (expenseRatio.compareTo(BigDecimal.valueOf(0.9)) <= 0) {
                score += 10;
            }
        }
        
        // Net balance (20 points max)
        if (netBalance.compareTo(BigDecimal.ZERO) > 0) {
            if (netBalance.compareTo(monthlyIncome.multiply(BigDecimal.valueOf(3))) >= 0) {
                score += 20; // 3+ months of income saved
            } else if (netBalance.compareTo(monthlyIncome) >= 0) {
                score += 15; // 1+ month of income saved
            } else {
                score += 10; // Some savings
            }
        }
        
        return Math.min(100, Math.max(0, score));
    }

    public Map<String, Object> getGoalAdvice(Long goalId, User user) {
        Map<String, Object> goalAnalysis = goalService.getGoalAnalysis(goalId, user);
        Map<String, Object> advice = new HashMap<>();
        
        Goal goal = (Goal) goalAnalysis.get("goal");
        BigDecimal remainingAmount = (BigDecimal) goalAnalysis.get("remainingAmount");
        Long daysRemaining = (Long) goalAnalysis.get("daysRemaining");
        
        if (daysRemaining > 0 && remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal dailySavingsNeeded = (BigDecimal) goalAnalysis.get("dailySavingsNeeded");
            
            advice.put("goalName", goal.getName());
            advice.put("advice", "To reach your goal of " + goal.getName() + ", you need to save $" + 
                dailySavingsNeeded + " per day for the next " + daysRemaining + " days.");
            
            // Get user's current financial situation
            Map<String, Object> summary = transactionService.getFinancialSummary(user);
            BigDecimal monthlyBalance = (BigDecimal) summary.get("monthlyBalance");
            
            if (monthlyBalance.compareTo(dailySavingsNeeded.multiply(BigDecimal.valueOf(30))) >= 0) {
                advice.put("feasibility", "ACHIEVABLE");
                advice.put("message", "This goal is achievable with your current income!");
            } else {
                advice.put("feasibility", "CHALLENGING");
                advice.put("message", "This goal is challenging. Consider reducing expenses or extending the timeline.");
                advice.put("recommendations", List.of(
                    "Reduce discretionary spending",
                    "Look for additional income sources",
                    "Consider extending the goal deadline",
                    "Break the goal into smaller milestones"
                ));
            }
        }
        
        return advice;
    }
}