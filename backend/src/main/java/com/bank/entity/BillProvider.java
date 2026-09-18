package com.bank.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bill_providers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillProvider {

    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 50)
    private String category; // ELECTRICITY, WATER, GAS, INTERNET, MOBILE, DTH
}
