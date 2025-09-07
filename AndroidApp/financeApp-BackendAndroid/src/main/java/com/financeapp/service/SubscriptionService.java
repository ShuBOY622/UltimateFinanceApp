package com.financeapp.service;

import com.financeapp.model.Subscription;
import com.financeapp.model.Transaction;
import com.financeapp.model.User;
import com.financeapp.repository.SubscriptionRepository;
import com.financeapp.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public List<Subscription> getUserSubscriptions(User user) {
        return subscriptionRepository.findByUser(user);
    }

    public Subscription createSubscription(Subscription subscription, User user) {
        subscription.setUser(user);
        return subscriptionRepository.save(subscription);
    }

    public Subscription updateSubscription(Long id, Subscription subscriptionDetails, User user) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found with id: " + id));

        if (!subscription.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to subscription");
        }

        subscription.setName(subscriptionDetails.getName());
        subscription.setAmount(subscriptionDetails.getAmount());
        subscription.setFrequency(subscriptionDetails.getFrequency());
        subscription.setCategory(subscriptionDetails.getCategory());
        subscription.setStartDate(subscriptionDetails.getStartDate());
        subscription.setEndDate(subscriptionDetails.getEndDate());
        subscription.setNextPaymentDate(subscriptionDetails.getNextPaymentDate());
        subscription.setDescription(subscriptionDetails.getDescription());

        return subscriptionRepository.save(subscription);
    }

    public void deleteSubscription(Long id, User user) {
        Subscription subscription = subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found with id: " + id));

        if (!subscription.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to subscription");
        }

        subscriptionRepository.delete(subscription);
    }

    public Optional<Subscription> getSubscriptionById(Long id, User user) {
        Optional<Subscription> subscription = subscriptionRepository.findById(id);
        if (subscription.isPresent() && subscription.get().getUser().getId().equals(user.getId())) {
            return subscription;
        }
        return Optional.empty();
    }

    public List<Subscription> getUpcomingSubscriptions(User user, LocalDate date) {
        return subscriptionRepository.findActiveSubscriptionsByUserAndDate(user, date);
    }

    public Transaction markAsPaid(Long subscriptionId, User user) {
        Subscription subscription = subscriptionRepository.findById(subscriptionId)
                .orElseThrow(() -> new RuntimeException("Subscription not found with id: " + subscriptionId));

        if (!subscription.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to subscription");
        }

        // Create a transaction for this subscription payment
        Transaction transaction = new Transaction();
        transaction.setAmount(subscription.getAmount());
        transaction.setDescription(subscription.getName());
        transaction.setType(Transaction.TransactionType.EXPENSE);
        transaction.setCategory(subscription.getCategory());
        transaction.setTransactionDate(java.time.LocalDateTime.now());
        transaction.setUser(user);

        Transaction savedTransaction = transactionRepository.save(transaction);

        // Update the next payment date based on frequency
        LocalDate nextPaymentDate = calculateNextPaymentDate(subscription.getNextPaymentDate(), subscription.getFrequency());
        subscription.setNextPaymentDate(nextPaymentDate);
        subscriptionRepository.save(subscription);

        return savedTransaction;
    }

    private LocalDate calculateNextPaymentDate(LocalDate currentDate, Subscription.SubscriptionFrequency frequency) {
        switch (frequency) {
            case DAILY:
                return currentDate.plusDays(1);
            case WEEKLY:
                return currentDate.plusWeeks(1);
            case BIWEEKLY:
                return currentDate.plusWeeks(2);
            case MONTHLY:
                return currentDate.plusMonths(1);
            case QUARTERLY:
                return currentDate.plusMonths(3);
            case YEARLY:
                return currentDate.plusYears(1);
            default:
                return currentDate.plusMonths(1); // Default to monthly
        }
    }

    public BigDecimal getTotalUpcomingAmount(User user, LocalDate date) {
        List<Subscription> upcomingSubscriptions = getUpcomingSubscriptions(user, date);
        return upcomingSubscriptions.stream()
                .map(Subscription::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}