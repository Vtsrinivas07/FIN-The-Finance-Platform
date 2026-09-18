package com.bank.repository;

import com.bank.entity.Account;
import com.bank.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByAccount(Account account);
    Optional<Card> findByIdAndAccount(Long id, Account account);
}
