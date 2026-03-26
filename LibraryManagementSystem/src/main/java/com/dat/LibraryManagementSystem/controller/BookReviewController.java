package com.dat.LibraryManagementSystem.controller;


import com.dat.LibraryManagementSystem.model.BookReview;
import com.dat.LibraryManagementSystem.payload.dto.BookRatingDTO;
import com.dat.LibraryManagementSystem.payload.dto.BookReviewDTO;
import com.dat.LibraryManagementSystem.payload.request.CreateFineRequest;
import com.dat.LibraryManagementSystem.payload.request.CreateReviewRequest;
import com.dat.LibraryManagementSystem.payload.request.UpdateReviewRequest;
import com.dat.LibraryManagementSystem.payload.response.ApiResponse;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.service.BookReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reviews")
public class BookReviewController {
    private final BookReviewService bookReviewService;

    @PostMapping
    public ResponseEntity<?> createReview(
            @Valid @RequestBody CreateReviewRequest request
            ) throws Exception{
        BookReviewDTO reviewDTO  = bookReviewService.createReview(request);
        return ResponseEntity.ok(reviewDTO);
    }


    @PutMapping("/{id}")
    public ResponseEntity<?> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewRequest request
    ) throws Exception{
        BookReviewDTO reviewDTO  = bookReviewService.updateReview(id, request);
        return ResponseEntity.ok(reviewDTO);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) throws Exception{
        bookReviewService.deleteReview(reviewId);
        return ResponseEntity.ok(new ApiResponse("Xoa review thanh cong", true));
    }


    @GetMapping("book/{bookId}")
    public ResponseEntity<PageResponse<BookReviewDTO>> getReviewsByBook(
            @PathVariable Long bookId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) throws Exception {
        PageResponse<BookReviewDTO> reviews =bookReviewService.getReviewsByBookId(bookId,page, size);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/book/{bookId}/rating")
    public ResponseEntity<BookRatingDTO> getBookRating(
            @PathVariable Long bookId) throws Exception {
        return ResponseEntity.ok(bookReviewService.getRatingByBookId(bookId));
    }

}
