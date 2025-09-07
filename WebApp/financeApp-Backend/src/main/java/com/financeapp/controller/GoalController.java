package com.financeapp.controller;

import com.financeapp.model.Goal;
import com.financeapp.model.User;
import com.financeapp.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/goals")
public class GoalController {

    @Autowired
    private GoalService goalService;

    @PostMapping
    public ResponseEntity<Goal> createGoal(@Valid @RequestBody Goal goal, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Goal createdGoal = goalService.createGoal(goal, user);
        return ResponseEntity.ok(createdGoal);
    }

    @GetMapping
    public ResponseEntity<List<Goal>> getUserGoals(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Goal> goals = goalService.getUserGoals(user);
        return ResponseEntity.ok(goals);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Goal>> getActiveGoals(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Goal> goals = goalService.getActiveGoals(user);
        return ResponseEntity.ok(goals);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Goal> updateGoal(@PathVariable Long id, @Valid @RequestBody Goal goal, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Goal updatedGoal = goalService.updateGoal(id, goal, user);
        return ResponseEntity.ok(updatedGoal);
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<Goal> updateGoalProgress(@PathVariable Long id, @RequestParam BigDecimal amount, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Goal updatedGoal = goalService.updateGoalProgress(id, amount, user);
        return ResponseEntity.ok(updatedGoal);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        goalService.deleteGoal(id, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/analysis")
    public ResponseEntity<Map<String, Object>> getGoalAnalysis(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Map<String, Object> analysis = goalService.getGoalAnalysis(id, user);
        return ResponseEntity.ok(analysis);
    }
}