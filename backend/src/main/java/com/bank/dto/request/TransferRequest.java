package com.bank.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequest {

    @NotBlank(message = "Recipient account number is required")
    private String recipientAccountNumber;

    @NotNull(message = "Transfer amount is required")
    @DecimalMin(value = "1.00", message = "Minimum transfer amount is ₹1.00")
    private BigDecimal amount;

    private String description;
}
