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

public interface FineRepository extends JpaRepository<Fine, Long>, JpaSpecificationExecutor<Fine> {

    List<Fine> findByUserId(Long userId);

    Optional<Fine> findByBookLoanId(Long loanId);

    boolean existsByBookLoanIdAndStatus(Long loanId, FineStatus status);

    @Query("""
        SELECT SUM(f.amount)
        FROM Fine f
        WHERE f.status = :status
        AND (:userId IS NULL OR f.user.id = :userId)
    """)
    BigDecimal sumAmountByStatusAndUserId(FineStatus status, Long userId);

    Page<Fine> findByStatus(FineStatus status, Pageable pageable);

    Page<Fine> findByUserId(Long userId, Pageable pageable);
}