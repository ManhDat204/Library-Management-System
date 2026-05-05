package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.model.BookLoan;
import com.dat.LibraryManagementSystem.model.Payment;
import com.dat.LibraryManagementSystem.payload.dto.WalletDTO;
import com.dat.LibraryManagementSystem.payload.dto.WalletTransactionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;

public interface WalletService {


    void createWalletForUser(Long userId);

    WalletDTO getMyWallet() throws UserException;

    WalletDTO getWalletByUserId(Long userId);

    void deposit(Long userId, BigDecimal amount, Payment payment);

    void lockDeposit(BookLoan bookLoan);

    void unlockDeposit(BookLoan bookLoan);

    void deductBalance(Long userId, BigDecimal amount, String reason);

    Page<WalletTransactionDTO> getMyTransactions(Pageable pageable) throws UserException;


    Page<WalletTransactionDTO> getTransactionsByUserId(Long userId, Pageable pageable);

    boolean hasSufficientBalance(Long userId, BigDecimal required);
}