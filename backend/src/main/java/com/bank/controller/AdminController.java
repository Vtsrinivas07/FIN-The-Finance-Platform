package com.bank.controller;

import com.bank.dto.response.*;
import com.bank.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@Tag(name = "Admin Portal", description = "Administration oversight, system metrics, user governance, and audit trails")
public class AdminController {

    private final AdminService adminService;

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
}
