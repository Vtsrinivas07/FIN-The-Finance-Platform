package com.bank.controller;

import com.bank.dto.request.ChatMessageRequest;
import com.bank.dto.response.ApiResponse;
import com.bank.dto.response.ChatMessageResponse;
import com.bank.dto.response.SupportFAQResponse;
import com.bank.entity.User;
import com.bank.repository.UserRepository;
import com.bank.security.SecurityUtils;
import com.bank.service.SupportChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/support")
@RequiredArgsConstructor
@Tag(name = "Support & FAQ Chatbot", description = "Deterministic FAQ knowledge search and AI support chat assistant")
public class SupportChatController {

    private final SupportChatService supportChatService;
    private final SecurityUtils securityUtils;

    @GetMapping("/faqs")
    @Operation(summary = "Get banking FAQs, optionally filtered by category")
    public ResponseEntity<ApiResponse<List<SupportFAQResponse>>> getFaqs(@RequestParam(required = false) String category) {
        List<SupportFAQResponse> faqs = supportChatService.getFaqs(category);
        return ResponseEntity.ok(ApiResponse.success(faqs));
    }

    @GetMapping("/faqs/search")
    @Operation(summary = "Search FAQs by query string")
    public ResponseEntity<ApiResponse<List<SupportFAQResponse>>> searchFaqs(@RequestParam String query) {
        List<SupportFAQResponse> results = supportChatService.searchFaqs(query);
        return ResponseEntity.ok(ApiResponse.success(results));
    }

    @PostMapping("/chat")
    @Operation(summary = "Send query to FAQ support bot", description = "Retrieves grounded answers based on bank FAQ knowledge base")
    public ResponseEntity<ApiResponse<ChatMessageResponse>> chat(@Valid @RequestBody ChatMessageRequest request) {
        User user = null;
        try {
            user = securityUtils.getAuthenticatedUser();
        } catch (Exception ignored) {
            // Support chat allows unauthenticated pre-login inquiries as well
        }

        ChatMessageResponse response = supportChatService.processMessage(user, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/chat/{sessionId}/messages")
    @Operation(summary = "Get chat history for a session")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getSessionMessages(@PathVariable UUID sessionId) {
        List<ChatMessageResponse> messages = supportChatService.getSessionMessages(sessionId);
        return ResponseEntity.ok(ApiResponse.success(messages));
    }
}
