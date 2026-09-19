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
public class UserProfileResponse {
    private Long id;
    private String username;
    private String fullName;
    private String email;
    private String mobileNumber;
    private String address;
    private String role;
    private String status;
    private String kycStatus;
    private String panNumber;
    private String aadhaarNumber;
    private String dateOfBirth;
    private String vkycReference;
    private LocalDateTime createdAt;
}
