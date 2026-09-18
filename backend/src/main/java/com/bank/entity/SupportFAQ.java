package com.bank.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "support_faqs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportFAQ {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String category; // ACCOUNT, SECURITY, TRANSFERS, TRANSACTIONS, BILLS, CARDS, GENERAL

    @Column(nullable = false, length = 255)
    private String question;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String answer;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String keywords;
}
