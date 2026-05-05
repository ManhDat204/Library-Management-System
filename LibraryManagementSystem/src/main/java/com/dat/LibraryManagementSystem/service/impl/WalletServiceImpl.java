package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.domain.WalletTransactionType;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.mapper.WalletMapper;
import com.dat.LibraryManagementSystem.model.*;
import com.dat.LibraryManagementSystem.payload.dto.WalletDTO;
import com.dat.LibraryManagementSystem.payload.dto.WalletTransactionDTO;
import com.dat.LibraryManagementSystem.repository.UserRepository;
import com.dat.LibraryManagementSystem.repository.WalletRepository;
import com.dat.LibraryManagementSystem.repository.WalletTransactionRepository;
import com.dat.LibraryManagementSystem.service.UserService;
import com.dat.LibraryManagementSystem.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final WalletMapper walletMapper;

    @Override
    @Transactional
    public void createWalletForUser(Long userId) {
        if (walletRepository.existsByUserId(userId)) {
            log.warn("Wallet already exists for user {}", userId);
            return;
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Wallet wallet = Wallet.builder()
                .user(user)
                .balance(BigDecimal.ZERO)
                .lockedBalance(BigDecimal.ZERO)
                .build();
        walletRepository.save(wallet);
        log.info("[WALLET] Created for user {}", userId);
    }

    @Override
    @Transactional
    public WalletDTO getMyWallet() throws UserException {
        User user = userService.getCurrentUser();
        Wallet wallet = walletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Wallet newWallet = Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .lockedBalance(BigDecimal.ZERO)
                            .build();
                    return walletRepository.save(newWallet);
                });
        return walletMapper.toDTO(wallet);
    }

    @Override
    @Transactional(readOnly = true)
    public WalletDTO getWalletByUserId(Long userId) {
        return walletMapper.toDTO(findWallet(userId));
    }

    @Override
    @Transactional
    public void deposit(Long userId, BigDecimal amount, Payment payment) {
        Wallet wallet = findWalletWithLock(userId);

        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        saveTransaction(wallet, WalletTransactionType.DEPOSIT, amount,
                null, payment,
                "Nạp tiền qua VNPay - TxnRef: " + payment.getTxnRef());

        log.info("[WALLET] DEPOSIT {} → user {}", amount, userId);
    }

    @Override
    @Transactional
    public void lockDeposit(BookLoan bookLoan) {
        Long userId = bookLoan.getUser().getId();
        BigDecimal deposit = getBookPrice(bookLoan);

        Wallet wallet = findWalletWithLock(userId);

        if (wallet.getBalance().compareTo(deposit) < 0) {
            throw new RuntimeException(
                    "Số dư ví không đủ để đặt cọc. " +
                            "Cần: " + deposit + " VND, " +
                            "Hiện có: " + wallet.getBalance() + " VND");
        }

        wallet.setBalance(wallet.getBalance().subtract(deposit));
        wallet.setLockedBalance(wallet.getLockedBalance().add(deposit));
        walletRepository.save(wallet);

        saveTransaction(wallet, WalletTransactionType.LOCK, deposit,
                bookLoan, null,
                "Tiền cọc cho : " + bookLoan.getBook().getTitle());

        log.info("[WALLET] LOCK {} ← bookLoan#{} user {}", deposit, bookLoan.getId(), userId);
    }

    @Override
    @Transactional
    public void unlockDeposit(BookLoan bookLoan) {
        Long userId = bookLoan.getUser().getId();
        BigDecimal deposit = getBookPrice(bookLoan);

        Wallet wallet = findWalletWithLock(userId);

        wallet.setLockedBalance(wallet.getLockedBalance().subtract(deposit));
        wallet.setBalance(wallet.getBalance().add(deposit));
        walletRepository.save(wallet);

        saveTransaction(wallet, WalletTransactionType.UNLOCK, deposit,
                bookLoan, null,
                "Hoàn cọc cho sách: " + bookLoan.getBook().getTitle());

        log.info("[WALLET] UNLOCK {} → bookLoan#{} user {}", deposit, bookLoan.getId(), userId);
    }

    @Override
    @Transactional
    public void deductBalance(Long userId, BigDecimal amount, String reason) {
        Wallet wallet = findWalletWithLock(userId);

        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException(
                    "Số dư ví không đủ. " +
                            "Cần: " + amount + " VND, " +
                            "Hiện có: " + wallet.getBalance() + " VND");
        }

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        saveTransaction(wallet, WalletTransactionType.PENALTY, amount,
                null, null, reason);

        log.info("[WALLET] DEDUCT {} ← user {} - {}", amount, userId, reason);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WalletTransactionDTO> getMyTransactions(Pageable pageable) throws UserException {
        User user = userService.getCurrentUser();
        return walletTransactionRepository
                .findByUserId(user.getId(), pageable)
                .map(walletMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<WalletTransactionDTO> getTransactionsByUserId(Long userId, Pageable pageable) {
        return walletTransactionRepository
                .findByUserId(userId, pageable)
                .map(walletMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasSufficientBalance(Long userId, BigDecimal required) {
        return walletRepository.findByUserId(userId)
                .map(w -> w.getBalance().compareTo(required) >= 0)
                .orElse(false);
    }

    private Wallet findWallet(Long userId) {
        return walletRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy ví cho user: " + userId));
    }

    private Wallet findWalletWithLock(Long userId) {
        return walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(() -> new RuntimeException(
                        "Không tìm thấy ví cho user: " + userId));
    }

    private BigDecimal getBookPrice(BookLoan bookLoan) {
        BigDecimal price = bookLoan.getBook().getPrice();
        return (price != null) ? price : BigDecimal.ZERO;
    }

    private void saveTransaction(Wallet wallet,
            WalletTransactionType type,
            BigDecimal amount,
            BookLoan bookLoan,
            Payment payment,
            String note) {
        WalletTransaction tx = WalletTransaction.builder()
                .wallet(wallet)
                .type(type)
                .amount(amount)
                .balanceAfter(wallet.getBalance())
                .lockedBalanceAfter(wallet.getLockedBalance())
                .bookLoan(bookLoan)
                .payment(payment)
                .note(note)
                .build();
        walletTransactionRepository.save(tx);
    }
}