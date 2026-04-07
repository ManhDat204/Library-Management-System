package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.model.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {

    @Query("SELECT t FROM WalletTransaction t " +
            "WHERE t.wallet.user.id = :userId " +
            "ORDER BY t.createdAt DESC")
    Page<WalletTransaction> findByUserId(@Param("userId") Long userId, Pageable pageable);


    Page<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Long walletId, Pageable pageable);
}