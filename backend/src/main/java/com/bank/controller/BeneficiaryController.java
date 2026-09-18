package com.bank.controller;

import com.bank.dto.request.BeneficiaryRequest;
import com.bank.dto.response.ApiResponse;
import com.bank.dto.response.BeneficiaryResponse;
import com.bank.entity.User;
import com.bank.security.SecurityUtils;
import com.bank.service.BeneficiaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/beneficiaries")
@RequiredArgsConstructor
@Tag(name = "Beneficiary Management", description = "Manage registered beneficiaries and quick transfer contacts")
public class BeneficiaryController {

    private final BeneficiaryService beneficiaryService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get all active beneficiaries for user")
    public ResponseEntity<ApiResponse<List<BeneficiaryResponse>>> getBeneficiaries() {
        User user = securityUtils.getAuthenticatedUser();
        List<BeneficiaryResponse> list = beneficiaryService.getBeneficiaries(user);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping
    @Operation(summary = "Add a new beneficiary")
    public ResponseEntity<ApiResponse<BeneficiaryResponse>> addBeneficiary(@Valid @RequestBody BeneficiaryRequest request) {
        User user = securityUtils.getAuthenticatedUser();
        BeneficiaryResponse response = beneficiaryService.addBeneficiary(user, request);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary added successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a beneficiary")
    public ResponseEntity<ApiResponse<Void>> deleteBeneficiary(@PathVariable Long id) {
        User user = securityUtils.getAuthenticatedUser();
        beneficiaryService.deleteBeneficiary(user, id);
        return ResponseEntity.ok(ApiResponse.success("Beneficiary deleted successfully", null));
    }

    @GetMapping("/search")
    @Operation(summary = "Search beneficiaries by name")
    public ResponseEntity<ApiResponse<List<BeneficiaryResponse>>> searchBeneficiaries(@RequestParam String query) {
        User user = securityUtils.getAuthenticatedUser();
        List<BeneficiaryResponse> results = beneficiaryService.searchBeneficiaries(user, query);
        return ResponseEntity.ok(ApiResponse.success(results));
    }
}
