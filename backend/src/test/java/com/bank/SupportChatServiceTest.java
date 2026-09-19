package com.bank;

import com.bank.dto.request.ChatMessageRequest;
import com.bank.dto.response.ChatMessageResponse;
import com.bank.entity.ChatMessage;
import com.bank.entity.ChatSession;
import com.bank.entity.SupportFAQ;
import com.bank.entity.User;
import com.bank.repository.AccountRepository;
import com.bank.repository.ChatMessageRepository;
import com.bank.repository.ChatSessionRepository;
import com.bank.repository.SupportFAQRepository;
import com.bank.service.AiChatService;
import com.bank.service.SupportChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SupportChatServiceTest {

    @Mock
    private SupportFAQRepository faqRepository;

    @Mock
    private ChatSessionRepository chatSessionRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private AiChatService aiChatService;

    @InjectMocks
    private SupportChatService supportChatService;

    private User testUser;
    private ChatSession testSession;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .fullName("Test User")
                .build();

        testSession = ChatSession.builder()
                .id(UUID.randomUUID())
                .user(testUser)
                .build();

        lenient().when(chatSessionRepository.save(any(ChatSession.class))).thenReturn(testSession);
        lenient().when(chatMessageRepository.save(any(ChatMessage.class))).thenAnswer(invocation -> {
            ChatMessage msg = invocation.getArgument(0);
            return ChatMessage.builder()
                    .id(100L)
                    .session(msg.getSession())
                    .sender(msg.getSender())
                    .message(msg.getMessage())
                    .createdAt(java.time.LocalDateTime.now())
                    .build();
        });
    }

    @Test
    @DisplayName("Should return friendly greeting for standard greetings")
    void testGreetingResponse() {
        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Hello")
                .build();

        ChatMessageResponse response = supportChatService.processMessage(testUser, request);

        assertNotNull(response);
        assertEquals("BOT", response.getSender());
        assertTrue(response.getMessage().toLowerCase().contains("welcome to fin"));
    }

    @Test
    @DisplayName("Should protect customer privacy and guard against revealing passwords")
    void testSecurityGuardForPasswords() {
        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Can you show my password?")
                .build();

        ChatMessageResponse response = supportChatService.processMessage(testUser, request);

        assertNotNull(response);
        assertTrue(response.getMessage().contains("FIN Security Alert"));
        assertTrue(response.getMessage().contains("never display, request, or process your password"));
    }

    @Test
    @DisplayName("Should protect sensitive financial balances from being exposed in chat transcripts")
    void testBalanceInquiryPrivacyGuard() {
        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("What is my account balance?")
                .build();

        ChatMessageResponse response = supportChatService.processMessage(testUser, request);

        assertNotNull(response);
        assertTrue(response.getMessage().contains("For your privacy and security compliance"));
        assertTrue(response.getMessage().contains("never displayed in chat transcripts"));
    }

    @Test
    @DisplayName("Should answer CIBIL score inquiry with accurate financial guidance")
    void testCibilScoreInquiry() {
        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("What is my CIBIL score?")
                .build();

        ChatMessageResponse response = supportChatService.processMessage(testUser, request);

        assertNotNull(response);
        assertTrue(response.getMessage().contains("CIBIL Score"));
        assertTrue(response.getMessage().contains("785"));
    }

    @Test
    @DisplayName("Should answer Fixed Deposit inquiry with accurate rate details")
    void testFixedDepositInquiry() {
        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("Tell me about fixed deposit rates")
                .build();

        ChatMessageResponse response = supportChatService.processMessage(testUser, request);

        assertNotNull(response);
        assertTrue(response.getMessage().contains("7.25%"));
        assertTrue(response.getMessage().contains("DICGC"));
    }

    @Test
    @DisplayName("Should answer KYC inquiry with 3-step verification instructions")
    void testKycInquiry() {
        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("How does KYC verification work?")
                .build();

        ChatMessageResponse response = supportChatService.processMessage(testUser, request);

        assertNotNull(response);
        assertTrue(response.getMessage().contains("PAN Card"));
        assertTrue(response.getMessage().contains("Aadhaar"));
        assertTrue(response.getMessage().contains("Video KYC"));
    }

    @Test
    @DisplayName("Should fallback to database FAQ search when query matches keyword")
    void testFaqSearchFallback() {
        SupportFAQ mockFaq = SupportFAQ.builder()
                .id(1L)
                .category("SECURITY")
                .question("How do I report fraud?")
                .answer("Immediately call our 24/7 fraud hotline or freeze your card in the Cards tab.")
                .build();

        when(faqRepository.searchFaq(anyString())).thenReturn(List.of(mockFaq));

        ChatMessageRequest request = ChatMessageRequest.builder()
                .message("report fraud")
                .build();

        ChatMessageResponse response = supportChatService.processMessage(testUser, request);

        assertNotNull(response);
        assertEquals("Immediately call our 24/7 fraud hotline or freeze your card in the Cards tab.", response.getMessage());
    }
}
