package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.mapper.BookMapper;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.model.BookLoan;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.BookDTO;
import com.dat.LibraryManagementSystem.repository.BookLoanRepository;
import com.dat.LibraryManagementSystem.repository.BookRepository;
import com.dat.LibraryManagementSystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
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
    private UserRepository userRepository;
    @Autowired
    private BookMapper bookMapper;

    /**
     * Gợi ý sách dựa trên lịch sử mượn của user
     * 1. Lấy top 3 thể loại mà user mượn nhiều nhất
     * 2. Trả về những sách từ các thể loại này mà user chưa mượn
     */
    @GetMapping("/recommend")
    public ResponseEntity<List<BookDTO>> recommendBooks(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "6") int limit) {
        try {
            // 1. Lấy lịch sử mượn của user (không cần Pageable)
            List<BookLoan> userLoans = loanRepository.findAll().stream()
                    .filter(loan -> loan.getUser().getId().equals(userId))
                    .collect(Collectors.toList());

            if (userLoans.isEmpty()) {
                // Nếu chưa mượn sách nào, trả về sách mới nhất
                return ResponseEntity.ok(new ArrayList<>());
            }

            // 2. Phân tích thể loại yêu thích
            Map<Long, Integer> genreFrequency = new HashMap<>();
            Set<Long> borrowedBookIds = new HashSet<>();

            for (BookLoan loan : userLoans) {
                Book book = loan.getBook();
                if (book != null && book.getGenre() != null) {
                    Long genreId = book.getGenre().getId();
                    genreFrequency.put(genreId, genreFrequency.getOrDefault(genreId, 0) + 1);
                }
                borrowedBookIds.add(book.getId());
            }

            // 3. Lấy top 3 thể loại
            List<Long> topGenreIds = genreFrequency.entrySet().stream()
                    .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                    .limit(3)
                    .map(Map.Entry::getKey)
                    .collect(Collectors.toList());

            if (topGenreIds.isEmpty()) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            // 4. Lấy sách từ các thể loại top, trừ những đã mượn
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

    /**
     * Chat endpoint - placeholder cho tích hợp AI sau
     */
    @PostMapping("/chat")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        try {
            String message = request.get("message");
            String response = "Xin chào! Tôi là trợ lý sách 📚. Bạn cần giúp đỡ gì? (Tính năng này sẽ được nâng cấp)";

            Map<String, String> result = new HashMap<>();
            result.put("response", response);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    /**
     * Tìm sách tương tự
     */
    @GetMapping("/similar/{bookId}")
    public ResponseEntity<List<BookDTO>> getSimilarBooks(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "6") int limit) {
        try {
            Book book = bookRepository.findById(bookId).orElse(null);
            if (book == null) {
                return ResponseEntity.ok(new ArrayList<>());
            }

            // Tìm sách cùng thể loại, trừ chính nó
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