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
public class RechargePlanResponse {
    private String id;
    private String providerId;
    private String providerName;
    private String name;
    private BigDecimal amount;
    private String validity;
    private String description;
    private String planType;
}
