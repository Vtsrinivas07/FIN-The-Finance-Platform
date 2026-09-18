package com.bank.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "recharge_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RechargePlan {

    @Id
    @Column(length = 50)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", nullable = false)
    private BillProvider provider;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 50)
    private String validity;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(name = "plan_type", nullable = false, length = 20)
    private String planType; // MOBILE, DTH
}
