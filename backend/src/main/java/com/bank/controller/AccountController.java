package com.bank.controller;

import com.bank.dto.request.DepositRequest;
import com.bank.dto.response.AccountResponse;
import com.bank.dto.response.ApiResponse;
import com.bank.entity.User;
import com.bank.security.SecurityUtils;
import com.bank.service.AccountService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@Tag(name = "Account Management", description = "Account details, masked balances, and cash deposits")
public class AccountController {

    private final AccountService accountService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get all accounts for current user")
    public ResponseEntity<ApiResponse<List<AccountResponse>>> getUserAccounts() {
        User user = securityUtils.getAuthenticatedUser();
        List<AccountResponse> accounts = accountService.getUserAccounts(user);
        return ResponseEntity.ok(ApiResponse.success(accounts));
    }

    @GetMapping("/primary")
    @Operation(summary = "Get primary account for current user")
    public ResponseEntity<ApiResponse<AccountResponse>> getPrimaryAccount() {
        User user = securityUtils.getAuthenticatedUser();
        AccountResponse response = accountService.mapToResponse(accountService.getPrimaryAccount(user));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/{accountNumber}")
    @Operation(summary = "Get specific account details")
    public ResponseEntity<ApiResponse<AccountResponse>> getAccountDetails(@PathVariable String accountNumber) {
        User user = securityUtils.getAuthenticatedUser();
        AccountResponse response = accountService.getAccountDetails(accountNumber, user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/deposit")
    @Operation(summary = "Deposit funds into primary account", description = "Simulates cash deposit, crediting balance and generating a CREDIT transaction record")
    public ResponseEntity<ApiResponse<AccountResponse>> deposit(@Valid @RequestBody DepositRequest request) {
        User user = securityUtils.getAuthenticatedUser();
        AccountResponse response = accountService.deposit(user, request);
        return ResponseEntity.ok(ApiResponse.success("Deposit successful", response));
    }
}
