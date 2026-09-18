package com.bank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerInquiryResponse {
    private UserProfileResponse user;
    private List<AccountResponse> accounts;
    private List<TransactionResponse> transactions;
    private String authType;
    private String queriedIdentifier;
    private String reason;
    private String cifNumber;
    private String kycStatus;
    private LocalDateTime inquiryTimestamp;
}
