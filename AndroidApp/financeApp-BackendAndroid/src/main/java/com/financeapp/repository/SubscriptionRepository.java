package com.financeapp.repository;

import com.financeapp.model.Subscription;
import com.financeapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {
    List<Subscription> findByUser(User user);
    
    List<Subscription> findByUserAndNextPaymentDateLessThanEqual(User user, LocalDate date);
    
    List<Subscription> findByUserAndNextPaymentDateBetween(User user, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT s FROM Subscription s WHERE s.user = :user AND s.nextPaymentDate <= :date AND (s.endDate IS NULL OR s.endDate >= :date)")
    List<Subscription> findActiveSubscriptionsByUserAndDate(@Param("user") User user, @Param("date") LocalDate date);
}