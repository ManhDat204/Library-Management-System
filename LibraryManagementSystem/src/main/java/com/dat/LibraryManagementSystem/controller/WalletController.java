package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.exception.PaymentException;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.payload.dto.PaymentDTO;
import com.dat.LibraryManagementSystem.payload.dto.WalletDTO;
import com.dat.LibraryManagementSystem.payload.dto.WalletTransactionDTO;
import com.dat.LibraryManagementSystem.payload.response.ApiResponse;
import com.dat.LibraryManagementSystem.service.PaymentService;
import com.dat.LibraryManagementSystem.service.UserService;
import com.dat.LibraryManagementSystem.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final PaymentService paymentService;
    private final UserService userService;

    // ──────────────────────────────────────────
    // GET /api/wallet/me
    // Xem số dư ví hiện tại
    // ──────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<WalletDTO> getMyWallet() throws UserException {
        return ResponseEntity.ok(walletService.getMyWallet());
    }

    // ──────────────────────────────────────────
    // GET /api/wallet/me/transactions
    // Lịch sử giao dịch ví (phân trang)
    // ──────────────────────────────────────────
    @GetMapping("/me/transactions")
    public ResponseEntity<Page<WalletTransactionDTO>> getMyTransactions(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) throws UserException {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ResponseEntity.ok(walletService.getMyTransactions(pageable));
    }

    // ──────────────────────────────────────────
    // POST /api/wallet/deposit
    // Tạo lệnh nạp tiền → trả về URL VNPay
    // Body: { "amount": 100000 }
    // ──────────────────────────────────────────
    @PostMapping("/deposit")
    public ResponseEntity<ApiResponse> createDeposit(
            @RequestBody DepositAmountRequest request) throws UserException, PaymentException {

        Long userId = userService.getCurrentUser().getId();

        // Tạo Payment với type = WALLET_DEPOSIT (dùng PaymentService có sẵn)
        PaymentDTO paymentDTO = PaymentDTO.builder()
                .userId(userId)
                .amount(request.getAmount())
                .paymentType(com.dat.LibraryManagementSystem.domain.PaymentType.WALLET_DEPOSIT)
                .gateway(com.dat.LibraryManagementSystem.domain.PaymentGateway.VNPay)
                .description("Nap tien vi - User " + userId)
                .build();

        PaymentDTO created = paymentService.createPayment(paymentDTO);

        // Sinh URL VNPay từ payment vừa tạo
        String vnpayUrl = paymentService.generateVnPayUrl(created.getId());

        return ResponseEntity.ok(new ApiResponse(vnpayUrl, true));
    }

    // ──────────────────────────────────────────
    // ADMIN: GET /api/wallet/admin/{userId}
    // Xem ví của bất kỳ user nào
    // ──────────────────────────────────────────
    @GetMapping("/admin/{userId}")
    public ResponseEntity<WalletDTO> getWalletByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(walletService.getWalletByUserId(userId));
    }

    // Inner class cho request body nạp tiền
    @lombok.Data
    public static class DepositAmountRequest {
        private Long amount;
    }
}