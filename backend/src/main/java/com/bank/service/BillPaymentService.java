package com.bank.service;

import com.bank.dto.request.BillPaymentRequest;
import com.bank.dto.request.RechargeRequest;
import com.bank.dto.response.BillProviderResponse;
import com.bank.dto.response.RechargePlanResponse;
import com.bank.dto.response.TransactionResponse;
import com.bank.entity.*;
import com.bank.entity.Notification.NotificationType;
import com.bank.exception.BadRequestException;
import com.bank.exception.InsufficientBalanceException;
import com.bank.exception.ResourceNotFoundException;
import com.bank.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillPaymentService {

    private final BillProviderRepository billProviderRepository;
    private final RechargePlanRepository rechargePlanRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final AccountService accountService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    @Transactional(readOnly = true)
    public List<BillProviderResponse> getAllProviders() {
        return billProviderRepository.findAll().stream()
                .map(this::mapProviderToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BillProviderResponse> getProvidersByCategory(String category) {
        return billProviderRepository.findByCategory(category).stream()
                .map(this::mapProviderToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RechargePlanResponse> getPlansForProvider(String providerId) {
        BillProvider provider = billProviderRepository.findById(providerId)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found: " + providerId));

        return rechargePlanRepository.findByProvider(provider).stream()
                .map(this::mapPlanToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public TransactionResponse payBill(User user, BillPaymentRequest request) {
        Account account = accountService.getPrimaryAccount(user);

        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new BadRequestException("Account is not active");
        }

        if (request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Amount must be greater than zero");
        }

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance to pay bill. Balance: ₹" + account.getBalance());
        }

        BillProvider provider = billProviderRepository.findById(request.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found: " + request.getProviderId()));

        // Deduct balance
        account.setBalance(account.getBalance().subtract(request.getAmount()));
        accountRepository.save(account);

        String refNum = "BILL" + System.currentTimeMillis();
        Transaction transaction = Transaction.builder()
                .account(account)
                .referenceNumber(refNum)
                .amount(request.getAmount())
                .type(Transaction.TransactionType.DEBIT)
                .category(Transaction.TransactionCategory.BILL_PAYMENT)
                .status(Transaction.TransactionStatus.SUCCESS)
                .description("Bill payment to " + provider.getName())
                .recipientInfo(provider.getName() + " (Bill #" + request.getConsumerNumber() + ")")
                .build();
        transaction = transactionRepository.save(transaction);

        notificationService.createNotification(
                user,
                "Bill Payment Successful",
                String.format("Payment of ₹%.2f to %s (Consumer: %s) was successful. Ref: %s",
                        request.getAmount(), provider.getName(), request.getConsumerNumber(), refNum),
                NotificationType.BILL_REMINDER
        );

        auditService.log(user, "BILL_PAYMENT", "BillPayment", transaction.getId().toString(), "SUCCESS", null, "Paid bill to " + provider.getName());

        return mapTxToResponse(transaction);
    }

    @Transactional
    public TransactionResponse processRecharge(User user, RechargeRequest request) {
        Account account = accountService.getPrimaryAccount(user);

        if (account.getStatus() != Account.AccountStatus.ACTIVE) {
            throw new BadRequestException("Account is not active");
        }

        RechargePlan plan = rechargePlanRepository.findById(request.getPlanId())
                .orElseThrow(() -> new ResourceNotFoundException("Recharge plan not found: " + request.getPlanId()));

        if (account.getBalance().compareTo(plan.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for recharge. Balance: ₹" + account.getBalance());
        }

        // Deduct balance
        account.setBalance(account.getBalance().subtract(plan.getAmount()));
        accountRepository.save(account);

        String refNum = "RCH" + System.currentTimeMillis();
        Transaction transaction = Transaction.builder()
                .account(account)
                .referenceNumber(refNum)
                .amount(plan.getAmount())
                .type(Transaction.TransactionType.DEBIT)
                .category(Transaction.TransactionCategory.RECHARGE)
                .status(Transaction.TransactionStatus.SUCCESS)
                .description(plan.getProvider().getName() + " Recharge - " + plan.getName())
                .recipientInfo(request.getMobileNumber() + " (" + plan.getValidity() + ")")
                .build();
        transaction = transactionRepository.save(transaction);

        notificationService.createNotification(
                user,
                "Recharge Successful",
                String.format("Recharge of ₹%.2f for %s (%s) was successful. Ref: %s",
                        plan.getAmount(), request.getMobileNumber(), plan.getProvider().getName(), refNum),
                NotificationType.TRANSFER_SUCCESS
        );

        auditService.log(user, "RECHARGE", "Recharge", transaction.getId().toString(), "SUCCESS", null, "Recharge for " + request.getMobileNumber());

        return mapTxToResponse(transaction);
    }

    private BillProviderResponse mapProviderToResponse(BillProvider provider) {
        return BillProviderResponse.builder()
                .id(provider.getId())
                .name(provider.getName())
                .category(provider.getCategory())
                .build();
    }

    private RechargePlanResponse mapPlanToResponse(RechargePlan plan) {
        return RechargePlanResponse.builder()
                .id(plan.getId())
                .providerId(plan.getProvider().getId())
                .providerName(plan.getProvider().getName())
                .name(plan.getName())
                .amount(plan.getAmount())
                .validity(plan.getValidity())
                .description(plan.getDescription())
                .planType(plan.getPlanType())
                .build();
    }

    private TransactionResponse mapTxToResponse(Transaction tx) {
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
