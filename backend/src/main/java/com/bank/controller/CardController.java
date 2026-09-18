package com.bank.controller;

import com.bank.dto.request.CardActionRequest;
import com.bank.dto.response.ApiResponse;
import com.bank.dto.response.CardResponse;
import com.bank.entity.User;
import com.bank.security.SecurityUtils;
import com.bank.service.CardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
@Tag(name = "Card Controls", description = "Demo debit card management, status toggles, and spending limits")
public class CardController {

    private final CardService cardService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get user's debit cards")
    public ResponseEntity<ApiResponse<List<CardResponse>>> getCards() {
        User user = securityUtils.getAuthenticatedUser();
        List<CardResponse> cards = cardService.getUserCards(user);
        return ResponseEntity.ok(ApiResponse.success(cards));
    }

    @PatchMapping("/{id}/settings")
    @Operation(summary = "Update card controls", description = "Toggle freeze status, online transactions, contactless usage, international mode, or spending limit")
    public ResponseEntity<ApiResponse<CardResponse>> updateSettings(@PathVariable Long id, @RequestBody CardActionRequest request) {
        User user = securityUtils.getAuthenticatedUser();
        CardResponse updated = cardService.updateCardSettings(user, id, request);
        return ResponseEntity.ok(ApiResponse.success("Card settings updated", updated));
    }
}
