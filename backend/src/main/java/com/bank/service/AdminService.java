package com.bank.service;

import com.bank.dto.response.*;
import com.bank.entity.Account;
import com.bank.entity.AuditLog;
import com.bank.entity.Transaction;
import com.bank.entity.User;
import com.bank.repository.AccountRepository;
import com.bank.repository.AuditLogRepository;
import com.bank.repository.TransactionRepository;
import com.bank.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.bank.dto.request.CustomerInquiryRequest;
import com.bank.dto.request.TransactionInquiryRequest;
import com.bank.exception.ResourceNotFoundException;
import org.springframework.data.domain.PageRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AuditLogRepository auditLogRepository;
    private final AccountService accountService;
    private final AuditService auditService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public AdminMetricsResponse getMetrics() {
        long totalCustomers = userRepository.count();
        long activeAccounts = accountRepository.count();

        LocalDateTime startOfToday = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long transactionsToday = transactionRepository.countByCreatedAtAfter(startOfToday);
        long successfulTx = transactionRepository.countByStatus(Transaction.TransactionStatus.SUCCESS);
        long failedTx = transactionRepository.countByStatus(Transaction.TransactionStatus.FAILED);
        BigDecimal volume = transactionRepository.getTotalTransactionVolume();
        long pendingKyc = userRepository.countByKycStatus(User.KycStatus.SUBMITTED);

        return AdminMetricsResponse.builder()
                .totalCustomers(totalCustomers)
                .activeAccounts(activeAccounts)
                .transactionsToday(transactionsToday)
                .successfulTransactions(successfulTx)
                .failedTransactions(failedTx)
                .totalTransactionVolume(volume != null ? volume : BigDecimal.ZERO)
                .pendingQueries(0)
                .pendingKycCount(pendingKyc)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<UserProfileResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(user -> UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .mobileNumber(user.getMobileNumber())
                .address(user.getAddress())
                .role(user.getRole().getName().name())
                .status(user.getStatus().name())
                .createdAt(user.getCreatedAt())
                .build());
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getAllTransactions(Pageable pageable) {
        return transactionRepository.findAll(pageable).map(tx -> TransactionResponse.builder()
                .id(tx.getId())
                .referenceNumber(tx.getReferenceNumber())
                .accountNumber(accountService.maskAccountNumber(tx.getAccount().getAccountNumber()))
                .amount(tx.getAmount())
                .type(tx.getType().name())
                .category(tx.getCategory().name())
                .status(tx.getStatus().name())
                .description(tx.getDescription())
                .recipientInfo(tx.getRecipientInfo())
                .createdAt(tx.getCreatedAt())
                .build());
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable).map(log -> AuditLogResponse.builder()
                .id(log.getId())
                .username(log.getUser() != null ? log.getUser().getUsername() : "SYSTEM")
                .action(log.getAction())
                .entityName(log.getEntityName())
                .entityId(log.getEntityId())
                .status(log.getStatus())
                .ipAddress(log.getIpAddress())
                .details(log.getDetails())
                .createdAt(log.getCreatedAt())
                .build());
    }

    @Transactional
    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        if (user.getStatus() == User.UserStatus.ACTIVE) {
            user.setStatus(User.UserStatus.SUSPENDED);
        } else {
            user.setStatus(User.UserStatus.ACTIVE);
        }
        userRepository.save(user);
    }

    @Transactional
    public CustomerInquiryResponse performCustomerInquiry(CustomerInquiryRequest request, User adminUser, String ipAddress) {
        String authType = request.getAuthType().trim().toUpperCase();
        String identifier = request.getIdentifier().trim();
        String reason = request.getReason().trim();

        User matchedUser = null;

        if ("ACCOUNT_NUMBER".equals(authType)) {
            String cleanAcc = identifier.replaceAll("[\\s-]", "");
            matchedUser = accountRepository.findByAccountNumber(cleanAcc)
                    .map(Account::getUser)
                    .orElse(null);
        } else if ("CIF_USERNAME".equals(authType)) {
            String cleanUsername = identifier.replaceFirst("(?i)^CIF-FINB-", "").replaceFirst("(?i)^CIF-", "");
            matchedUser = userRepository.findByUsername(cleanUsername)
                    .or(() -> userRepository.findByUsername(identifier))
                    .orElse(null);
        } else if ("MOBILE".equals(authType)) {
            String cleanMobile = identifier.replaceAll("[^0-9]", "");
            if (cleanMobile.length() > 10) {
                cleanMobile = cleanMobile.substring(cleanMobile.length() - 10);
            }
            matchedUser = userRepository.findByMobileNumber(cleanMobile)
                    .or(() -> userRepository.findByMobileNumber(identifier))
                    .orElse(null);
        } else if ("EMAIL".equals(authType)) {
            matchedUser = userRepository.findByEmail(identifier.toLowerCase()).orElse(null);
        } else {
            matchedUser = userRepository.findByUsername(identifier)
                    .or(() -> userRepository.findByEmail(identifier.toLowerCase()))
                    .orElse(null);
        }

        if (matchedUser == null) {
            auditService.log(adminUser, "CUSTOMER_INQUIRY_NOT_FOUND", "User", identifier, "FAILED", ipAddress,
                    "Lookup failed for " + authType + " [" + identifier + "]. Reason: " + reason);
            throw new ResourceNotFoundException("No customer account found matching " + authType + ": " + identifier);
        }

        List<Account> accounts = accountRepository.findByUser(matchedUser);
        List<AccountResponse> accountResponses = accounts.stream()
                .map(accountService::mapToResponse)
                .collect(Collectors.toList());

        List<TransactionResponse> transactionResponses = accounts.stream()
                .flatMap(acc -> transactionRepository.findByAccountOrderByCreatedAtDesc(acc, PageRequest.of(0, 25)).getContent().stream())
                .map(tx -> TransactionResponse.builder()
                        .id(tx.getId())
                        .referenceNumber(tx.getReferenceNumber())
                        .accountNumber(accountService.maskAccountNumber(tx.getAccount().getAccountNumber()))
                        .amount(tx.getAmount())
                        .type(tx.getType().name())
                        .category(tx.getCategory().name())
                        .status(tx.getStatus().name())
                        .description(tx.getDescription())
                        .recipientInfo(tx.getRecipientInfo())
                        .createdAt(tx.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        String maskedId = identifier.length() > 4 ? "••••" + identifier.substring(identifier.length() - 4) : "••••";
        auditService.log(adminUser, "CUSTOMER_INQUIRY_SUCCESS", "User", matchedUser.getUsername(), "SUCCESS", ipAddress,
                "Authorized CIF lookup via " + authType + " [" + maskedId + "]. Justification: " + reason);

        return CustomerInquiryResponse.builder()
                .user(UserProfileResponse.builder()
                        .id(matchedUser.getId())
                        .username(matchedUser.getUsername())
                        .fullName(matchedUser.getFullName())
                        .email(matchedUser.getEmail())
                        .mobileNumber(matchedUser.getMobileNumber())
                        .address(matchedUser.getAddress())
                        .role(matchedUser.getRole().getName().name())
                        .status(matchedUser.getStatus().name())
                        .createdAt(matchedUser.getCreatedAt())
                        .build())
                .accounts(accountResponses)
                .transactions(transactionResponses)
                .authType(authType)
                .queriedIdentifier(identifier)
                .reason(reason)
                .cifNumber("CIF-FINB-1000" + matchedUser.getId())
                .kycStatus("VERIFIED_TIER_3")
                .inquiryTimestamp(LocalDateTime.now())
                .build();
    }

    @Transactional
    public List<TransactionResponse> performTransactionInquiry(TransactionInquiryRequest request, User adminUser, String ipAddress) {
        String searchType = request.getSearchType().trim().toUpperCase();
        String identifier = request.getIdentifier().trim();
        String reason = request.getReason().trim();

        List<Transaction> transactions = new ArrayList<>();

        if ("REFERENCE_NUMBER".equals(searchType)) {
            transactionRepository.findByReferenceNumber(identifier).ifPresent(transactions::add);
        } else if ("ACCOUNT_NUMBER".equals(searchType)) {
            String cleanAcc = identifier.replaceAll("[\\s-]", "");
            accountRepository.findByAccountNumber(cleanAcc).ifPresent(acc -> {
                transactions.addAll(transactionRepository.findByAccountOrderByCreatedAtDesc(acc, PageRequest.of(0, 25)).getContent());
            });
        } else if ("CIF_USERNAME".equals(searchType)) {
            userRepository.findByUsername(identifier).ifPresent(user -> {
                List<Account> accounts = accountRepository.findByUser(user);
                for (Account acc : accounts) {
                    transactions.addAll(transactionRepository.findByAccountOrderByCreatedAtDesc(acc, PageRequest.of(0, 25)).getContent());
                }
            });
        }

        auditService.log(adminUser, "TRANSACTION_INQUIRY", "Transaction", identifier, "SUCCESS", ipAddress,
                "Inquiry via " + searchType + " [" + identifier + "]. Justification: " + reason + " (Matched: " + transactions.size() + ")");

        return transactions.stream().map(tx -> TransactionResponse.builder()
                .id(tx.getId())
                .referenceNumber(tx.getReferenceNumber())
                .accountNumber(accountService.maskAccountNumber(tx.getAccount().getAccountNumber()))
                .amount(tx.getAmount())
                .type(tx.getType().name())
                .category(tx.getCategory().name())
                .status(tx.getStatus().name())
                .description(tx.getDescription())
                .recipientInfo(tx.getRecipientInfo())
                .createdAt(tx.getCreatedAt())
                .build()).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getPendingKycRequests() {
        return userRepository.findByKycStatus(User.KycStatus.SUBMITTED).stream()
                .map(user -> UserProfileResponse.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .mobileNumber(user.getMobileNumber())
                        .address(user.getAddress())
                        .role(user.getRole().getName().name())
                        .status(user.getStatus().name())
                        .kycStatus(user.getKycStatus().name())
                        .panNumber(user.getPanNumber())
                        .aadhaarNumber(user.getAadhaarNumber())
                        .dateOfBirth(user.getDateOfBirth())
                        .vkycReference(user.getVkycReference())
                        .createdAt(user.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveKyc(Long userId, User adminUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getKycStatus() != User.KycStatus.SUBMITTED) {
            throw new com.bank.exception.BadRequestException("User KYC is not in SUBMITTED state");
        }

        user.setKycStatus(User.KycStatus.VERIFIED_TIER_3);
        user.setKycRejectReason(null);
        userRepository.save(user);

        notificationService.createNotification(
                user,
                "KYC Approved - Full KYC (Tier 3)",
                "Your KYC verification has been approved by a bank officer. Your account is now Full KYC Verified (Tier 3) with unlimited transaction limits under RBI guidelines.",
                com.bank.entity.Notification.NotificationType.SECURITY_ALERT
        );

        auditService.log(adminUser, "KYC_APPROVED", "User", user.getId().toString(), "SUCCESS", null,
                "Admin approved Full KYC Tier-3 for user: " + user.getUsername());
    }

    @Transactional
    public void rejectKyc(Long userId, String reason, User adminUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getKycStatus() != User.KycStatus.SUBMITTED) {
            throw new com.bank.exception.BadRequestException("User KYC is not in SUBMITTED state");
        }

        user.setKycStatus(User.KycStatus.REJECTED);
        user.setKycRejectReason(reason);
        userRepository.save(user);

        notificationService.createNotification(
                user,
                "KYC Verification Rejected",
                "Your KYC verification was rejected. Reason: " + reason + ". Please re-submit your documents.",
                com.bank.entity.Notification.NotificationType.SECURITY_ALERT
        );

        auditService.log(adminUser, "KYC_REJECTED", "User", user.getId().toString(), "SUCCESS", null,
                "Admin rejected KYC for user: " + user.getUsername() + ". Reason: " + reason);
    }
}
