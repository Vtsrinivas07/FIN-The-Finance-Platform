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
    private final com.bank.repository.AccountRepository accountRepository;
    private final AiChatService aiChatService;

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

        // Grounded intelligent answer generation
        String botReply = generateGroundedAnswer(user, request.getMessage());

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

    private String generateGroundedAnswer(User user, String query) {
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

        // 6. Generative AI Engine (Google Gemini / OpenAI) with personalized grounding context
        if (aiChatService.isAiConfigured()) {
            try {
                String bankingContext = buildBankingGroundingContext(user);
                String aiAnswer = aiChatService.generateAiAnswer(raw, bankingContext);
                if (aiAnswer != null && !aiAnswer.isBlank()) {
                    return aiAnswer;
                }
            } catch (Exception ignored) {
                // Fallback to local grounded matcher
            }
        }

        // 7. Local Grounded Balance Inquiry
        boolean isBalanceInquiry = normalized.contains("balance") ||
                (normalized.contains("how much") && (normalized.contains("account") || normalized.contains("savings") || normalized.contains("have") || normalized.contains("money"))) ||
                normalized.equals("savings account") || normalized.equals("check balance") || normalized.equals("my balance");

        if (isBalanceInquiry) {
            if (user != null && accountRepository != null) {
                List<Account> userAccounts = accountRepository.findByUser(user);
                if (!userAccounts.isEmpty()) {
                    StringBuilder reply = new StringBuilder("Here are your current FIN account balance details:\n");
                    for (Account acc : userAccounts) {
                        String maskedAcc = maskAccountNumber(acc.getAccountNumber());
                        reply.append(String.format("• %s Account (%s): ₹%,.2f [%s]\n",
                                acc.getAccountType(), maskedAcc, acc.getBalance(), acc.getStatus()));
                    }
                    return reply.toString().trim();
                }
            }
            return "To check your live savings account balance, please log in to your FIN customer account or view your dashboard balance card.";
        }

        // 8. Stop-words filter to prevent spurious substring matching
        Set<String> stopWords = Set.of(
                "a", "about", "all", "an", "and", "are", "as", "at", "be", "by", "can", "do", "for",
                "from", "get", "how", "i", "in", "is", "it", "me", "much", "my", "of", "on", "or", "so",
                "that", "the", "this", "to", "what", "where", "which", "who", "why", "will", "with", "you", "your"
        );

        List<String> substantiveTokens = Arrays.stream(normalized.split("\\s+"))
                .filter(t -> t.length() >= 3 && !stopWords.contains(t))
                .toList();

        // 9. Grounded FAQ Knowledge Search
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

        return "I couldn't find an exact match for that question. You can ask me about money transfers, card controls, bill payments, account balances, or statements, or check the quick topics below.";
    }

    private String maskAccountNumber(String accNo) {
        if (accNo == null || accNo.length() < 4) return "••••";
        return "•••• " + accNo.substring(accNo.length() - 4);
    }

    private String buildBankingGroundingContext(User user) {
        StringBuilder sb = new StringBuilder();
        if (user != null && accountRepository != null) {
            sb.append("Authenticated Customer Session:\n");
            sb.append("- Customer Name: ").append(user.getFullName()).append("\n");
            sb.append("- Username: @").append(user.getUsername()).append("\n");
            List<Account> accounts = accountRepository.findByUser(user);
            for (Account acc : accounts) {
                String last4 = acc.getAccountNumber().substring(Math.max(0, acc.getAccountNumber().length() - 4));
                sb.append(String.format("- %s Account (ending in %s): Available Balance ₹%.2f | Status: %s\n",
                        acc.getAccountType(), last4, acc.getBalance(), acc.getStatus()));
            }
            sb.append("\nBanking Privacy & Compliance Rules:\n")
              .append("1. If the customer asks about their balance, answer directly and concisely with their available balance.\n")
              .append("2. Always refer to accounts by their masked suffix (e.g., 'ending in 6789') for privacy compliance.\n")
              .append("3. Never attempt to execute transactions or money transfers through chat. Direct them to the Transfers section.\n\n");
        }

        sb.append("Verified FIN Banking Services & FAQs:\n");
        List<SupportFAQ> faqs = faqRepository.findAll();
        for (SupportFAQ faq : faqs) {
            sb.append("Q: ").append(faq.getQuestion()).append(" | A: ").append(faq.getAnswer()).append("\n");
        }
        sb.append("\nApp Navigation Guide:\n")
          .append("- Dashboard: View account balances, recent ledger activity, and add funds.\n")
          .append("- Transfers: Send money to saved beneficiaries or new 12-digit account numbers with atomic double-entry bookkeeping.\n")
          .append("- Beneficiaries: Manage saved payees with IFSC and account numbers.\n")
          .append("- Bill Payments: Pay electricity, water, gas, internet bills, and recharge mobile/DTH subscriptions.\n")
          .append("- Cards: Freeze/unfreeze debit cards, toggle contactless/online/international channels, and adjust daily spending limits.\n")
          .append("- Analytics: Track monthly cashflow, savings rates, and expense category breakdown.\n")
          .append("- Transactions: Search, filter, and export transaction statements.\n")
          .append("- Settings: Profile details, security, and password updates.\n");
        return sb.toString();
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
