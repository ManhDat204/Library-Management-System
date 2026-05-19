package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.model.BookLoan;
import com.dat.LibraryManagementSystem.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BookLoanRepository extends JpaRepository<BookLoan, Long> {

        Page<BookLoan> findByUserId(Long userId, Pageable pageable);

        Page<BookLoan> findByStatusAndUser(BookLoanStatus status, User user, Pageable pageable);

        Page<BookLoan> findByStatus(BookLoanStatus status, Pageable pageable);

        Page<BookLoan> findByBookId(Long bookId, Pageable pageable);

        List<BookLoan> findByBookId(Long bookId);

        @Query("SELECT bl FROM BookLoan bl WHERE bl.checkoutDate BETWEEN :startDate AND :endDate " +
                        "AND bl.status = :status")
        Page<BookLoan> findBookLoansByDateRangeAndStatus(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("status") BookLoanStatus status,
                        Pageable pageable);

        @Query("SELECT bl FROM BookLoan bl " +
                "WHERE (:searchTerm IS NULL OR " +
                "LOWER(bl.user.fullName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
                "LOWER(bl.book.title) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) " +
                "AND (:status IS NULL OR bl.status = :status)")
        Page<BookLoan> searchByKeyword(
                @Param("searchTerm") String searchTerm,
                @Param("status") BookLoanStatus status,
                Pageable pageable);


        @Query("select case when count(bl) > 0 then true else false end from BookLoan bl " +
                        " where bl.user.id = :userId and bl.book.id = :bookId " +
                        " and bl.status NOT IN ('RETURNED','CANCELLED','DAMAGED','LOST')")
        boolean hasActiveCheckout(
                        @Param("userId") Long userId,
                        @Param("bookId") Long bookId);

        @Query("SELECT COUNT(bl) FROM BookLoan bl WHERE bl.user.id = :userId " +
                        "AND bl.status NOT IN ('RETURNED','CANCELLED','DAMAGED','LOST')")
        long countActiveBookLoanByUser(@Param("userId") Long userId);

        @Query("SELECT COUNT(bl) FROM BookLoan bl WHERE bl.user.id = :userId " +
                        "AND bl.status = 'OVERDUE' ")
        long countOverdueBookLoansByUser(@Param("userId") Long userId);

        @Query("SELECT bl FROM BookLoan bl WHERE bl.dueDate < :currentDate " +
                        "AND (bl.status = 'CHECK_OUT' OR bl.status = 'OVERDUE')")
        Page<BookLoan> findOverdueBookLoans(@Param("currentDate") LocalDate currentDate,
                        Pageable pageable);

        @Query("SELECT bl FROM BookLoan bl WHERE bl.checkoutDate BETWEEN :startDate AND :endDate ")
        Page<BookLoan> findBookLoansByDateRange(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        Pageable pageable);

        @Query("SELECT bl.book.id, COUNT(bl.id) FROM BookLoan bl JOIN bl.book b WHERE b.active = true " +
                        "GROUP BY bl.book.id ORDER BY COUNT(bl.id) DESC")
        List<Object[]> countLoanGroupByBook(Pageable pageable);

        @Query("SELECT bl.book.genre.id, COUNT(bl.id) FROM BookLoan bl " +
                "WHERE bl.book.genre IS NOT NULL GROUP BY bl.book.genre.id")
        List<Object[]> countLoanGroupByGenre();

        @Query("SELECT COUNT(bl) FROM BookLoan bl WHERE bl.checkoutDate BETWEEN :startDate AND :endDate")
        long countByCheckoutDateRange(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        @Query("SELECT COUNT(bl) FROM BookLoan bl WHERE bl.checkoutDate BETWEEN :startDate AND :endDate " +
                        "AND bl.isOverDue = true")
        long countOverdueByCheckoutDateRange(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        boolean existsByUserIdAndBookIdAndStatus(Long userId, Long bookId, BookLoanStatus status);

        // Report queries
        @Query("SELECT COUNT(bl) FROM BookLoan bl WHERE bl.status IN ('CHECK_OUT', 'OVERDUE', 'SHIPPING', 'DELIVERED')")
        long countActiveLoans();

        @Query("SELECT bl FROM BookLoan bl WHERE bl.status IN ('CHECK_OUT', 'OVERDUE', 'SHIPPING', 'DELIVERED') " +
                        "ORDER BY bl.checkoutDate DESC, bl.createdAt DESC")
        Page<BookLoan> findActiveLoans(Pageable pageable);

        @Query("SELECT bl FROM BookLoan bl ORDER BY bl.checkoutDate DESC")
        Page<BookLoan> findRecentCheckouts(Pageable pageable);

        @Query("SELECT bl FROM BookLoan bl WHERE bl.status = 'RETURNED' ORDER BY bl.returnDate DESC")
        Page<BookLoan> findRecentReturns(Pageable pageable);

        @Query("SELECT bl.user.id, COUNT(bl) as loanCount FROM BookLoan bl " +
                        "WHERE bl.user IS NOT NULL GROUP BY bl.user.id ORDER BY COUNT(bl) DESC")
        Page<Object[]> findTopBorrowersByCount(Pageable pageable);

        @Query("SELECT bl FROM BookLoan bl WHERE bl.user.id = :userId")
        List<BookLoan> findAllByUserId(@Param("userId") Long userId);

        @Query("SELECT FUNCTION('DAYOFWEEK', bl.checkoutDate), COUNT(bl) " +
                "FROM BookLoan bl WHERE bl.checkoutDate BETWEEN :startDate AND :endDate " +
                "GROUP BY FUNCTION('DAYOFWEEK', bl.checkoutDate)")
        List<Object[]> countLoanGroupByDayOfWeek(
                @Param("startDate") LocalDate startDate,
                @Param("endDate") LocalDate endDate);
}
