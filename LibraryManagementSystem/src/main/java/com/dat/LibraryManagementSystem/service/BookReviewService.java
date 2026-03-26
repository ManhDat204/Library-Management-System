package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.model.BookReview;
import com.dat.LibraryManagementSystem.payload.dto.BookRatingDTO;
import com.dat.LibraryManagementSystem.payload.dto.BookReviewDTO;
import com.dat.LibraryManagementSystem.payload.request.CreateReviewRequest;
import com.dat.LibraryManagementSystem.payload.request.UpdateReviewRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;

public interface BookReviewService {
    BookReviewDTO createReview(CreateReviewRequest request) throws Exception;

    BookReviewDTO updateReview(Long reviewId, UpdateReviewRequest request) throws Exception;

    void deleteReview(Long reviewId) throws Exception;

    PageResponse<BookReviewDTO> getReviewsByBookId(Long id, int page, int size) throws Exception;

    // Trả về rating trung bình + số lượng đánh giá của 1 cuốn sách
    BookRatingDTO getRatingByBookId(Long bookId) throws Exception;
}
