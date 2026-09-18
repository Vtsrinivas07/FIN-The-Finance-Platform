package com.bank.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionInquiryRequest {

    @NotBlank(message = "Search identifier type is required")
    private String searchType; // REFERENCE_NUMBER, ACCOUNT_NUMBER, CIF_USERNAME

    @NotBlank(message = "Search value is required")
    private String identifier;

    @NotBlank(message = "Audit inquiry purpose is mandatory")
    private String reason;
}
