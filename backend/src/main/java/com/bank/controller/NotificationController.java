package com.bank.controller;

import com.bank.dto.response.ApiResponse;
import com.bank.dto.response.NotificationResponse;
import com.bank.entity.User;
import com.bank.security.SecurityUtils;
import com.bank.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Center", description = "User alerts, transfer receipts, reminders, and unread counts")
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityUtils securityUtils;

    @GetMapping
    @Operation(summary = "Get user notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications() {
        User user = securityUtils.getAuthenticatedUser();
        List<NotificationResponse> list = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count badge")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount() {
        User user = securityUtils.getAuthenticatedUser();
        long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(ApiResponse.success(Map.of("unreadCount", count)));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        User user = securityUtils.getAuthenticatedUser();
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        User user = securityUtils.getAuthenticatedUser();
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }
}
