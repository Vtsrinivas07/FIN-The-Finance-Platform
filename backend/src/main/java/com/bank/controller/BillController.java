package com.bank.controller;

import com.bank.dto.request.BillPaymentRequest;
import com.bank.dto.request.RechargeRequest;
import com.bank.dto.response.ApiResponse;
import com.bank.dto.response.BillProviderResponse;
import com.bank.dto.response.RechargePlanResponse;
import com.bank.dto.response.TransactionResponse;
import com.bank.entity.User;
import com.bank.security.SecurityUtils;
import com.bank.service.BillPaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@Tag(name = "Bill Payments & Recharges", description = "Utility bill payments, telecom providers, and mobile/DTH recharge plans")
public class BillController {

    private final BillPaymentService billPaymentService;
    private final SecurityUtils securityUtils;

    @GetMapping("/providers")
    @Operation(summary = "Get all registered bill providers")
    public ResponseEntity<ApiResponse<List<BillProviderResponse>>> getAllProviders() {
        List<BillProviderResponse> providers = billPaymentService.getAllProviders();
        return ResponseEntity.ok(ApiResponse.success(providers));
    }

    @GetMapping("/providers/{category}")
    @Operation(summary = "Get providers by category (e.g. ELECTRICITY, WATER, GAS, INTERNET, MOBILE, DTH)")
    public ResponseEntity<ApiResponse<List<BillProviderResponse>>> getProvidersByCategory(@PathVariable String category) {
        List<BillProviderResponse> providers = billPaymentService.getProvidersByCategory(category);
        return ResponseEntity.ok(ApiResponse.success(providers));
    }

    @GetMapping("/plans/{providerId}")
    @Operation(summary = "Get recharge plans for a specific telecom or DTH operator")
    public ResponseEntity<ApiResponse<List<RechargePlanResponse>>> getPlansForProvider(@PathVariable String providerId) {
        List<RechargePlanResponse> plans = billPaymentService.getPlansForProvider(providerId);
        return ResponseEntity.ok(ApiResponse.success(plans));
    }

    @PostMapping("/pay")
    @Operation(summary = "Pay a utility bill", description = "Executes simulated utility bill payment, deducts funds, and creates transaction record")
    public ResponseEntity<ApiResponse<TransactionResponse>> payBill(@Valid @RequestBody BillPaymentRequest request) {
        User user = securityUtils.getAuthenticatedUser();
        TransactionResponse response = billPaymentService.payBill(user, request);
        return ResponseEntity.ok(ApiResponse.success("Bill payment successful", response));
    }

    @PostMapping("/recharge")
    @Operation(summary = "Recharge Mobile or DTH", description = "Executes simulated mobile/DTH recharge based on selected plan")
    public ResponseEntity<ApiResponse<TransactionResponse>> recharge(@Valid @RequestBody RechargeRequest request) {
        User user = securityUtils.getAuthenticatedUser();
        TransactionResponse response = billPaymentService.processRecharge(user, request);
        return ResponseEntity.ok(ApiResponse.success("Recharge successful", response));
    }
}
