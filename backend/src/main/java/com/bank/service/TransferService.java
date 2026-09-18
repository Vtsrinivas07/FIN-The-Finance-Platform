package com.bank.service;

import com.bank.dto.request.TransferRequest;
import com.bank.dto.response.TransactionResponse;
import com.bank.entity.Account;
import com.bank.entity.Transaction;
import com.bank.entity.User;
import com.bank.entity.Notification.NotificationType;
import com.bank.exception.BadRequestException;
import com.bank.exception.InsufficientBalanceException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.AccountRepository;
import com.bank.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;
    private final AccountService accountService;

    @Transactional
    public TransactionResponse transferFunds(User senderUser, TransferRequest request) {
        Account senderAccount = accountService.getPrimaryAccount(senderUser);

        if (senderAccount.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new BadRequestException("Your account is not active");
        }

        if (senderAccount.getAccountNumber().equals(request.getRecipientAccountNumber())) {
            throw new BadRequestException("Cannot transfer funds to your own account");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Transfer amount must be greater than zero");
        }

        if (senderAccount.getBalance().compareTo(request.getAmount()) < 0) {
            auditService.log(senderUser, "TRANSFER_FAILED", "Transfer", null, "FAILED", null, "Insufficient balance for transfer of ₹" + request.getAmount());
            notificationService.createNotification(
                    senderUser,
                    "Transfer Failed",
                    "Transfer of ₹" + request.getAmount() + " failed due to insufficient balance.",
                    NotificationType.TRANSFER_FAILED
            );
            throw new InsufficientBalanceException("Insufficient balance. Available: ₹" + senderAccount.getBalance());
        }

        Account recipientAccount = accountRepository.findByAccountNumber(request.getRecipientAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Recipient account not found: " + request.getRecipientAccountNumber()));

        if (recipientAccount.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new BadRequestException("Recipient account is not active");
        }

        // Deduct sender balance
        senderAccount.setBalance(senderAccount.getBalance().subtract(request.getAmount()));
        accountRepository.save(senderAccount);

        // Credit recipient balance
        recipientAccount.setBalance(recipientAccount.getBalance().add(request.getAmount()));
        accountRepository.save(recipientAccount);

        // Create Debit Transaction for Sender
        String senderRef = "TXN" + System.currentTimeMillis();
        String note = (request.getDescription() != null && !request.getDescription().isBlank())
                ? request.getDescription()
                : "Transfer to " + recipientAccount.getUser().getFullName();

        Transaction debitTx = Transaction.builder()
                .account(senderAccount)
                .referenceNumber(senderRef)
                .amount(request.getAmount())
                .type(Transaction.TransactionType.DEBIT)
                .category(Transaction.TransactionCategory.TRANSFER)
                .status(Transaction.TransactionStatus.SUCCESS)
                .description(note)
                .recipientInfo(recipientAccount.getUser().getFullName() + " (" + accountService.maskAccountNumber(recipientAccount.getAccountNumber()) + ")")
                .build();
        debitTx = transactionRepository.save(debitTx);

        // Create Credit Transaction for Recipient
        String creditRef = "TXN" + (System.currentTimeMillis() + 1);
        Transaction creditTx = Transaction.builder()
                .account(recipientAccount)
                .referenceNumber(creditRef)
                .amount(request.getAmount())
                .type(Transaction.TransactionType.CREDIT)
                .category(Transaction.TransactionCategory.TRANSFER)
                .status(Transaction.TransactionStatus.SUCCESS)
                .description("Transfer from " + senderUser.getFullName())
                .recipientInfo(senderUser.getFullName() + " (" + accountService.maskAccountNumber(senderAccount.getAccountNumber()) + ")")
                .relatedTransactionId(debitTx.getId())
                .build();
        creditTx = transactionRepository.save(creditTx);

        // Link debit tx with credit tx
        debitTx.setRelatedTransactionId(creditTx.getId());
        transactionRepository.save(debitTx);

        // Sender Notification
        notificationService.createNotification(
                senderUser,
                "Transfer Successful",
                String.format("₹%.2f transferred to %s. Reference: %s",
                        request.getAmount(), recipientAccount.getUser().getFullName(), senderRef),
                NotificationType.TRANSFER_SUCCESS
        );

        // Recipient Notification
        notificationService.createNotification(
                recipientAccount.getUser(),
                "Money Received",
                String.format("₹%.2f received from %s into your account %s. Reference: %s",
                        request.getAmount(), senderUser.getFullName(),
                        accountService.maskAccountNumber(recipientAccount.getAccountNumber()), creditRef),
                NotificationType.TRANSFER_SUCCESS
        );

        auditService.log(senderUser, "TRANSFER_COMPLETED", "Transaction", debitTx.getId().toString(), "SUCCESS", null, "Transferred ₹" + request.getAmount() + " to " + recipientAccount.getAccountNumber());

        return mapToResponse(debitTx);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(
            User user,
            Transaction.TransactionType type,
            Transaction.TransactionCategory category,
            Transaction.TransactionStatus status,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        Account account = accountService.getPrimaryAccount(user);
        return transactionRepository.findFilteredTransactions(account, type, category, status, startDate, endDate, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getRecentTransactions(User user) {
        Account account = accountService.getPrimaryAccount(user);
        return transactionRepository.findTop10ByAccountOrderByCreatedAtDesc(account).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TransactionResponse mapToResponse(Transaction tx) {
        return TransactionResponse.builder()
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
                .build();
    }
}
