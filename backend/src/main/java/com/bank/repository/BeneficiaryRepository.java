package com.bank.repository;

import com.bank.entity.Beneficiary;
import com.bank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BeneficiaryRepository extends JpaRepository<Beneficiary, Long> {
    List<Beneficiary> findByUser(User user);
    List<Beneficiary> findByUserAndStatus(User user, Beneficiary.BeneficiaryStatus status);
    Optional<Beneficiary> findByUserAndBeneficiaryAccountNumber(User user, String beneficiaryAccountNumber);
    boolean existsByUserAndBeneficiaryAccountNumber(User user, String beneficiaryAccountNumber);
    List<Beneficiary> findByUserAndBeneficiaryNameContainingIgnoreCase(User user, String nameQuery);
}
