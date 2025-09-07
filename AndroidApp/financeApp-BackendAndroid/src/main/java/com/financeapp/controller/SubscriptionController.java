package com.financeapp.controller;

import com.financeapp.model.Subscription;
import com.financeapp.model.Transaction;
import com.financeapp.model.User;
import com.financeapp.service.SubscriptionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    @Autowired
    private SubscriptionService subscriptionService;

    @PostMapping
    public ResponseEntity<Subscription> createSubscription(@Valid @RequestBody Subscription subscription, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Subscription createdSubscription = subscriptionService.createSubscription(subscription, user);
        return ResponseEntity.ok(createdSubscription);
    }

    @GetMapping
    public ResponseEntity<List<Subscription>> getUserSubscriptions(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Subscription> subscriptions = subscriptionService.getUserSubscriptions(user);
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<Subscription>> getUpcomingSubscriptions(
            @RequestParam(required = false) String date,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        LocalDate targetDate;
        try {
            targetDate = (date != null && !date.equals("undefined")) ? LocalDate.parse(date) : LocalDate.now().plusDays(30);
        } catch (Exception e) {
            targetDate = LocalDate.now().plusDays(30);
        }
        List<Subscription> subscriptions = subscriptionService.getUpcomingSubscriptions(user, targetDate);
        return ResponseEntity.ok(subscriptions);
    }

    @GetMapping("/upcoming/total")
    public ResponseEntity<Map<String, Object>> getTotalUpcomingAmount(
            @RequestParam(required = false) String date,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        LocalDate targetDate;
        try {
            targetDate = (date != null && !date.equals("undefined")) ? LocalDate.parse(date) : LocalDate.now().plusDays(30);
        } catch (Exception e) {
            targetDate = LocalDate.now().plusDays(30);
        }
        java.math.BigDecimal total = subscriptionService.getTotalUpcomingAmount(user, targetDate);
        
        return ResponseEntity.ok(Map.of("total", total));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Subscription> updateSubscription(@PathVariable Long id, @Valid @RequestBody Subscription subscription, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Subscription updatedSubscription = subscriptionService.updateSubscription(id, subscription, user);
        return ResponseEntity.ok(updatedSubscription);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSubscription(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        subscriptionService.deleteSubscription(id, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/mark-paid")
    public ResponseEntity<Transaction> markAsPaid(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Transaction transaction = subscriptionService.markAsPaid(id, user);
        return ResponseEntity.ok(transaction);
    }
}