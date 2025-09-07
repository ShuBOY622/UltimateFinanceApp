package com.financeapp.controller;

import com.financeapp.model.Transaction;
import com.financeapp.model.User;
import com.financeapp.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public ResponseEntity<Transaction> createTransaction(@Valid @RequestBody Transaction transaction, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Transaction createdTransaction = transactionService.createTransaction(transaction, user);
        return ResponseEntity.ok(createdTransaction);
    }

    @GetMapping
    public ResponseEntity<List<Transaction>> getUserTransactions(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Transaction> transactions = transactionService.getUserTransactions(user);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<Transaction>> getMonthlyTransactions(
            @RequestParam(defaultValue = "0") int monthOffset,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Transaction> transactions = transactionService.getMonthlyTransactions(user, monthOffset);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/monthly/{year}/{month}")
    public ResponseEntity<List<Transaction>> getTransactionsByMonth(
            @PathVariable int year,
            @PathVariable int month,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Transaction> transactions = transactionService.getTransactionsByMonth(user, year, month);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/monthly/summary")
    public ResponseEntity<Map<String, Object>> getMonthlyFinancialSummary(
            @RequestParam(defaultValue = "0") int monthOffset,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Map<String, Object> summary = transactionService.getMonthlyFinancialSummary(user, monthOffset);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Transaction>> getUserTransactionsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        List<Transaction> transactions = transactionService.getUserTransactionsByDateRange(user, startDate, endDate);
        return ResponseEntity.ok(transactions);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> updateTransaction(@PathVariable Long id, @Valid @RequestBody Transaction transaction, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Transaction updatedTransaction = transactionService.updateTransaction(id, transaction, user);
        return ResponseEntity.ok(updatedTransaction);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        transactionService.deleteTransaction(id, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getFinancialSummary(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Map<String, Object> summary = transactionService.getFinancialSummary(user);
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/analysis")
    public ResponseEntity<Map<String, Object>> getSpendingAnalysis(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        Map<String, Object> analysis = transactionService.getSpendingAnalysis(user, startDate, endDate);
        return ResponseEntity.ok(analysis);
    }
}