package com.bank.service;

import com.bank.dto.request.DepositRequest;
import com.bank.dto.response.AccountResponse;
import com.bank.entity.Account;
import com.bank.entity.Transaction;
import com.bank.entity.User;
import com.bank.entity.Notification.NotificationType;
import com.bank.exception.BadRequestException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.AccountRepository;
import com.bank.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<AccountResponse> getUserAccounts(User user) {
        return accountRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Account getPrimaryAccount(User user) {
        return accountRepository.findByUser(user).stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No active account found for user"));
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountDetails(String accountNumber, User user) {
        Account account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found: " + accountNumber));

        if (!account.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Unauthorized access to account");
        }

        return mapToResponse(account);
    }

    @Transactional
    public AccountResponse deposit(User user, DepositRequest request) {
        Account account = getPrimaryAccount(user);

        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new BadRequestException("Account is not active");
        }

        account.setBalance(account.getBalance().add(request.getAmount()));
        accountRepository.save(account);

        String refNum = "DEP" + System.currentTimeMillis();
        Transaction transaction = Transaction.builder()
                .account(account)
                .referenceNumber(refNum)
                .amount(request.getAmount())
                .type(Transaction.TransactionType.CREDIT)
                .category(Transaction.TransactionCategory.DEPOSIT)
                .status(Transaction.TransactionStatus.SUCCESS)
                .description("Cash Deposit to " + maskAccountNumber(account.getAccountNumber()))
                .recipientInfo("SELF-DEPOSIT")
                .build();
        transactionRepository.save(transaction);

        notificationService.createNotification(
                user,
                "Deposit Successful",
                String.format("₹%.2f credited to account %s. Current Balance: ₹%.2f",
                        request.getAmount(), maskAccountNumber(account.getAccountNumber()), account.getBalance()),
                NotificationType.ACCOUNT_UPDATE
        );

        auditService.log(user, "DEPOSIT", "Account", account.getId().toString(), "SUCCESS", null, "Deposited amount: " + request.getAmount());

        return mapToResponse(account);
    }

    public AccountResponse mapToResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .maskedAccountNumber(maskAccountNumber(account.getAccountNumber()))
                .accountType(account.getAccountType().name())
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .status(account.getStatus().name())
                .createdAt(account.getCreatedAt())
                .build();
    }

    public String maskAccountNumber(String acc) {
        if (acc == null || acc.length() < 4) return acc;
        return "•••• " + acc.substring(acc.length() - 4);
    }
}
