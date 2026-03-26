package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.domain.PaymentType;
import com.dat.LibraryManagementSystem.model.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByTxnRef(String txnRef);
    Page<Payment> findByUser_IdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    Page<Payment> findByUser_IdAndPaymentTypeOrderByCreatedAtDesc(
            Long userId, PaymentType paymentType, Pageable pageable);
}
