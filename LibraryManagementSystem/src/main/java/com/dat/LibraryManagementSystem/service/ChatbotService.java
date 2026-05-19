package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.model.Genre;
import com.dat.LibraryManagementSystem.repository.BookRepository;
import com.dat.LibraryManagementSystem.repository.BookReviewRepository;
import com.dat.LibraryManagementSystem.repository.GenreRepository;
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
public class ChatbotService {


    private static final int BOOK_CONTEXT_LIMIT = 20;
    private static final Set<String> STOP_WORDS = Set.of(
            "toi", "minh", "ban", "cho", "can", "muon", "tim", "sach", "cuon", "quyen",
            "goi", "y", "ve", "la", "co", "khong", "nao", "hay", "doc", "giup", "voi",
            "nhung", "cac", "mot", "nhieu", "it", "trong", "thu", "vien");

    private final BookRepository bookRepository;
    private final GenreRepository genreRepository;
    private final BookReviewRepository bookReviewRepository;



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
                Bạn là trợ lý AI của hệ thống quản lý thư viện Bookify.
                Trả lời bằng tiếng Việt, rõ ràng, ngắn gọn, thân thiện.
                Khi người dùng hỏi về sách, chỉ dựa trên danh sách sách được cung cấp.
                Nếu dữ liệu chưa đủ, hãy nói rõ là hệ thống chưa có dữ liệu phù hợp.
                Không bịa tên sách, tác giả, số lượng còn lại hoặc thông tin không có trong ngữ cảnh.
                        Neu goi y sach, hay trinh bay tung cuon theo dung cau truc:
                        Ten sach: ...
                        Tac gia: ...
                        The loai: ...
                        So ban con lai: ...
                        Mo ta ngan: ...
                        Ly do nen doc: ...
                        Anh bia: [IMG:url]
                        
                        Khong dat [IMG:url] ngay sau ten sach hoặc giua cau.
                QUAN TRỌNG: Không dùng ký hiệu markdown như **, *, #, ##.
                        Khi gioi thieu sach co anh bia, khong chen anh vao giua cau.
                        Hay dat anh bia tren mot dong rieng o cuoi thong tin cua tung cuon sach theo dinh dang [IMG:url].
                        Dinh dang goi y cho moi cuon:
                        Ten sach: ...
                        Tac gia: ...
                        The loai: ...
                        So ban con lai: ...
                        Mo ta ngan: ...
                        Anh bia: [IMG:url]
                """);

        ArrayNode contents = root.putArray("contents");
        ObjectNode content = contents.addObject();
        content.put("role", "user");
        content.putArray("parts").addObject().put("text", prompt);

        ObjectNode generationConfig = root.putObject("generationConfig");
        generationConfig.put("temperature", 0.7);
        generationConfig.put("maxOutputTokens", 2048);

        return root.toString();
    }

    private String buildPrompt(String message, List<Book> books) {
        return """
        Cau hoi cua nguoi dung:
        %s

        Tong quan he thong Bookify:
        %s

        Du lieu sach lien quan den cau hoi:
        %s

        Huong dan tra loi:
        - Neu nguoi dung hoi tong quan ve thu vien, quy trinh, phi phat, goi thanh vien, trang thai don, hay dung phan Tong quan he thong.
        - Neu nguoi dung hoi goi y sach hoac tim sach, hay dung ca Tong quan he thong va Du lieu sach lien quan.
        - Chi tra loi dua tren du lieu duoc cung cap.
        - Neu khong co du lieu phu hop, noi ro rang la he thong chua co du lieu phu hop.
        - Khong bia ten sach, tac gia, so luong, phi phat hoac quy dinh khong nam trong context.
        - Tra loi bang tieng Viet, ro rang, ngan gon.
        """.formatted(message, buildSystemOverviewContext(), buildBookContext(books));
    }
    private String buildSystemOverviewContext() {
        StringBuilder context = new StringBuilder();

        context.append("""
        Bookify la he thong quan ly thu vien online, ho tro nguoi dung tim sach, muon sach, giao sach, tra sach, quan ly vi, goi thanh vien va phi phat.

        Quy trinh muon sach:
        - Nguoi dung can dang nhap.
        - Nguoi dung can co goi thanh vien dang hoat dong.
        - Nguoi dung can co dia chi mac dinh.
        - Sach phai dang active va con availableCopies > 0.
        - Nguoi dung khong duoc co sach qua han.
        - Nguoi dung khong duoc co phi phat dang cho thanh toan.
        - Khi muon sach, he thong tao BookLoan trang thai CHECK_OUT va tru availableCopies cua sach.
        - Neu sach co gia, he thong khoa tien coc trong vi bang gia sach.

