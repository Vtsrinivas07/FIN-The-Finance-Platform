package com.bank.service;

import com.bank.dto.request.ChatMessageRequest;
import com.bank.dto.response.ChatMessageResponse;
import com.bank.dto.response.SupportFAQResponse;
import com.bank.entity.*;
import com.bank.repository.ChatMessageRepository;
import com.bank.repository.ChatSessionRepository;
import com.bank.repository.SupportFAQRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupportChatService {

    private final SupportFAQRepository faqRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;

    @Transactional(readOnly = true)
    public List<SupportFAQResponse> getFaqs(String category) {
        List<SupportFAQ> faqs = (category != null && !category.isBlank())
                ? faqRepository.findByCategory(category.toUpperCase())
                : faqRepository.findAll();

        return faqs.stream()
                .map(this::mapFaqToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SupportFAQResponse> searchFaqs(String query) {
        if (query == null || query.isBlank()) {
            return Collections.emptyList();
        }
        return faqRepository.searchFaq(query.trim()).stream()
                .map(this::mapFaqToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageResponse processMessage(User user, ChatMessageRequest request) {
        ChatSession session;
        if (request.getSessionId() != null) {
            session = chatSessionRepository.findById(request.getSessionId())
                    .orElseGet(() -> chatSessionRepository.save(ChatSession.builder().user(user).build()));
        } else {
            session = chatSessionRepository.save(ChatSession.builder().user(user).build());
        }

        // Save User Message
        ChatMessage userMsg = ChatMessage.builder()
                .session(session)
                .sender("USER")
                .message(request.getMessage())
                .build();
        chatMessageRepository.save(userMsg);

        // Grounded deterministic FAQ matching
        String botReply = generateGroundedAnswer(request.getMessage());

        // Save Bot Message
        ChatMessage botMsg = ChatMessage.builder()
                .session(session)
                .sender("BOT")
                .message(botReply)
                .build();
        botMsg = chatMessageRepository.save(botMsg);

        return ChatMessageResponse.builder()
                .id(botMsg.getId())
                .sender(botMsg.getSender())
                .message(botMsg.getMessage())
                .createdAt(botMsg.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getSessionMessages(UUID sessionId) {
        ChatSession session = chatSessionRepository.findById(sessionId).orElse(null);
        if (session == null) {
            return Collections.emptyList();
        }
        return chatMessageRepository.findBySessionOrderByCreatedAtAsc(session).stream()
                .map(m -> ChatMessageResponse.builder()
                        .id(m.getId())
                        .sender(m.getSender())
                        .message(m.getMessage())
                        .createdAt(m.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private String generateGroundedAnswer(String query) {
        String normalized = query.toLowerCase().trim();

        // Safety check: prohibit financial actions via chat
        if (normalized.contains("transfer") && (normalized.contains("send money") || normalized.contains("transfer to") || normalized.contains("pay to"))) {
            return "For your security, fund transfers cannot be executed through chat. Please navigate to the 'Transfers' tab in your sidebar to safely send money.";
        }

        if (normalized.contains("password") && normalized.contains("change")) {
            return "You can change your password securely by navigating to 'Settings' > 'Change Password' in your dashboard navigation.";
        }

        // Search knowledge base
        List<SupportFAQ> matches = faqRepository.searchFaq(normalized);
        if (!matches.isEmpty()) {
            return matches.get(0).getAnswer();
        }

        // Fallback for partial token matching
        String[] tokens = normalized.split("\\s+");
        for (String token : tokens) {
            if (token.length() > 3) {
                List<SupportFAQ> tokenMatches = faqRepository.searchFaq(token);
                if (!tokenMatches.isEmpty()) {
                    return tokenMatches.get(0).getAnswer();
                }
            }
        }

        return "I couldn't find a direct answer in our banking knowledge base. Please check our FAQ categories above or visit Account Settings for self-service options.";
    }

    private SupportFAQResponse mapFaqToResponse(SupportFAQ f) {
        return SupportFAQResponse.builder()
                .id(f.getId())
                .category(f.getCategory())
                .question(f.getQuestion())
                .answer(f.getAnswer())
                .build();
    }
}
