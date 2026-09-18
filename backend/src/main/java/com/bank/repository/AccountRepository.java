package com.bank.repository;

import com.bank.entity.Account;
import com.bank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser(User user);
    Optional<Account> findByAccountNumber(String accountNumber);
    Optional<Account> findByUserAndStatus(User user, Account.AccountStatus status);
    boolean existsByAccountNumber(String accountNumber);
}