        Quy trinh giao va tra sach:
        - CHECK_OUT: don moi tao, cho thu vien xu ly giao.
        - SHIPPING: sach dang duoc van chuyen.
        - DELIVERED: nguoi dung da nhan sach va dang muon.
        - OVERDUE: sach qua han tra.
        - PENDING_RETURN: nguoi dung da gui yeu cau tra, cho admin/nhan vien duyet.
        - RETURNED: sach da tra thanh cong.
        - LOST: sach bi mat.
        - DAMAGED: sach bi hu hong.

        Quy dinh phi:
        - Tra qua han bi phat 5.000 VND moi ngay.
        - Khi tra sach thanh cong, he thong hoan tien coc va tru phi tra sach 20.000 VND.
        - Neu sach bi mat hoac hu hong, he thong tao phi phat theo tinh trang sach.
        """);

        try {
            long totalActiveBooks = bookRepository.countByActiveTrue();
            long totalAvailableBooks = bookRepository.countAvailableBooks();

            context.append("\nThong ke thu vien hien tai:\n");
            context.append("- Tong sach dang hoat dong: ").append(totalActiveBooks).append("\n");
            context.append("- Tong sach con co the muon: ").append(totalAvailableBooks).append("\n");

            List<Genre> genres = genreRepository.findByActiveTrueOrderByNameAsc();
            if (!genres.isEmpty()) {
                context.append("- The loai hien co: ");
                context.append(genres.stream()
                        .limit(20)
                        .map(Genre::getName)
                        .filter(name -> name != null && !name.isBlank())
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("Chua co du lieu"));
                context.append("\n");
            }

            List<Book> topBorrowedBooks = bookRepository.findTopBorrowedBooks(PageRequest.of(0, 5));
            if (!topBorrowedBooks.isEmpty()) {
                context.append("- Sach duoc muon nhieu: ");
                context.append(topBorrowedBooks.stream()
                        .map(Book::getTitle)
                        .filter(title -> title != null && !title.isBlank())
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("Chua co du lieu"));
                context.append("\n");
            }

            List<Object[]> topRatedRows = bookReviewRepository.findTopRatedBooks(PageRequest.of(0, 5));
            if (!topRatedRows.isEmpty()) {
                context.append("- Sach duoc danh gia cao: ");
                context.append(topRatedRows.stream()
                        .map(row -> (Book) row[0])
                        .map(Book::getTitle)
                        .filter(title -> title != null && !title.isBlank())
                        .reduce((a, b) -> a + ", " + b)
                        .orElse("Chua co du lieu"));
                context.append("\n");
            }
        } catch (Exception e) {
            context.append("\nThong ke thu vien hien tai: Chua lay duoc du lieu thong ke.\n");
        }

        return context.toString();
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
                    .append(" | Ảnh: ").append(safe(book.getCoverImageUrl()))
                    .append(" | Title: ").append(safe(book.getTitle()))
                    .append(" | Tác Giả: ").append(book.getAuthor() != null ? safe(book.getAuthor().getAuthorName()) : "Khong ro")
                    .append(" | Thể loại: ").append(book.getGenre() != null ? safe(book.getGenre().getName()) : "Khong ro")
                    .append(" | Còn: ").append(book.getAvailableCopies() != null ? book.getAvailableCopies() : 0)
                    .append("/").append(book.getTotalCopies() != null ? book.getTotalCopies() : 0);

            if (book.getDescription() != null && !book.getDescription().isBlank()) {
                context.append(" | Mô tả: ").append(truncate(book.getDescription(), 180));
            }
            context.append("\n");
        }
        return context.toString();
    }

    private List<Book> findCandidateBooks(String message) {
        List<String> tokens = extractTokens(message);

        if (tokens.isEmpty()) {
            return bookRepository.findActiveBooksForChat(PageRequest.of(0, BOOK_CONTEXT_LIMIT));
        }

        List<Book> candidates = new ArrayList<>();
        Set<Long> addedIds = new HashSet<>();

        for (String token : tokens) {
            if (candidates.size() >= BOOK_CONTEXT_LIMIT) {
                break;
            }

            List<Book> foundBooks = bookRepository.searchActiveBooksForChat(
                    token,
                    PageRequest.of(0, BOOK_CONTEXT_LIMIT)
            );

            for (Book book : foundBooks) {
                if (book.getId() != null && !addedIds.contains(book.getId())) {
                    candidates.add(book);
                    addedIds.add(book.getId());
                }

                if (candidates.size() >= BOOK_CONTEXT_LIMIT) {
                    break;
                }
            }
        }

        if (!candidates.isEmpty()) {
            return candidates;
        }

        return bookRepository.findActiveBooksForChat(PageRequest.of(0, BOOK_CONTEXT_LIMIT));
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
