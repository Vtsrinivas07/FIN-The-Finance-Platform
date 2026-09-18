package com.bank.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {
    private Long id;
    private String username;
    private String action;
    private String entityName;
    private String entityId;
    private String status;
    private String ipAddress;
    private String details;
    private LocalDateTime createdAt;
}
