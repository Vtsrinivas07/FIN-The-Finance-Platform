package com.bank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeneficiaryResponse {
    private Long id;
    private String beneficiaryAccountNumber;
    private String maskedAccountNumber;
    private String beneficiaryName;
    private String bankName;
    private String ifscCode;
    private String status;
    private LocalDateTime createdAt;
}
