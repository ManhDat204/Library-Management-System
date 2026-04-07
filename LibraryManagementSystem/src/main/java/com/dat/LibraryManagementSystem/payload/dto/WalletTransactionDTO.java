package com.dat.LibraryManagementSystem.payload.dto;

import com.dat.LibraryManagementSystem.domain.WalletTransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletTransactionDTO {
    private Long id;
    private WalletTransactionType type;
    private BigDecimal amount;


    private BigDecimal balanceAfter;

    private BigDecimal lockedBalanceAfter;


    private Long bookLoanId;
    private String bookTitle;

    private Long paymentId;
    private String txnRef;

    private String note;
    private LocalDateTime createdAt;
}