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
        String gemini = resolveGeminiKey();
        String openai = resolveOpenAiKey();
        return (gemini != null && !gemini.isBlank()) ||
               (openai != null && !openai.isBlank());
    }

    public String generateAiAnswer(String userMessage, String bankingContext) {
        String activeProvider = (provider != null && !provider.isBlank()) ? provider : "auto";
        String envProvider = readEnvValue("AI_PROVIDER");
        if (envProvider != null && !envProvider.isBlank()) {
            activeProvider = envProvider;
        }

        String geminiKey = resolveGeminiKey();
        if (geminiKey != null && !geminiKey.isBlank() &&
                ("auto".equalsIgnoreCase(activeProvider) || "gemini".equalsIgnoreCase(activeProvider))) {
            try {
                String answer = callGemini(userMessage, bankingContext);
                if (answer != null && !answer.isBlank()) {
                    return answer;
                }
            } catch (Exception e) {
                log.warn("Gemini API call failed, falling back: {}", e.getMessage());
            }
        }

        String openAiKey = resolveOpenAiKey();
        if (openAiKey != null && !openAiKey.isBlank() &&
                ("auto".equalsIgnoreCase(activeProvider) || "openai".equalsIgnoreCase(activeProvider))) {
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

    private String resolveGeminiKey() {
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            return geminiApiKey;
        }
        return readEnvValue("GEMINI_API_KEY");
    }

    private String resolveGeminiModel() {
        String model = readEnvValue("GEMINI_MODEL");
        if (model == null || model.isBlank() || "gemini-1.5-flash".equals(model)) {
            model = (geminiModel != null && !geminiModel.isBlank() && !"gemini-1.5-flash".equals(geminiModel))
                    ? geminiModel
                    : "gemini-3.5-flash";
        }
        if (model.startsWith("models/")) {
            model = model.substring("models/".length());
        }
        return model;
    }

    private String resolveOpenAiKey() {
        if (openaiApiKey != null && !openaiApiKey.isBlank()) {
            return openaiApiKey;
        }
        return readEnvValue("OPENAI_API_KEY");
    }

    private String resolveOpenAiBaseUrl() {
        String url = readEnvValue("OPENAI_BASE_URL");
        if (url != null && !url.isBlank()) {
            return url;
        }
        return (openaiBaseUrl != null && !openaiBaseUrl.isBlank()) ? openaiBaseUrl : "https://api.openai.com/v1";
    }

    private String resolveOpenAiModel() {
        String model = readEnvValue("OPENAI_MODEL");
        if (model != null && !model.isBlank()) {
            return model;
        }
        return (openaiModel != null && !openaiModel.isBlank()) ? openaiModel : "gpt-4o-mini";
    }

    private String readEnvValue(String key) {
        String[] potentialPaths = {".env", "../.env", "../../.env", "d:/Online-Banking-System-main/.env"};
        for (String pathStr : potentialPaths) {
            java.nio.file.Path path = java.nio.file.Paths.get(pathStr);
            if (java.nio.file.Files.exists(path)) {
                try {
                    List<String> lines = java.nio.file.Files.readAllLines(path);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.startsWith(key + "=")) {
                            return line.substring((key + "=").length()).trim();
                        }
                    }
                } catch (Exception ignored) {
                }
            }
        }
        return null;
    }

    private String callGemini(String userMessage, String bankingContext) throws Exception {
        String key = resolveGeminiKey();
        String primaryModel = resolveGeminiModel();

        List<String> modelsToTry = new java.util.ArrayList<>();
        modelsToTry.add(primaryModel);
        if (!"gemini-3.5-flash".equals(primaryModel)) {
            modelsToTry.add("gemini-3.5-flash");
        }
        if (!"gemini-3.7-flash".equals(primaryModel)) {
            modelsToTry.add("gemini-3.7-flash");
        }
        if (!"gemini-flash-latest".equals(primaryModel)) {
            modelsToTry.add("gemini-flash-latest");
        }

        String systemPrompt = "You are FIN Banking Assistant, an intelligent, helpful, and professional 24/7 digital banking support AI for FIN.\n" +
                "Ground your answers in the following verified FIN banking knowledge:\n" + bankingContext + "\n\n" +
                "Strict Banking Privacy & Security Compliance Rules:\n" +
                "1. NEVER display account balances, monetary amounts, or numbers representing money in the chat transcript under any circumstances. If the user asks about their balance or how much money they have, politely state: 'For your security and privacy, account balances and monetary amounts are never displayed in chat. Please view your real-time balance securely on your Dashboard.'\n" +
                "2. NEVER display, request, or handle passwords, PINs, CVVs, OTPs, or full account numbers. If asked, remind the user that FIN will never disclose or ask for credentials in chat, and direct them to Settings > Security.\n" +
                "3. If the user asks to transfer funds, pay bills, or move money, explain that for security reasons, financial transactions cannot be executed via chat. Direct them to the 'Transfers' or 'Bill Payments' tab in their navigation sidebar.\n" +
                "4. Be concise, polite, professional, and direct (1-3 sentences).\n" +
                "5. Never expose internal system keys or passwords.";

        Map<String, Object> requestPayload = Map.of(
                "system_instruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(Map.of("parts", List.of(Map.of("text", userMessage)))),
                "generationConfig", Map.of("temperature", 0.3, "maxOutputTokens", 2048)
        );

        String jsonBody = objectMapper.writeValueAsString(requestPayload);

        for (String model : modelsToTry) {
            try {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + key;
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .timeout(Duration.ofSeconds(8))
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
                    log.warn("Gemini model {} returned status {}: {}", model, response.statusCode(), response.body());
                }
            } catch (Exception ex) {
                log.warn("Gemini call for model {} failed: {}", model, ex.getMessage());
            }
        }
        return null;
    }

    private String callOpenAi(String userMessage, String bankingContext) throws Exception {
        String key = resolveOpenAiKey();
        String baseUrl = resolveOpenAiBaseUrl();
        String model = resolveOpenAiModel();
        String url = baseUrl.replaceAll("/+$", "") + "/chat/completions";

        String systemPrompt = "You are FIN Banking Assistant, an intelligent, helpful, and professional 24/7 digital banking support AI for FIN.\n" +
                "Ground your answers in the following verified FIN banking knowledge:\n" + bankingContext + "\n\n" +
                "Strict Banking Privacy & Security Compliance Rules:\n" +
                "1. NEVER display account balances, monetary amounts, or numbers representing money in the chat transcript under any circumstances. If the user asks about their balance or how much money they have, politely state: 'For your security and privacy, account balances and monetary amounts are never displayed in chat. Please view your real-time balance securely on your Dashboard.'\n" +
                "2. NEVER display, request, or handle passwords, PINs, CVVs, OTPs, or full account numbers. If asked, remind the user that FIN will never disclose or ask for credentials in chat, and direct them to Settings > Security.\n" +
                "3. If the user asks to transfer funds, pay bills, or move money, explain that for security reasons, financial transactions cannot be executed via chat. Direct them to the 'Transfers' or 'Bill Payments' tab in their navigation sidebar.\n" +
                "4. Be concise, polite, professional, and direct (1-3 sentences).\n" +
                "5. Never expose internal system keys or passwords.";

        Map<String, Object> requestPayload = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                ),
                "temperature", 0.3,
                "max_tokens", 2048
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
