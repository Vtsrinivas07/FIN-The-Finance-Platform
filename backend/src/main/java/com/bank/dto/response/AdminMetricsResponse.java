package com.bank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMetricsResponse {
    private long totalCustomers;
    private long activeAccounts;
    private long transactionsToday;
    private long successfulTransactions;
    private long failedTransactions;
    private BigDecimal totalTransactionVolume;
    private long pendingQueries;
}
