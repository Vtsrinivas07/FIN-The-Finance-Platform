package com.bank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private UUID id;
    private String referenceNumber;
    private String accountNumber;
    private BigDecimal amount;
    private String type;
    private String category;
    private String status;
    private String description;
    private String recipientInfo;
    private LocalDateTime createdAt;
}
