package com.financeapp.service;

import com.financeapp.model.Transaction;
import com.financeapp.model.User;
import com.financeapp.repository.TransactionRepository;
import com.financeapp.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RewardService rewardService;

    @Autowired
    private InvestmentService investmentService;

    public Transaction createTransaction(Transaction transaction, User user) {
        transaction.setUser(user);
        Transaction savedTransaction = transactionRepository.save(transaction);
        
        // Update reward points based on transaction
        rewardService.updateRewardPoints(user, transaction);
        
        return savedTransaction;
    }

    public List<Transaction> getUserTransactions(User user) {
        return transactionRepository.findByUserOrderByTransactionDateDesc(user);
    }

    public List<Transaction> getMonthlyTransactions(User user, int monthOffset) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.minusMonths(monthOffset).withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);
        
        return transactionRepository.findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(
                user, startOfMonth, endOfMonth);
    }

    public List<Transaction> getTransactionsByMonth(User user, int year, int month) {
        LocalDateTime startOfMonth = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);
        
        return transactionRepository.findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(
                user, startOfMonth, endOfMonth);
    }

    public Map<String, Object> getMonthlyFinancialSummary(User user, int monthOffset) {
        Map<String, Object> summary = new HashMap<>();
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.minusMonths(monthOffset).withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);
        
        // Monthly income and expenses for specified month
        BigDecimal monthlyIncome = transactionRepository.sumByUserAndTypeAndDateBetween(
                user, Transaction.TransactionType.INCOME, startOfMonth, endOfMonth);
        BigDecimal monthlyExpenses = transactionRepository.sumByUserAndTypeAndDateBetween(
                user, Transaction.TransactionType.EXPENSE, startOfMonth, endOfMonth);
        
        if (monthlyIncome == null) monthlyIncome = BigDecimal.ZERO;
        if (monthlyExpenses == null) monthlyExpenses = BigDecimal.ZERO;
        
        summary.put("monthlyIncome", monthlyIncome);
        summary.put("monthlyExpenses", monthlyExpenses);
        summary.put("monthlyBalance", monthlyIncome.subtract(monthlyExpenses));
        summary.put("year", startOfMonth.getYear());
        summary.put("month", startOfMonth.getMonthValue());
        summary.put("monthName", startOfMonth.getMonth().name());
        
        // Category breakdown for the month
        List<Transaction> monthlyTransactions = getMonthlyTransactions(user, monthOffset);
        Map<String, BigDecimal> incomeByCategory = new HashMap<>();
        Map<String, BigDecimal> expensesByCategory = new HashMap<>();
        
        for (Transaction transaction : monthlyTransactions) {
            if (transaction.getType() == Transaction.TransactionType.INCOME) {
                incomeByCategory.merge(transaction.getCategory().name(), transaction.getAmount(), BigDecimal::add);
            } else {
                expensesByCategory.merge(transaction.getCategory().name(), transaction.getAmount(), BigDecimal::add);
            }
        }
        
        summary.put("incomeByCategory", incomeByCategory);
        summary.put("expensesByCategory", expensesByCategory);
        summary.put("transactionCount", monthlyTransactions.size());
        
        return summary;
    }

    public List<Transaction> getUserTransactionsByDateRange(User user, LocalDateTime startDate, LocalDateTime endDate) {
        return transactionRepository.findByUserAndTransactionDateBetweenOrderByTransactionDateDesc(user, startDate, endDate);
    }

    public Transaction updateTransaction(Long transactionId, Transaction updatedTransaction, User user) {
        Transaction existingTransaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!existingTransaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this transaction");
        }

        existingTransaction.setAmount(updatedTransaction.getAmount());
        existingTransaction.setDescription(updatedTransaction.getDescription());
        existingTransaction.setType(updatedTransaction.getType());
        existingTransaction.setCategory(updatedTransaction.getCategory());
        existingTransaction.setTransactionDate(updatedTransaction.getTransactionDate());

        return transactionRepository.save(existingTransaction);
    }

    public void deleteTransaction(Long transactionId, User user) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to delete this transaction");
        }

        transactionRepository.delete(transaction);
    }

    public Map<String, Object> getFinancialSummary(User user) {
        Map<String, Object> summary = new HashMap<>();
        
        // Total income and expenses from transactions
        BigDecimal totalIncome = transactionRepository.sumByUserAndType(user, Transaction.TransactionType.INCOME);
        BigDecimal totalExpenses = transactionRepository.sumByUserAndType(user, Transaction.TransactionType.EXPENSE);
        
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;
        if (totalExpenses == null) totalExpenses = BigDecimal.ZERO;
        
        // Get investment portfolio summary
        Map<String, Object> portfolioSummary = investmentService.getPortfolioSummary(user);
        BigDecimal investmentValue = BigDecimal.ZERO;
        BigDecimal investmentCost = BigDecimal.ZERO;
        
        if (portfolioSummary != null && !portfolioSummary.containsKey("error")) {
            Object currentValueObj = portfolioSummary.get("currentValue");
            Object totalInvestmentObj = portfolioSummary.get("totalInvestment");
            
            if (currentValueObj != null) {
                investmentValue = new BigDecimal(currentValueObj.toString());
            }
            if (totalInvestmentObj != null) {
                investmentCost = new BigDecimal(totalInvestmentObj.toString());
            }
        }
        
        // Calculate proper net worth according to finance rules
        // Net Worth = (Cash from transactions) + (Current Investment Value) - Liabilities
        // Cash Balance = Total Income - Total Expenses
        BigDecimal cashBalance = totalIncome.subtract(totalExpenses);
        BigDecimal netWorth = cashBalance.add(investmentValue);
        
        summary.put("totalIncome", totalIncome);
        summary.put("totalExpenses", totalExpenses);
        summary.put("cashBalance", cashBalance);  // Separate cash balance
        summary.put("investmentValue", investmentValue);  // Current investment value
        summary.put("investmentCost", investmentCost);    // Original investment cost
        summary.put("netWorth", netWorth);  // True net worth including investments
        summary.put("netBalance", netWorth);  // Keep for backward compatibility
        
        // Monthly summary
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
        LocalDateTime endOfMonth = startOfMonth.plusMonths(1).minusSeconds(1);
        
        BigDecimal monthlyIncome = transactionRepository.sumByUserAndTypeAndDateBetween(
                user, Transaction.TransactionType.INCOME, startOfMonth, endOfMonth);
        BigDecimal monthlyExpenses = transactionRepository.sumByUserAndTypeAndDateBetween(
                user, Transaction.TransactionType.EXPENSE, startOfMonth, endOfMonth);
        
        if (monthlyIncome == null) monthlyIncome = BigDecimal.ZERO;
        if (monthlyExpenses == null) monthlyExpenses = BigDecimal.ZERO;
        
        summary.put("monthlyIncome", monthlyIncome);
        summary.put("monthlyExpenses", monthlyExpenses);
        summary.put("monthlyBalance", monthlyIncome.subtract(monthlyExpenses));
        
        // Calculate savings rate (monthly)
        BigDecimal monthlySavings = monthlyIncome.subtract(monthlyExpenses);
        BigDecimal savingsRate = BigDecimal.ZERO;
        if (monthlyIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = monthlySavings.divide(monthlyIncome, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
        }
        summary.put("savingsRate", savingsRate);
        
        // Category breakdown
        List<Object[]> incomeByCategory = transactionRepository.sumByUserAndTypeGroupByCategory(
                user, Transaction.TransactionType.INCOME);
        List<Object[]> expensesByCategory = transactionRepository.sumByUserAndTypeGroupByCategory(
                user, Transaction.TransactionType.EXPENSE);
        
        summary.put("incomeByCategory", incomeByCategory);
        summary.put("expensesByCategory", expensesByCategory);
        
        return summary;
    }

    public Map<String, Object> getSpendingAnalysis(User user, LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> analysis = new HashMap<>();
        
        List<Object[]> categorySpending = transactionRepository.sumByUserAndTypeAndDateBetweenGroupByCategory(
                user, Transaction.TransactionType.EXPENSE, startDate, endDate);
        
        BigDecimal totalSpending = transactionRepository.sumByUserAndTypeAndDateBetween(
                user, Transaction.TransactionType.EXPENSE, startDate, endDate);
        
        if (totalSpending == null) totalSpending = BigDecimal.ZERO;
        
        analysis.put("categorySpending", categorySpending);
        analysis.put("totalSpending", totalSpending);
        analysis.put("period", Map.of("start", startDate, "end", endDate));
        
        return analysis;
    }
}