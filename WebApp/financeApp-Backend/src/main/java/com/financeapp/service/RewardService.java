package com.financeapp.service;

import com.financeapp.model.Transaction;
import com.financeapp.model.User;
import com.financeapp.repository.TransactionRepository;
import com.financeapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@Transactional
public class RewardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public void updateRewardPoints(User user, Transaction transaction) {
        BigDecimal currentPoints = user.getRewardPoints();
        BigDecimal pointsChange = BigDecimal.ZERO;

        if (transaction.getType() == Transaction.TransactionType.INCOME) {
            // Reward points for income (1 point per $10 earned)
            pointsChange = transaction.getAmount().divide(BigDecimal.valueOf(10), 0, BigDecimal.ROUND_DOWN);
        } else {
            // Check if user is within budget
            pointsChange = calculateExpensePoints(user, transaction);
        }

        user.setRewardPoints(currentPoints.add(pointsChange));
        userRepository.save(user);
    }

    private BigDecimal calculateExpensePoints(User user, Transaction transaction) {
        LocalDateTime now = LocalDateTime.now();
        
        // Check daily budget
        LocalDateTime startOfDay = now.truncatedTo(ChronoUnit.DAYS);
        LocalDateTime endOfDay = startOfDay.plusDays(1).minusSeconds(1);
        
        BigDecimal dailySpending = transactionRepository.sumByUserAndTypeAndDateBetween(
                user, Transaction.TransactionType.EXPENSE, startOfDay, endOfDay);
        
        if (dailySpending == null) dailySpending = BigDecimal.ZERO;
        
        // Check monthly budget
        LocalDateTime startOfMonth = now.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);
        
        BigDecimal monthlySpending = transactionRepository.sumByUserAndTypeAndDateBetween(
                user, Transaction.TransactionType.EXPENSE, startOfMonth, endOfMonth);
        
        if (monthlySpending == null) monthlySpending = BigDecimal.ZERO;
        
        BigDecimal pointsChange = BigDecimal.ZERO;
        
        // Daily budget check
        if (user.getDailyBudget().compareTo(BigDecimal.ZERO) > 0) {
            if (dailySpending.compareTo(user.getDailyBudget()) <= 0) {
                // Within daily budget - reward 2 points
                pointsChange = pointsChange.add(BigDecimal.valueOf(2));
            } else {
                // Over daily budget - deduct 5 points
                pointsChange = pointsChange.subtract(BigDecimal.valueOf(5));
            }
        }
        
        // Monthly budget check
        if (user.getMonthlyBudget().compareTo(BigDecimal.ZERO) > 0) {
            if (monthlySpending.compareTo(user.getMonthlyBudget()) <= 0) {
                // Within monthly budget - reward 1 point
                pointsChange = pointsChange.add(BigDecimal.valueOf(1));
            } else {
                // Over monthly budget - deduct 10 points
                pointsChange = pointsChange.subtract(BigDecimal.valueOf(10));
            }
        }
        
        return pointsChange;
    }

    public BigDecimal getUserRewardPoints(User user) {
        return user.getRewardPoints();
    }

    public void addBonusPoints(User user, BigDecimal points, String reason) {
        BigDecimal currentPoints = user.getRewardPoints();
        user.setRewardPoints(currentPoints.add(points));
        userRepository.save(user);
    }

    public boolean redeemPoints(User user, BigDecimal points) {
        if (user.getRewardPoints().compareTo(points) >= 0) {
            BigDecimal currentPoints = user.getRewardPoints();
            user.setRewardPoints(currentPoints.subtract(points));
            userRepository.save(user);
            return true;
        }
        return false;
    }
}