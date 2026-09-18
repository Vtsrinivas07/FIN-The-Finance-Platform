package com.bank.service;

import com.bank.entity.AuditLog;
import com.bank.entity.User;
import com.bank.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Transactional
    public void log(User user, String action, String entityName, String entityId, String status, String ipAddress, String details) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .entityName(entityName)
                    .entityId(entityId)
                    .status(status)
                    .ipAddress(ipAddress != null ? ipAddress : "127.0.0.1")
                    .details(details)
                    .build();
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to persist audit log for action: {}", action, e);
        }
    }
}
