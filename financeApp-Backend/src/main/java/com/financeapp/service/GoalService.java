package com.financeapp.service;

import com.financeapp.model.Goal;
import com.financeapp.model.User;
import com.financeapp.repository.GoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class GoalService {

    @Autowired
    private GoalRepository goalRepository;

    @Autowired
    private RewardService rewardService;

    public Goal createGoal(Goal goal, User user) {
        goal.setUser(user);
        return goalRepository.save(goal);
    }

    public List<Goal> getUserGoals(User user) {
        return goalRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Goal updateGoal(Long goalId, Goal updatedGoal, User user) {
        Goal existingGoal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!existingGoal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this goal");
        }

        existingGoal.setName(updatedGoal.getName());
        existingGoal.setDescription(updatedGoal.getDescription());
        existingGoal.setTargetAmount(updatedGoal.getTargetAmount());
        existingGoal.setTargetDate(updatedGoal.getTargetDate());
        existingGoal.setStatus(updatedGoal.getStatus());

        return goalRepository.save(existingGoal);
    }

    public Goal updateGoalProgress(Long goalId, BigDecimal amount, User user) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this goal");
        }

        BigDecimal oldAmount = goal.getCurrentAmount();
        goal.setCurrentAmount(goal.getCurrentAmount().add(amount));

        // Check if goal is completed
        if (goal.getCurrentAmount().compareTo(goal.getTargetAmount()) >= 0) {
            goal.setStatus(Goal.GoalStatus.COMPLETED);
            // Award bonus points for completing goal
            rewardService.addBonusPoints(user, BigDecimal.valueOf(50), "Goal completed: " + goal.getName());
        }

        return goalRepository.save(goal);
    }

    public void deleteGoal(Long goalId, User user) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this goal");
        }

        goalRepository.delete(goal);
    }

    public Map<String, Object> getGoalAnalysis(Long goalId, User user) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new RuntimeException("Goal not found"));

        if (!goal.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to access this goal");
        }

        Map<String, Object> analysis = new HashMap<>();
        
        BigDecimal remainingAmount = goal.getRemainingAmount();
        long daysRemaining = ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate());
        
        analysis.put("goal", goal);
        analysis.put("remainingAmount", remainingAmount);
        analysis.put("daysRemaining", daysRemaining);
        analysis.put("progressPercentage", goal.getProgressPercentage());
        
        if (daysRemaining > 0 && remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal dailySavingsNeeded = remainingAmount.divide(
                BigDecimal.valueOf(daysRemaining), 2, RoundingMode.HALF_UP);
            analysis.put("dailySavingsNeeded", dailySavingsNeeded);
            
            BigDecimal monthlySavingsNeeded = remainingAmount.divide(
                BigDecimal.valueOf(daysRemaining / 30.0), 2, RoundingMode.HALF_UP);
            analysis.put("monthlySavingsNeeded", monthlySavingsNeeded);
        }
        
        return analysis;
    }

    public List<Goal> getActiveGoals(User user) {
        return goalRepository.findByUserAndStatus(user, Goal.GoalStatus.ACTIVE);
    }
}