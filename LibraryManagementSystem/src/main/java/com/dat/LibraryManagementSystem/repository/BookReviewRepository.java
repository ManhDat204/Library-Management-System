package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.model.BookReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BookReviewRepository extends JpaRepository<BookReview, Long> {
    Page<BookReview> findByBook(Book book, Pageable pageable);

    boolean existsByUserIdAndBookId(Long userId, Long bookId);

    long countByBookId(Long bookId);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM BookReview r WHERE r.book.id = :bookId")
    Double getAverageRatingByBookId(@Param("bookId") Long bookId);

    @Query("SELECT r.book, AVG(r.rating), COUNT(r.id) FROM BookReview r " +
            "WHERE r.book.active = true " +
            "GROUP BY r.book " +
            "ORDER BY AVG(r.rating) DESC, COUNT(r.id) DESC")
    List<Object[]> findTopRatedBooks(Pageable pageable);
}
