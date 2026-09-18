package com.bank.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class AiChatService {

    @Value("${app.ai.provider:auto}")
    private String provider;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${app.ai.openai.api-key:}")
    private String openaiApiKey;

    @Value("${app.ai.openai.base-url:https://api.openai.com/v1}")
    private String openaiBaseUrl;

    @Value("${app.ai.openai.model:gpt-4o-mini}")
    private String openaiModel;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    public boolean isAiConfigured() {
        return (geminiApiKey != null && !geminiApiKey.isBlank()) ||
               (openaiApiKey != null && !openaiApiKey.isBlank());
    }

    public String generateAiAnswer(String userMessage, String bankingContext) {
        if (geminiApiKey != null && !geminiApiKey.isBlank() &&
                ("auto".equalsIgnoreCase(provider) || "gemini".equalsIgnoreCase(provider))) {
            try {
                String answer = callGemini(userMessage, bankingContext);
                if (answer != null && !answer.isBlank()) {
                    return answer;
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back: {}", e.getMessage());
            }
        }

        if (openaiApiKey != null && !openaiApiKey.isBlank() &&
                ("auto".equalsIgnoreCase(provider) || "openai".equalsIgnoreCase(provider))) {
            try {
                String answer = callOpenAi(userMessage, bankingContext);
                if (answer != null && !answer.isBlank()) {
                    return answer;
                }
            } catch (Exception e) {
                log.warn("OpenAI API call failed, falling back: {}", e.getMessage());
            }
        }

        return null;
    }

    private String callGemini(String userMessage, String bankingContext) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + geminiModel + ":generateContent?key=" + geminiApiKey;

        String systemPrompt = "You are FIN Banking Assistant, an intelligent, helpful, and professional 24/7 digital banking support AI for FIN.\n" +
                "Ground your answers in the following verified FIN banking knowledge:\n" + bankingContext + "\n\n" +
                "Strict Security Rules:\n" +
                "1. If the user asks to transfer funds, pay bills, or move money, explain that for security reasons, financial transactions cannot be executed via chat. Direct them to the 'Transfers' or 'Bill Payments' tab in their navigation sidebar.\n" +
                "2. Be concise, polite, and direct (1-3 sentences).\n" +
                "3. Never make up account balances or sensitive credentials.";

        Map<String, Object> requestPayload = Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(Map.of("parts", List.of(Map.of("text", userMessage)))),
                "generationConfig", Map.of("temperature", 0.3, "maxOutputTokens", 300)
        );

        String jsonBody = objectMapper.writeValueAsString(requestPayload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode candidates = root.path("candidates");
            if (!candidates.isEmpty()) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (!parts.isEmpty()) {
                    return parts.get(0).path("text").asText().trim();
                }
            }
        } else {
            log.warn("Gemini returned non-200 status: {} - {}", response.statusCode(), response.body());
        }
        return null;
    }

    private String callOpenAi(String userMessage, String bankingContext) throws Exception {
        String url = openaiBaseUrl.replaceAll("/+$", "") + "/chat/completions";

        String systemPrompt = "You are FIN Banking Assistant, an intelligent, helpful, and professional 24/7 digital banking support AI for FIN.\n" +
                "Ground your answers in the following verified FIN banking knowledge:\n" + bankingContext + "\n\n" +
                "Strict Security Rules:\n" +
                "1. If the user asks to transfer funds, pay bills, or move money, explain that for security reasons, financial transactions cannot be executed via chat. Direct them to the 'Transfers' or 'Bill Payments' tab in their navigation sidebar.\n" +
                "2. Be concise, polite, and direct (1-3 sentences).\n" +
                "3. Never make up account balances or sensitive credentials.";

        Map<String, Object> requestPayload = Map.of(
                "model", openaiModel,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                ),
                "temperature", 0.3,
                "max_tokens", 300
        );

        String jsonBody = objectMapper.writeValueAsString(requestPayload);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + openaiApiKey)
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 200 && response.statusCode() < 300) {
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode choices = root.path("choices");
            if (!choices.isEmpty()) {
                return choices.get(0).path("message").path("content").asText().trim();
            }
        } else {
            log.warn("OpenAI returned non-200 status: {} - {}", response.statusCode(), response.body());
        }
        return null;
    }
}
