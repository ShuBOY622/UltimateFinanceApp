package com.financeapp.controller;

import com.financeapp.model.User;
import com.financeapp.repository.UserRepository;
import com.financeapp.service.PDFExportService;
import com.financeapp.service.RewardService;
import com.financeapp.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RewardService rewardService;

    @Autowired
    private PDFExportService pdfExportService;

    @Autowired
    private TransactionService transactionService;

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(user);
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateUserProfile(@RequestBody User updatedUser, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        user.setMonthlyBudget(updatedUser.getMonthlyBudget());
        user.setDailyBudget(updatedUser.getDailyBudget());
        
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @GetMapping("/rewards")
    public ResponseEntity<Map<String, Object>> getRewardPoints(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Map<String, Object> response = new HashMap<>();
        response.put("rewardPoints", rewardService.getUserRewardPoints(user));
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rewards/redeem")
    public ResponseEntity<Map<String, Object>> redeemPoints(@RequestParam BigDecimal points, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Map<String, Object> response = new HashMap<>();
        
        boolean success = rewardService.redeemPoints(user, points);
        response.put("success", success);
        
        if (success) {
            response.put("message", "Points redeemed successfully!");
            response.put("remainingPoints", rewardService.getUserRewardPoints(user));
        } else {
            response.put("message", "Insufficient points!");
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/export/transactions")
    public ResponseEntity<byte[]> exportTransactions(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Authentication authentication) {
        
        User user = (User) authentication.getPrincipal();
        byte[] pdfBytes = pdfExportService.generateTransactionReport(user, startDate, endDate);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "transactions_report.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @GetMapping("/export/summary")
    public ResponseEntity<byte[]> exportFinancialSummary(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        byte[] pdfBytes = pdfExportService.generateFinancialSummaryReport(user);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "financial_summary.pdf");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @DeleteMapping("/transactions/all")
    public ResponseEntity<Map<String, Object>> deleteAllTransactions(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        try {
            transactionService.deleteAllUserTransactions(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "All transactions deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete transactions: " + e.getMessage());
            
            return ResponseEntity.status(500).body(response);
        }
    }
}