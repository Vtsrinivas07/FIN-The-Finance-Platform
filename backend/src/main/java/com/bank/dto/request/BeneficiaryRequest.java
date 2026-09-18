package com.bank.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiaryRequest {

    @NotBlank(message = "Beneficiary account number is required")
    private String beneficiaryAccountNumber;

    @NotBlank(message = "Beneficiary name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String beneficiaryName;

    @NotBlank(message = "Bank name is required")
    private String bankName;

    @NotBlank(message = "IFSC code is required")
    private String ifscCode;
}
