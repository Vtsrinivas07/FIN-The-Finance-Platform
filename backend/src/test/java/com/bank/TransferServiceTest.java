package com.bank;

import com.bank.dto.request.TransferRequest;
import com.bank.dto.response.TransactionResponse;
import com.bank.entity.Account;
import com.bank.entity.Transaction;
import com.bank.entity.User;
import com.bank.exception.BadRequestException;
import com.bank.exception.InsufficientBalanceException;
import com.bank.repository.AccountRepository;
import com.bank.repository.TransactionRepository;
import com.bank.service.AccountService;
import com.bank.service.AuditService;
import com.bank.service.NotificationService;
import com.bank.service.TransferService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransferServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private AuditService auditService;

    @Mock
    private AccountService accountService;

    @InjectMocks
    private TransferService transferService;

    private User senderUser;
    private User recipientUser;
    private Account senderAccount;
    private Account recipientAccount;

    @BeforeEach
    void setUp() {
        senderUser = User.builder()
                .id(1L)
                .username("sender")
                .fullName("Sender User")
                .kycStatus(User.KycStatus.VERIFIED_TIER_3)
                .build();

        recipientUser = User.builder()
                .id(2L)
                .username("recipient")
                .fullName("Recipient User")
                .kycStatus(User.KycStatus.VERIFIED_TIER_3)
                .build();

        senderAccount = Account.builder()
                .id(10L)
                .user(senderUser)
                .accountNumber("100111111111")
                .balance(new BigDecimal("5000.00"))
                .status(Account.AccountStatus.ACTIVE)
                .build();

        recipientAccount = Account.builder()
                .id(20L)
                .user(recipientUser)
                .accountNumber("100222222222")
                .balance(new BigDecimal("2000.00"))
                .status(Account.AccountStatus.ACTIVE)
                .build();
    }

    @Test
    void transferFunds_Successful() {
        TransferRequest request = TransferRequest.builder()
                .recipientAccountNumber("100222222222")
                .amount(new BigDecimal("1000.00"))
                .description("Rent Payment")
                .build();

        when(accountService.getPrimaryAccount(senderUser)).thenReturn(senderAccount);
        when(accountRepository.findByAccountNumber("100222222222")).thenReturn(Optional.of(recipientAccount));

        Transaction mockDebitTx = Transaction.builder()
                .id(UUID.randomUUID())
                .account(senderAccount)
                .referenceNumber("TXN123456")
                .amount(new BigDecimal("1000.00"))
                .type(Transaction.TransactionType.DEBIT)
                .category(Transaction.TransactionCategory.TRANSFER)
                .status(Transaction.TransactionStatus.SUCCESS)
                .description("Rent Payment")
                .recipientInfo("Recipient User (•••• 2222)")
                .build();

        Transaction mockCreditTx = Transaction.builder()
                .id(UUID.randomUUID())
                .account(recipientAccount)
                .referenceNumber("TXN123457")
                .amount(new BigDecimal("1000.00"))
                .type(Transaction.TransactionType.CREDIT)
                .category(Transaction.TransactionCategory.TRANSFER)
                .status(Transaction.TransactionStatus.SUCCESS)
                .description("Rent Payment")
                .recipientInfo("Sender User (•••• 1111)")
                .build();

        when(transactionRepository.save(any(Transaction.class)))
                .thenReturn(mockDebitTx)
                .thenReturn(mockCreditTx)
                .thenReturn(mockDebitTx);

        TransactionResponse response = transferService.transferFunds(senderUser, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("4000.00"), senderAccount.getBalance());
        assertEquals(new BigDecimal("3000.00"), recipientAccount.getBalance());
        verify(accountRepository, times(1)).save(senderAccount);
        verify(accountRepository, times(1)).save(recipientAccount);
    }

    @Test
    void transferFunds_InsufficientBalance_ThrowsException() {
        TransferRequest request = TransferRequest.builder()
                .recipientAccountNumber("100222222222")
                .amount(new BigDecimal("6000.00")) // Exceeds balance
                .description("Overdraft attempt")
                .build();

        when(accountService.getPrimaryAccount(senderUser)).thenReturn(senderAccount);

        assertThrows(InsufficientBalanceException.class, () -> transferService.transferFunds(senderUser, request));
        assertEquals(new BigDecimal("5000.00"), senderAccount.getBalance()); // Balance unaffected
        verify(accountRepository, never()).save(any());
    }

    @Test
    void transferFunds_ToSameAccount_ThrowsException() {
        TransferRequest request = TransferRequest.builder()
                .recipientAccountNumber("100111111111") // Same as sender
                .amount(new BigDecimal("500.00"))
                .build();

        when(accountService.getPrimaryAccount(senderUser)).thenReturn(senderAccount);

        assertThrows(BadRequestException.class, () -> transferService.transferFunds(senderUser, request));
    }

    @Test
    void transferFunds_PendingKyc_ThrowsBadRequestException() {
        senderUser.setKycStatus(User.KycStatus.PENDING);
        TransferRequest request = TransferRequest.builder()
                .recipientAccountNumber("100222222222")
                .amount(new BigDecimal("100.00"))
                .build();

        when(accountService.getPrimaryAccount(senderUser)).thenReturn(senderAccount);

        assertThrows(BadRequestException.class, () -> transferService.transferFunds(senderUser, request));
    }
}
