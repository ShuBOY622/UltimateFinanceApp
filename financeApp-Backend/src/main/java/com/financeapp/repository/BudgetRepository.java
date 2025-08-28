package com.financeapp.repository;

import com.financeapp.model.Budget;
import com.financeapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Long> {
    Optional<Budget> findByUser(User user);
    Optional<Budget> findByUserId(Long userId);
    boolean existsByUser(User user);
    void deleteByUser(User user);
}