package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.repository.BookRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class GeminiChatService {

    private static final int BOOK_SCAN_LIMIT = 120;
    private static final int BOOK_CONTEXT_LIMIT = 20;
    private static final Set<String> STOP_WORDS = Set.of(
            "toi", "minh", "ban", "cho", "can", "muon", "tim", "sach", "cuon", "quyen",
            "goi", "y", "ve", "la", "co", "khong", "nao", "hay", "doc", "giup", "voi",
            "nhung", "cac", "mot", "nhieu", "it", "trong", "thu", "vien");

    private final BookRepository bookRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-2.5-flash}")
    private String model;

    @Value("${gemini.fallback-models:gemini-2.5-flash-lite,gemini-2.0-flash}")
    private String fallbackModels;

    public String chat(String message) throws Exception {
        if (message == null || message.isBlank()) {
            return "Bạn muốn tìm sách hay cần tôi hỗ trợ gì trong thư viện?";
        }
        if (apiKey == null || apiKey.isBlank()) {
            return "Chatbot chua duoc cau hinh Gemini API key.";
        }

        List<Book> books = findCandidateBooks(message);
        String prompt = buildPrompt(message.trim(), books);
        String requestBody = buildGeminiRequestBody(prompt);

        IllegalStateException lastError = null;
        for (String modelName : getCandidateModels()) {
            HttpResponse<String> response = callGemini(modelName, requestBody);
            if (response.statusCode() < 400) {
                String text = extractText(response.body());
                if (!text.isBlank()) {
                    return text;
                }
                lastError = new IllegalStateException("Gemini API returned an empty response from model " + modelName);
                continue;
            }

            lastError = new IllegalStateException(
                    "Gemini API error on " + modelName + ": " + response.statusCode() + " - " + extractError(response.body()));
            if (!shouldTryNextModel(response.statusCode())) {
                throw lastError;
            }
        }

        throw lastError != null ? lastError : new IllegalStateException("Gemini API did not return a response.");
    }

    private HttpResponse<String> callGemini(String modelName, String requestBody) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(buildGeminiUri(modelName))
                .timeout(Duration.ofSeconds(30))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", apiKey)
                .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                .build();

        return httpClient.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
    }

    private URI buildGeminiUri(String modelName) {
        return URI.create("https://generativelanguage.googleapis.com/v1beta/models/"
                + URLEncoder.encode(modelName, StandardCharsets.UTF_8) + ":generateContent");
    }

    private List<String> getCandidateModels() {
        LinkedHashSet<String> models = new LinkedHashSet<>();
        if (model != null && !model.isBlank()) {
            models.add(model.trim());
        }
        if (fallbackModels != null && !fallbackModels.isBlank()) {
            Arrays.stream(fallbackModels.split(","))
                    .map(String::trim)
                    .filter(value -> !value.isBlank())
                    .forEach(models::add);
        }
        return new ArrayList<>(models);
    }

    private boolean shouldTryNextModel(int statusCode) {
        return statusCode == 404 || statusCode == 429 || statusCode == 500
                || statusCode == 502 || statusCode == 503 || statusCode == 504;
    }

    private String buildGeminiRequestBody(String prompt) {
        ObjectNode root = objectMapper.createObjectNode();

        ObjectNode systemInstruction = root.putObject("system_instruction");
        systemInstruction.putArray("parts")
                .addObject()
                .put("text", """
                        Ban la tro ly AI cua he thong quan ly thu vien SachHay.
                        Tra loi bang tieng Viet, ro rang, ngan gon, than thien.
                        Khi nguoi dung hoi ve sach trong thu vien, chi dua tren danh sach sach duoc cung cap.
                        Neu du lieu chua du, hay noi ro la he thong chua co du lieu phu hop.
                        Khong bia ten sach, tac gia, so luong con lai hoac thong tin khong co trong ngu canh.
                        """);

        ArrayNode contents = root.putArray("contents");
        ObjectNode content = contents.addObject();
        content.put("role", "user");
        content.putArray("parts").addObject().put("text", prompt);

        ObjectNode generationConfig = root.putObject("generationConfig");
        generationConfig.put("temperature", 0.4);
        generationConfig.put("maxOutputTokens", 700);

        return root.toString();
    }

    private String buildPrompt(String message, List<Book> books) {
        return """
                Cau hoi cua nguoi dung:
                %s
                Du lieu sach co trong he thong:
                %s
                Hay tra loi truc tiep cau hoi. Neu goi y sach, uu tien sach con ban co san va neu ly do ngan gon.
                """.formatted(message, buildBookContext(books));
    }

    private String buildBookContext(List<Book> books) {
        if (books.isEmpty()) {
            return "Chua co sach phu hop trong du lieu hien tai.";
        }

        StringBuilder context = new StringBuilder();
        for (int i = 0; i < books.size(); i++) {
            Book book = books.get(i);
            context.append(i + 1)
                    .append(". ID: ").append(book.getId())
                    .append(" | Ten: ").append(safe(book.getTitle()))
                    .append(" | Tac gia: ").append(book.getAuthor() != null ? safe(book.getAuthor().getAuthorName()) : "Khong ro")
                    .append(" | The loai: ").append(book.getGenre() != null ? safe(book.getGenre().getName()) : "Khong ro")
                    .append(" | Con: ").append(book.getAvailableCopies() != null ? book.getAvailableCopies() : 0)
                    .append("/").append(book.getTotalCopies() != null ? book.getTotalCopies() : 0);

            if (book.getDescription() != null && !book.getDescription().isBlank()) {
                context.append(" | Mo ta: ").append(truncate(book.getDescription(), 180));
            }
            context.append("\n");
        }
        return context.toString();
    }

    private List<Book> findCandidateBooks(String message) {
        List<Book> allBooks = bookRepository.findActiveBooksForChat(PageRequest.of(0, BOOK_SCAN_LIMIT));
        List<String> tokens = extractTokens(message);
        if (tokens.isEmpty()) {
            return allBooks.stream().limit(BOOK_CONTEXT_LIMIT).toList();
        }

        List<Book> matched = allBooks.stream()
                .filter(book -> matchesAnyToken(book, tokens))
                .limit(BOOK_CONTEXT_LIMIT)
                .toList();

        if (matched.size() >= 8) {
            return matched;
        }

        List<Book> candidates = new ArrayList<>(matched);
        Set<Long> addedIds = new HashSet<>();
        matched.stream().map(Book::getId).forEach(addedIds::add);

        for (Book book : allBooks) {
            if (candidates.size() >= BOOK_CONTEXT_LIMIT) {
                break;
            }
            if (book.getId() == null || !addedIds.contains(book.getId())) {
                candidates.add(book);
                if (book.getId() != null) {
                    addedIds.add(book.getId());
                }
            }
        }
        return candidates;
    }

    private boolean matchesAnyToken(Book book, List<String> tokens) {
        String searchable = normalize(String.join(" ",
                safe(book.getTitle()),
                book.getAuthor() != null ? safe(book.getAuthor().getAuthorName()) : "",
                book.getGenre() != null ? safe(book.getGenre().getName()) : "",
                safe(book.getDescription())));

        return tokens.stream().anyMatch(searchable::contains);
    }

    private List<String> extractTokens(String message) {
        String normalized = normalize(message);
        return List.of(normalized.split("\\s+")).stream()
                .filter(token -> token.length() >= 2)
                .filter(token -> !STOP_WORDS.contains(token))
                .distinct()
                .toList();
    }

    private String extractText(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode parts = root.path("candidates").path(0).path("content").path("parts");
        if (!parts.isArray()) {
            return "";
        }

        StringBuilder text = new StringBuilder();
        for (JsonNode part : parts) {
            String value = part.path("text").asText("");
            if (!value.isBlank()) {
                text.append(value);
            }
        }
        return text.toString().trim();
    }

    private String extractError(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            return root.path("error").path("message").asText("Unknown error");
        } catch (Exception e) {
            return "Unknown error";
        }
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }
        String noAccents = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return noAccents.toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}\\s]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    private String safe(String value) {
        return value != null ? value : "";
    }

    private String truncate(String value, int maxLength) {
        String normalized = value.replaceAll("\\s+", " ").trim();
        if (normalized.length() <= maxLength) {
            return normalized;
        }
        return normalized.substring(0, maxLength) + "...";
    }
}
