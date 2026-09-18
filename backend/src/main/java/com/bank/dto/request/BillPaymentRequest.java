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
public class BillPaymentRequest {

    @NotBlank(message = "Provider ID is required")
    private String providerId;

    @NotBlank(message = "Consumer/Bill number is required")
    private String consumerNumber;

    @NotNull(message = "Bill amount is required")
    @DecimalMin(value = "1.00", message = "Amount must be at least ₹1.00")
    private BigDecimal amount;
}
