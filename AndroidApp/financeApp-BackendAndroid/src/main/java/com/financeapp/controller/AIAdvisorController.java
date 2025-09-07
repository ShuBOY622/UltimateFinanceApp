package com.financeapp.controller;

import com.financeapp.model.User;
import com.financeapp.service.AIAdvisorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/advisor")
public class AIAdvisorController {

    @Autowired
    private AIAdvisorService aiAdvisorService;

    @GetMapping("/advice")
    public ResponseEntity<Map<String, Object>> getPersonalizedAdvice(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Map<String, Object> advice = aiAdvisorService.getPersonalizedAdvice(user);
        return ResponseEntity.ok(advice);
    }

    @GetMapping("/goal/{goalId}/advice")
    public ResponseEntity<Map<String, Object>> getGoalAdvice(@PathVariable Long goalId, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Map<String, Object> advice = aiAdvisorService.getGoalAdvice(goalId, user);
        return ResponseEntity.ok(advice);
    }
}