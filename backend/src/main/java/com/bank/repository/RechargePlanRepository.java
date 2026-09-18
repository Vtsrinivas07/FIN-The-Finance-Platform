package com.bank.repository;

import com.bank.entity.BillProvider;
import com.bank.entity.RechargePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RechargePlanRepository extends JpaRepository<RechargePlan, String> {
    List<RechargePlan> findByProvider(BillProvider provider);
    List<RechargePlan> findByPlanType(String planType);
}
