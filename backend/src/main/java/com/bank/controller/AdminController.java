package com.bank.controller;

import com.bank.dto.request.CustomerInquiryRequest;
import com.bank.dto.request.TransactionInquiryRequest;
import com.bank.dto.response.*;
import com.bank.entity.User;
import com.bank.security.SecurityUtils;
import com.bank.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Portal", description = "Administration oversight, system metrics, user governance, and audit trails")
public class AdminController {

    private final AdminService adminService;
    private final SecurityUtils securityUtils;

    @GetMapping("/metrics")
    @Operation(summary = "Get overall banking platform metrics")
    public ResponseEntity<ApiResponse<AdminMetricsResponse>> getMetrics() {
        AdminMetricsResponse response = adminService.getMetrics();
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/users")
    @Operation(summary = "List all platform users with pagination")
    public ResponseEntity<ApiResponse<Page<UserProfileResponse>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserProfileResponse> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/users/{userId}/toggle-status")
    @Operation(summary = "Toggle user active/suspended status")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(@PathVariable Long userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.success("User status updated", null));
    }

    @GetMapping("/transactions")
    @Operation(summary = "System-wide transaction monitor")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionResponse> txs = adminService.getAllTransactions(pageable);
        return ResponseEntity.ok(ApiResponse.success(txs));
    }

    @GetMapping("/audit-logs")
    @Operation(summary = "View security and event audit log stream")
    public ResponseEntity<ApiResponse<Page<AuditLogResponse>>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLogResponse> logs = adminService.getAuditLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success(logs));
    }

    @PostMapping("/customer-inquiry")
    @Operation(summary = "Authenticated customer CIF & account inquiry with mandatory audit reason")
    public ResponseEntity<ApiResponse<CustomerInquiryResponse>> customerInquiry(
            @Valid @RequestBody CustomerInquiryRequest request,
            HttpServletRequest httpRequest
    ) {
        User adminUser = securityUtils.getAuthenticatedUser();
        CustomerInquiryResponse response = adminService.performCustomerInquiry(request, adminUser, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/transaction-inquiry")
    @Operation(summary = "Authenticated transaction & AML clearing ledger inquiry with mandatory audit reason")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> transactionInquiry(
            @Valid @RequestBody TransactionInquiryRequest request,
            HttpServletRequest httpRequest
    ) {
        User adminUser = securityUtils.getAuthenticatedUser();
        List<TransactionResponse> response = adminService.performTransactionInquiry(request, adminUser, httpRequest.getRemoteAddr());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/kyc/pending")
    @Operation(summary = "List all pending KYC verification requests awaiting admin approval")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> getPendingKycRequests() {
        List<UserProfileResponse> pending = adminService.getPendingKycRequests();
        return ResponseEntity.ok(ApiResponse.success(pending));
    }

    @PostMapping("/kyc/{userId}/approve")
    @Operation(summary = "Approve customer KYC and upgrade to Full KYC Tier 3")
    public ResponseEntity<ApiResponse<Void>> approveKyc(@PathVariable Long userId) {
        User adminUser = securityUtils.getAuthenticatedUser();
        adminService.approveKyc(userId, adminUser);
        return ResponseEntity.ok(ApiResponse.success("KYC approved successfully. Customer upgraded to Tier 3.", null));
    }

    @PostMapping("/kyc/{userId}/reject")
    @Operation(summary = "Reject customer KYC with reason")
    public ResponseEntity<ApiResponse<Void>> rejectKyc(
            @PathVariable Long userId,
            @RequestBody java.util.Map<String, String> body
    ) {
        User adminUser = securityUtils.getAuthenticatedUser();
        String reason = body.getOrDefault("reason", "Documents could not be verified");
        adminService.rejectKyc(userId, reason, adminUser);
        return ResponseEntity.ok(ApiResponse.success("KYC rejected. Customer notified.", null));
    }
}
