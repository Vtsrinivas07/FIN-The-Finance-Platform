package com.bank.repository;

import com.bank.entity.Account;
import com.bank.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, UUID> {

    Page<Transaction> findByAccountOrderByCreatedAtDesc(Account account, Pageable pageable);

    List<Transaction> findTop10ByAccountOrderByCreatedAtDesc(Account account);

    @Query("SELECT t FROM Transaction t WHERE t.account = :account " +
           "AND (:type IS NULL OR t.type = :type) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:startDate IS NULL OR t.createdAt >= :startDate) " +
           "AND (:endDate IS NULL OR t.createdAt <= :endDate) " +
           "ORDER BY t.createdAt DESC")
    Page<Transaction> findFilteredTransactions(
            @Param("account") Account account,
            @Param("type") Transaction.TransactionType type,
            @Param("category") Transaction.TransactionCategory category,
            @Param("status") Transaction.TransactionStatus status,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t " +
           "WHERE t.account = :account AND t.type = 'DEBIT' AND t.status = 'SUCCESS' " +
           "AND t.createdAt >= :startDate AND t.createdAt <= :endDate " +
           "GROUP BY t.category")
    List<Object[]> getSpendingByCategory(
            @Param("account") Account account,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.account = :account AND t.type = 'DEBIT' AND t.status = 'SUCCESS' AND t.createdAt >= :startDate")
    BigDecimal getTotalDebitsSince(@Param("account") Account account, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.account = :account AND t.type = 'CREDIT' AND t.status = 'SUCCESS' AND t.createdAt >= :startDate")
    BigDecimal getTotalCreditsSince(@Param("account") Account account, @Param("startDate") LocalDateTime startDate);

    // Admin queries
    long countByCreatedAtAfter(LocalDateTime date);
    long countByStatus(Transaction.TransactionStatus status);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.status = 'SUCCESS'")
    BigDecimal getTotalTransactionVolume();
}
