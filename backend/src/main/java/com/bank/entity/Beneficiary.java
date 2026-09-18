package com.bank.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "beneficiaries", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "beneficiary_account_number"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Beneficiary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "beneficiary_account_number", nullable = false, length = 30)
    private String beneficiaryAccountNumber;

    @Column(name = "beneficiary_name", nullable = false, length = 100)
    private String beneficiaryName;

    @Column(name = "bank_name", nullable = false, length = 100)
    private String bankName;

    @Column(name = "ifsc_code", nullable = false, length = 20)
    private String ifscCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private BeneficiaryStatus status = BeneficiaryStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum BeneficiaryStatus {
        ACTIVE,
        INACTIVE
    }
}
