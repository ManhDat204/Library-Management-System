package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.domain.PaymentType;
import com.dat.LibraryManagementSystem.domain.PaymentStatus;
import com.dat.LibraryManagementSystem.model.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTxnRef(String txnRef);
    Page<Payment> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Payment> findByUser_IdAndPaymentTypeOrderByCreatedAtDesc(
            Long userId, PaymentType paymentType, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p " +
            "WHERE p.paymentStatus = :status " +
            "AND p.paymentType <> :excludedType " +
            "AND p.createdAt BETWEEN :startDateTime AND :endDateTime")
    Long sumAmountByStatusExcludingTypeAndCreatedAtBetween(
            @Param("status") PaymentStatus status,
            @Param("excludedType") PaymentType excludedType,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p " +
            "WHERE p.paymentStatus = :status " +
            "AND p.paymentType = :paymentType " +
            "AND p.createdAt BETWEEN :startDateTime AND :endDateTime")
    Long sumAmountByStatusAndTypeAndCreatedAtBetween(
            @Param("status") PaymentStatus status,
            @Param("paymentType") PaymentType paymentType,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime);
}
