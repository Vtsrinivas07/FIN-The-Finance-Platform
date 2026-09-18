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
public class CustomerInquiryRequest {

    @NotBlank(message = "Authentication credential type is required")
    private String authType; // ACCOUNT_NUMBER, CIF_USERNAME, MOBILE, PAN_TAX_ID, EMAIL

    @NotBlank(message = "Customer identifier is required")
    private String identifier;

    @NotBlank(message = "Compliance audit justification / reason is mandatory")
    private String reason;
}
