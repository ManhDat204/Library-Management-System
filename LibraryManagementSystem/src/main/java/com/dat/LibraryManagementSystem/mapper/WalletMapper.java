package com.dat.LibraryManagementSystem.mapper;

import com.dat.LibraryManagementSystem.model.Wallet;
import com.dat.LibraryManagementSystem.model.WalletTransaction;
import com.dat.LibraryManagementSystem.payload.dto.WalletDTO;
import com.dat.LibraryManagementSystem.payload.dto.WalletTransactionDTO;
import org.springframework.stereotype.Component;

@Component
public class WalletMapper {

    public WalletDTO toDTO(Wallet wallet) {
        return WalletDTO.builder()
                .id(wallet.getId())
                .userId(wallet.getUser().getId())
                .userFullName(wallet.getUser().getFullName())
                .userEmail(wallet.getUser().getEmail())
                .balance(wallet.getBalance())
                .lockedBalance(wallet.getLockedBalance())
                .totalBalance(wallet.getTotalBalance())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }

    public WalletTransactionDTO toDTO(WalletTransaction tx) {
        return WalletTransactionDTO.builder()
                .id(tx.getId())
                .type(tx.getType())
                .amount(tx.getAmount())
                .balanceAfter(tx.getBalanceAfter())
                .lockedBalanceAfter(tx.getLockedBalanceAfter())
                .bookLoanId(tx.getBookLoan() != null ? tx.getBookLoan().getId() : null)
                .bookTitle(tx.getBookLoan() != null ? tx.getBookLoan().getBook().getTitle() : null)
                .paymentId(tx.getPayment() != null ? tx.getPayment().getId() : null)
                .txnRef(tx.getPayment() != null ? tx.getPayment().getTxnRef() : null)
                .note(tx.getNote())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}