package com.bank.controller;

import com.bank.dto.response.ApiResponse;
import com.bank.dto.response.SpendingAnalyticsResponse;
import com.bank.entity.User;
import com.bank.security.SecurityUtils;
import com.bank.service.AnalyticsService;
import com.bank.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Tag(name = "Spending Analytics", description = "Monthly spending trends, category breakdowns, and income vs expense ratios")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get user spending analytics", description = "Retrieves category breakdown, income/expense totals, and monthly trends")
    public ResponseEntity<ApiResponse<SpendingAnalyticsResponse>> getAnalytics() {
        User user = securityUtils.getAuthenticatedUser();
        SpendingAnalyticsResponse response = analyticsService.getAnalytics(user);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
