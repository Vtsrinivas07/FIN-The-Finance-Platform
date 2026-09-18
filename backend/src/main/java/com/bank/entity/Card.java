package com.bank.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "card_number_masked", nullable = false, length = 30)
    private String cardNumberMasked;

    @Column(name = "card_type", nullable = false, length = 20)
    @Builder.Default
    private String cardType = "DEBIT";

    @Column(name = "card_holder_name", nullable = false, length = 100)
    private String cardHolderName;

    @Column(name = "expiry_date", nullable = false, length = 10)
    private String expiryDate;

    @Column(name = "spending_limit", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal spendingLimit = new BigDecimal("50000.00");

    @Column(name = "is_frozen", nullable = false)
    @Builder.Default
    private boolean isFrozen = false;

    @Column(name = "is_online_enabled", nullable = false)
    @Builder.Default
    private boolean isOnlineEnabled = true;

    @Column(name = "is_contactless_enabled", nullable = false)
    @Builder.Default
    private boolean isContactlessEnabled = true;

    @Column(name = "is_international_enabled", nullable = false)
    @Builder.Default
    private boolean isInternationalEnabled = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
