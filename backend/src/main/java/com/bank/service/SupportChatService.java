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
        if (query == null || query.trim().isEmpty()) {
            return "Hello! How can I assist you with your FIN account today?";
        }

        String raw = query.trim();
        String normalized = raw.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").replaceAll("\\s+", " ").trim();

        // 1. Conversational Greetings
        Set<String> greetings = Set.of("hi", "hello", "hey", "hola", "namaste", "greetings", "hey there", "hi there", "good morning", "good afternoon", "good evening", "howdy");
        if (greetings.contains(normalized) || normalized.matches("^(hi|hello|hey)\\b.*")) {
            return "Hello! Welcome to FIN Customer Support. How can I assist you today? You can ask about money transfers, card controls, bill payments, account balances, or statements.";
        }

        // 2. Appreciation & Courtesies
        Set<String> courtesies = Set.of("thanks", "thank you", "thx", "appreciate it", "great", "awesome", "perfect", "good", "ok", "okay", "bye", "goodbye");
        if (courtesies.contains(normalized)) {
            return "You're very welcome! If you need anything else with your FIN account, I'm here 24/7 to help. Have a wonderful day!";
        }

        // 3. Identity Inquiries
        if (normalized.equals("who are you") || normalized.equals("what is this") || normalized.equals("what are you") || normalized.contains("about fin")) {
            return "I am your FIN Banking Assistant. I can help guide you through money transfers, managing debit cards, paying bills, checking statements, and securing your account.";
        }

        // 4. Help Inquiries
        if (normalized.equals("help") || normalized.equals("options") || normalized.equals("what can you do") || normalized.equals("menu")) {
            return "I can assist you with:\n• Sending money & managing beneficiaries\n• Card security (freezing/unfreezing, spending limits)\n• Paying utility bills & telecom recharges\n• Checking statements & transaction history\n• Account security and password updates\n\nWhat would you like help with?";
        }

        // 5. Security Guardrails: Prohibit money movement directly through chat
        if (normalized.contains("transfer") && (normalized.contains("send money") || normalized.contains("transfer to") || normalized.contains("pay to") || normalized.matches(".*\\b\\d{3,}\\b.*"))) {
            return "For your security, fund transfers cannot be executed directly through chat. Please navigate to the 'Transfers' tab in your sidebar to safely send money.";
        }

        if (normalized.contains("password") && (normalized.contains("change") || normalized.contains("reset") || normalized.contains("forgot"))) {
            return "You can change your password securely by navigating to 'Settings' > 'Security' in your dashboard navigation.";
        }

        // 6. Stop-words filter to prevent spurious substring matching
        Set<String> stopWords = Set.of(
                "a", "about", "all", "an", "and", "are", "as", "at", "be", "by", "can", "do", "for",
                "from", "get", "how", "i", "in", "is", "it", "me", "my", "of", "on", "or", "so",
                "that", "the", "this", "to", "what", "where", "which", "who", "why", "will", "with", "you", "your"
        );

        List<String> substantiveTokens = Arrays.stream(normalized.split("\\s+"))
                .filter(t -> t.length() >= 3 && !stopWords.contains(t))
                .toList();

        // 7. Grounded FAQ Knowledge Search
        if (!substantiveTokens.isEmpty()) {
            // Try multi-word search first
            String substantiveQuery = String.join(" ", substantiveTokens);
            List<SupportFAQ> matches = faqRepository.searchFaq(substantiveQuery);
            if (!matches.isEmpty()) {
                return matches.get(0).getAnswer();
            }

            // Try individual substantive tokens
            for (String token : substantiveTokens) {
                if (token.length() >= 4) {
                    List<SupportFAQ> tokenMatches = faqRepository.searchFaq(token);
                    if (!tokenMatches.isEmpty()) {
                        return tokenMatches.get(0).getAnswer();
                    }
                }
            }
        }

        return "I couldn't find an exact match for that question. You can ask me about money transfers, card controls, bill payments, or statements, or check the quick topics below.";
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
