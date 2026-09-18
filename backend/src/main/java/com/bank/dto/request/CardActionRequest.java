package com.bank.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CardActionRequest {
    private Boolean isFrozen;
    private Boolean isOnlineEnabled;
    private Boolean isContactlessEnabled;
    private Boolean isInternationalEnabled;
    private BigDecimal spendingLimit;
}
