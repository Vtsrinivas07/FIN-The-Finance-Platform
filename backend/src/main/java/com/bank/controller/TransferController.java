package com.bank.controller;

import com.bank.dto.request.TransferRequest;
import com.bank.dto.response.ApiResponse;
import com.bank.dto.response.TransactionResponse;
import com.bank.entity.Transaction;
import com.bank.entity.User;
import com.bank.security.SecurityUtils;
import com.bank.service.TransferService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
@Tag(name = "Transfers & Transactions", description = "Simulated fund transfers, transaction history, and ledger statements")
public class TransferController {

    private final TransferService transferService;
    private final SecurityUtils securityUtils;

    @PostMapping
    @Operation(summary = "Transfer funds to another account", description = "Executes an atomic transfer between accounts with double-entry ledger debit & credit records")
    public ResponseEntity<ApiResponse<TransactionResponse>> transfer(@Valid @RequestBody TransferRequest request) {
        User user = securityUtils.getAuthenticatedUser();
        TransactionResponse response = transferService.transferFunds(user, request);
        return ResponseEntity.ok(ApiResponse.success("Transfer completed successfully", response));
    }

    @GetMapping("/lookup-upi-phone")
    @Operation(summary = "Lookup recipient UPI details by phone number")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> lookupUpiPhone(@RequestParam String phone) {
        java.util.Map<String, Object> result = transferService.lookupUpiPhone(phone);
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent transactions", description = "Retrieves the 10 most recent transactions for the dashboard")
    public ResponseEntity<ApiResponse<List<TransactionResponse>>> getRecentTransactions() {
        User user = securityUtils.getAuthenticatedUser();
        List<TransactionResponse> recent = transferService.getRecentTransactions(user);
        return ResponseEntity.ok(ApiResponse.success(recent));
    }

    @GetMapping("/history")
    @Operation(summary = "Get paginated transaction history with optional filters")
    public ResponseEntity<ApiResponse<Page<TransactionResponse>>> getTransactionHistory(
            @RequestParam(required = false) Transaction.TransactionType type,
            @RequestParam(required = false) Transaction.TransactionCategory category,
            @RequestParam(required = false) Transaction.TransactionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        User user = securityUtils.getAuthenticatedUser();
        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionResponse> transactions = transferService.getTransactions(user, type, category, status, startDate, endDate, pageable);
        return ResponseEntity.ok(ApiResponse.success(transactions));
    }
}
