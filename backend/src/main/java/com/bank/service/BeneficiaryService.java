package com.bank.service;

import com.bank.dto.request.BeneficiaryRequest;
import com.bank.dto.response.BeneficiaryResponse;
import com.bank.entity.Account;
import com.bank.entity.Beneficiary;
import com.bank.entity.User;
import com.bank.exception.BadRequestException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.AccountRepository;
import com.bank.repository.BeneficiaryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BeneficiaryService {

    private final BeneficiaryRepository beneficiaryRepository;
    private final AccountRepository accountRepository;
    private final AccountService accountService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> getBeneficiaries(User user) {
        return beneficiaryRepository.findByUserAndStatus(user, Beneficiary.BeneficiaryStatus.ACTIVE).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public BeneficiaryResponse addBeneficiary(User user, BeneficiaryRequest request) {
        Account userAccount = accountService.getPrimaryAccount(user);

        if (userAccount.getAccountNumber().equals(request.getBeneficiaryAccountNumber())) {
            throw new BadRequestException("You cannot add your own account as a beneficiary");
        }

        if (beneficiaryRepository.existsByUserAndBeneficiaryAccountNumber(user, request.getBeneficiaryAccountNumber())) {
            throw new BadRequestException("Beneficiary with this account number is already registered");
        }

        // Verify account exists in banking system if it's an internal account
        boolean isInternal = accountRepository.existsByAccountNumber(request.getBeneficiaryAccountNumber());

        Beneficiary beneficiary = Beneficiary.builder()
                .user(user)
                .beneficiaryAccountNumber(request.getBeneficiaryAccountNumber())
                .beneficiaryName(request.getBeneficiaryName())
                .bankName(request.getBankName())
                .ifscCode(request.getIfscCode())
                .status(Beneficiary.BeneficiaryStatus.ACTIVE)
                .build();

        beneficiary = beneficiaryRepository.save(beneficiary);

        auditService.log(user, "BENEFICIARY_ADDED", "Beneficiary", beneficiary.getId().toString(), "SUCCESS", null, "Added beneficiary: " + request.getBeneficiaryName());

        return mapToResponse(beneficiary);
    }

    @Transactional
    public void deleteBeneficiary(User user, Long beneficiaryId) {
        Beneficiary beneficiary = beneficiaryRepository.findById(beneficiaryId)
                .orElseThrow(() -> new ResourceNotFoundException("Beneficiary not found"));

        if (!beneficiary.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to beneficiary");
        }

        beneficiary.setStatus(Beneficiary.BeneficiaryStatus.INACTIVE);
        beneficiaryRepository.save(beneficiary);

        auditService.log(user, "BENEFICIARY_DELETED", "Beneficiary", beneficiaryId.toString(), "SUCCESS", null, "Deleted beneficiary: " + beneficiary.getBeneficiaryName());
    }

    @Transactional(readOnly = true)
    public List<BeneficiaryResponse> searchBeneficiaries(User user, String query) {
        return beneficiaryRepository.findByUserAndBeneficiaryNameContainingIgnoreCase(user, query).stream()
                .filter(b -> b.getStatus() == Beneficiary.BeneficiaryStatus.ACTIVE)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private BeneficiaryResponse mapToResponse(Beneficiary b) {
        return BeneficiaryResponse.builder()
                .id(b.getId())
                .beneficiaryAccountNumber(b.getBeneficiaryAccountNumber())
                .maskedAccountNumber(accountService.maskAccountNumber(b.getBeneficiaryAccountNumber()))
                .beneficiaryName(b.getBeneficiaryName())
                .bankName(b.getBankName())
                .ifscCode(b.getIfscCode())
                .status(b.getStatus().name())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
