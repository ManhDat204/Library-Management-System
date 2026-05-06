package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.model.Author;
import com.dat.LibraryManagementSystem.model.Book;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Page;

import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface BookRepository extends JpaRepository<Book, Long> {

        Optional<Book> findByIsbn(String isbn);

        boolean existsByIsbn(String isbn);

        List<Book> findByAuthor(Author author);

        @Query("SELECT b FROM Book b LEFT JOIN b.author a WHERE " +
                        "(:searchTerm IS NULL OR " +
                        "LOWER(b.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                        "LOWER(a.authorName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                        "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) AND " +
                        "(:genreId IS NULL OR b.genre.id = :genreId) AND " +
                        "(:authorId IS NULL OR b.author.id = :authorId) AND " +
                        "(:publisherId IS NULL OR b.publisher.id = :publisherId) AND " +
                        "(:minPrice IS NULL OR b.price >= :minPrice) AND " +
                        "(:maxPrice IS NULL OR b.price <= :maxPrice) AND " +
                        "(:availableOnly IS NULL OR :availableOnly = false OR b.availableCopies > 0) AND " +
                        "b.active = true")
        Page<Book> searchBookWithFilters(
                        @Param("searchTerm") String searchTerm,
                        @Param("genreId") Long genreId,
                        @Param("authorId") Long authorId,
                        @Param("publisherId") Long publisherId,
                        @Param("minPrice") Double minPrice,
                        @Param("maxPrice") Double maxPrice,
                        @Param("availableOnly") Boolean availableOnly,
                        Pageable pageable);

        long countByActiveTrue();

        @Query("select count(b) from Book b where b.availableCopies>0 and b.active = true")
        long countAvailableBooks();

        // Top 5 sách mượn nhiều nhất
        @Query("SELECT b FROM Book b " +
                        "WHERE b.active = true ORDER BY (SELECT COUNT(bl) FROM BookLoan bl WHERE bl.book.id = b.id) DESC")
        List<Book> findTopBorrowedBooks(Pageable pageable);

        @Query("SELECT b FROM Book b WHERE b.active = true AND ( SELECT COUNT(bl) FROM BookLoan bl " +
                        "WHERE bl.book.id = b.id) <= :maxLoans ORDER BY ( SELECT COUNT(bl) FROM BookLoan bl WHERE bl.book.id = b.id) ASC")
        List<Book> findLeastBorrowedBooks(@Param("maxLoans") long maxLoans, Pageable pageable);

        @Query("SELECT COUNT(bl) FROM BookLoan bl WHERE bl.book.id = :bookId")
        Long countLoansByBookId(@Param("bookId") Long bookId);

        // AI Recommendation methods
        @Query("SELECT b FROM Book b WHERE b.genre.id IN :genreIds AND b.id NOT IN :borrowedIds AND b.active = true")
        List<Book> findByGenreIdInAndIdNotIn(@Param("genreIds") List<Long> genreIds,
                        @Param("borrowedIds") java.util.Set<Long> borrowedIds);

        @Query("SELECT b FROM Book b WHERE b.genre.id = :genreId AND b.active = true")
        List<Book> findByGenreId(@Param("genreId") Long genreId);

        @Query("SELECT b FROM Book b " +
                        "LEFT JOIN FETCH b.author " +
                        "LEFT JOIN FETCH b.genre " +
                        "WHERE b.active = true ORDER BY b.createdAt DESC")
        List<Book> findActiveBooksForChat(Pageable pageable);

}
