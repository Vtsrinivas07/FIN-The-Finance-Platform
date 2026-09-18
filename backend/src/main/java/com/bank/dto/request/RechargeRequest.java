package com.bank.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RechargeRequest {

    @NotBlank(message = "Plan ID is required")
    private String planId;

    @NotBlank(message = "Mobile or subscriber number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Subscriber number must be 10 digits")
    private String mobileNumber;
}
