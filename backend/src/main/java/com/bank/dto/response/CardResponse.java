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
public class CardResponse {
    private Long id;
    private String cardNumberMasked;
    private String cardType;
    private String cardHolderName;
    private String expiryDate;
    private BigDecimal spendingLimit;
    private boolean isFrozen;
    private boolean isOnlineEnabled;
    private boolean isContactlessEnabled;
    private boolean isInternationalEnabled;
}
