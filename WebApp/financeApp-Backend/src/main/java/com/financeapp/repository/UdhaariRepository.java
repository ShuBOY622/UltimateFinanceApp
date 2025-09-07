package com.financeapp.repository;

import com.financeapp.model.Udhaari;
import com.financeapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface UdhaariRepository extends JpaRepository<Udhaari, Long> {
    List<Udhaari> findByUserOrderByTransactionDateDesc(User user);

    @Query("SELECT COALESCE(SUM(CASE WHEN u.type = 'LENT' THEN u.amount ELSE -u.amount END), 0) FROM Udhaari u WHERE u.user = :user")
    BigDecimal getNetUdhaariAmount(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(u.amount), 0) FROM Udhaari u WHERE u.user = :user AND u.type = 'BORROWED'")
    BigDecimal getTotalBorrowed(@Param("user") User user);

    @Query("SELECT COALESCE(SUM(u.amount), 0) FROM Udhaari u WHERE u.user = :user AND u.type = 'LENT'")
    BigDecimal getTotalLent(@Param("user") User user);
}