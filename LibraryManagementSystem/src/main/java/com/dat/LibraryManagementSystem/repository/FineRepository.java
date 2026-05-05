package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.domain.FineStatus;
import com.dat.LibraryManagementSystem.model.Fine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface FineRepository extends JpaRepository<Fine, Long>, JpaSpecificationExecutor<Fine> {

        @Query("SELECT f FROM Fine f WHERE f.user.id = :userId AND f.deletedAt IS NULL")
        List<Fine> findByUserId(Long userId);

        @Query("SELECT f FROM Fine f WHERE f.bookLoan.id = :loanId AND f.deletedAt IS NULL")
        Optional<Fine> findByBookLoanId(Long loanId);

        @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Fine f " +
                        "WHERE f.bookLoan.id = :loanId AND f.status = :status AND f.deletedAt IS NULL")
        boolean existsByBookLoanIdAndStatus(Long loanId, FineStatus status);

        @Query(" SELECT SUM(f.amount) FROM Fine f WHERE f.status = :status " +
                        "AND f.deletedAt IS NULL AND (:userId IS NULL OR f.user.id = :userId)")
        BigDecimal sumAmountByStatusAndUserId(FineStatus status, Long userId);

        Page<Fine> findByStatus(FineStatus status, Pageable pageable);

        Page<Fine> findByUserId(Long userId, Pageable pageable);

        @Query("SELECT COUNT(f) FROM Fine f WHERE f.deletedAt IS NULL " +
                        "AND f.createdAt BETWEEN :startDateTime AND :endDateTime")
        long countCreatedBetween(
                        @Param("startDateTime") LocalDateTime startDateTime,
                        @Param("endDateTime") LocalDateTime endDateTime);

        @Query("SELECT COUNT(DISTINCT f.user.id) FROM Fine f WHERE f.deletedAt IS NULL " +
                        "AND f.status = :status")
        long countDistinctUsersByStatus(@Param("status") FineStatus status);

        @Query("SELECT f FROM Fine f WHERE f.deletedAt IS NULL AND f.status = 'PENDING' " +
                        "ORDER BY f.amount DESC")
        Page<Fine> findTopPendingFines(Pageable pageable);
}
