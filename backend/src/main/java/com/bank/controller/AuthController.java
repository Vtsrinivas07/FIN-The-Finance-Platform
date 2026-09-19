package com.bank.controller;

import com.bank.dto.request.ChangePasswordRequest;
import com.bank.dto.request.LoginRequest;
import com.bank.dto.request.RegisterRequest;
import com.bank.dto.request.UpdateProfileRequest;
import com.bank.dto.response.ApiResponse;
import com.bank.dto.response.AuthResponse;
import com.bank.dto.response.UserProfileResponse;
import com.bank.entity.User;
import com.bank.security.SecurityUtils;
import com.bank.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication & Profile", description = "User registration, login, profile management, and password updates")
public class AuthController {

    private final AuthService authService;
    private final SecurityUtils securityUtils;

    @PostMapping("/register")
    @Operation(summary = "Register a new user", description = "Creates a new user account with default SAVINGS account and ₹1000 balance")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    @Operation(summary = "User login", description = "Authenticates credentials and returns a signed JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated profile", description = "Retrieves profile information for the authenticated user")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser() {
        User user = securityUtils.getAuthenticatedUser();
        UserProfileResponse response = authService.getProfile(user.getUsername());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update personal profile", description = "Updates full name, email, mobile number, and address")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        User user = securityUtils.getAuthenticatedUser();
        UserProfileResponse response = authService.updateProfile(user.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @PostMapping("/kyc/send-otp")
    @Operation(summary = "Generate Aadhaar OTP for KYC", description = "Simulates UIDAI OTP generation. Stores OTP server-side and returns it (simulated SMS for showcase)")
    public ResponseEntity<ApiResponse<java.util.Map<String, String>>> sendKycOtp(@RequestBody java.util.Map<String, String> body) {
        User user = securityUtils.getAuthenticatedUser();
        String aadhaarNumber = body.get("aadhaarNumber");
        if (aadhaarNumber == null || aadhaarNumber.isBlank()) {
            throw new com.bank.exception.BadRequestException("Aadhaar number is required");
        }
        String otp = authService.generateKycOtp(user, aadhaarNumber);
        return ResponseEntity.ok(ApiResponse.success("OTP sent to registered mobile",
                java.util.Map.of("otp", otp, "mobile", user.getMobileNumber())));
    }

    @PostMapping("/kyc/submit")
    @Operation(summary = "Submit digital KYC", description = "Verifies PAN, Aadhaar OTP, and Video KYC and submits for admin approval")
    public ResponseEntity<ApiResponse<UserProfileResponse>> submitKyc(@Valid @RequestBody com.bank.dto.request.KycSubmitRequest request) {
        User user = securityUtils.getAuthenticatedUser();
        UserProfileResponse response = authService.submitKyc(user, request);
        return ResponseEntity.ok(ApiResponse.success("KYC submitted successfully. Pending admin approval.", response));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change account password", description = "Verifies current password and updates to new password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        User user = securityUtils.getAuthenticatedUser();
        authService.changePassword(user.getUsername(), request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }
}
