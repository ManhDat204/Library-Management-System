package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.mapper.BookMapper;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.model.BookLoan;
import com.dat.LibraryManagementSystem.payload.dto.BookDTO;
import com.dat.LibraryManagementSystem.repository.BookLoanRepository;
import com.dat.LibraryManagementSystem.repository.BookRepository;
import com.dat.LibraryManagementSystem.service.GeminiChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIRecommendationController {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookLoanRepository loanRepository;

    @Autowired
    private BookMapper bookMapper;

    @Autowired
    private GeminiChatService geminiChatService;

    @GetMapping("/recommend")
    public ResponseEntity<List<BookDTO>> recommendBooks(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "6") int limit) {
        try {
            List<BookLoan> userLoans = loanRepository.findAll().stream()
                    .filter(loan -> loan.getUser() != null && loan.getUser().getId().equals(userId))
                    .collect(Collectors.toList());

            if (userLoans.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            Map<Long, Integer> genreFrequency = new HashMap<>();
            Set<Long> borrowedBookIds = new HashSet<>();

            for (BookLoan loan : userLoans) {
                Book book = loan.getBook();
                if (book == null) {
                    continue;
                }
                if (book.getGenre() != null) {
                    Long genreId = book.getGenre().getId();
                    genreFrequency.put(genreId, genreFrequency.getOrDefault(genreId, 0) + 1);
                }
                borrowedBookIds.add(book.getId());
            }

            List<Long> topGenreIds = genreFrequency.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .limit(3)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());

            if (topGenreIds.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<Book> recommendations = bookRepository.findByGenreIdInAndIdNotIn(topGenreIds, borrowedBookIds)
                    .stream()
                    .limit(limit)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    recommendations.stream().map(bookMapper::toDTO).collect(Collectors.toList()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        Map<String, String> result = new HashMap<>();
        try {
            String message = request.get("message");
            result.put("response", geminiChatService.chat(message));
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            result.put("response", "Xin lỗi, hiện chatbot chưa phản hồi được. Bạn thử lại sau nhé.");
            return ResponseEntity.ok(result);
        }
    }

    @GetMapping("/similar/{bookId}")
    public ResponseEntity<List<BookDTO>> getSimilarBooks(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "6") int limit) {
        try {
            Book book = bookRepository.findById(bookId).orElse(null);
            if (book == null || book.getGenre() == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            List<Book> similarBooks = bookRepository.findByGenreId(book.getGenre().getId())
                    .stream()
                    .filter(b -> !b.getId().equals(bookId))
                    .limit(limit)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(
                    similarBooks.stream().map(bookMapper::toDTO).collect(Collectors.toList()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
}
