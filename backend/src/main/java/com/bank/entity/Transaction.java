package com.bank.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "reference_number", unique = true, nullable = false, length = 50)
    private String referenceNumber;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private TransactionType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TransactionStatus status = TransactionStatus.SUCCESS;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "recipient_info", nullable = false, length = 255)
    private String recipientInfo;

    @Column(name = "related_transaction_id")
    private UUID relatedTransactionId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum TransactionType {
        CREDIT,
        DEBIT
    }

    public enum TransactionCategory {
        TRANSFER,
        BILL_PAYMENT,
        RECHARGE,
        DEPOSIT
    }

    public enum TransactionStatus {
        SUCCESS,
        PENDING,
        FAILED,
        REVERSED
    }
}
