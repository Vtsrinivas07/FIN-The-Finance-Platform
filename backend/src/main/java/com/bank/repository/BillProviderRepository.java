package com.bank.repository;

import com.bank.entity.BillProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BillProviderRepository extends JpaRepository<BillProvider, String> {
    List<BillProvider> findByCategory(String category);
}
