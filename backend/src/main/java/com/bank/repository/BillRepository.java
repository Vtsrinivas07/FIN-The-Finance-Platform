package com.bank.repository;

import com.bank.entity.Bill;
import com.bank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {
    List<Bill> findByUser(User user);
    List<Bill> findByUserAndStatus(User user, Bill.BillStatus status);
}
