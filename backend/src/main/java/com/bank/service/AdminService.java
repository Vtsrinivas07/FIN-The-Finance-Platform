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

    @Transactional(readOnly = true)
    public AdminMetricsResponse getMetrics() {
        long totalCustomers = userRepository.count();
        long activeAccounts = accountRepository.count();

        LocalDateTime startOfToday = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        long transactionsToday = transactionRepository.countByCreatedAtAfter(startOfToday);
        long successfulTx = transactionRepository.countByStatus(Transaction.TransactionStatus.SUCCESS);
        long failedTx = transactionRepository.countByStatus(Transaction.TransactionStatus.FAILED);
        BigDecimal volume = transactionRepository.getTotalTransactionVolume();

        return AdminMetricsResponse.builder()
                .totalCustomers(totalCustomers)
                .activeAccounts(activeAccounts)
                .transactionsToday(transactionsToday)
                .successfulTransactions(successfulTx)
                .failedTransactions(failedTx)
                .totalTransactionVolume(volume != null ? volume : BigDecimal.ZERO)
                .pendingQueries(0)
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
}
