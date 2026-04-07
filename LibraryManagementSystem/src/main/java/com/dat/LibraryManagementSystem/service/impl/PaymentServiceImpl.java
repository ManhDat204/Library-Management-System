package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.Configrations.VNPayConfig;
import com.dat.LibraryManagementSystem.domain.FineStatus;
import com.dat.LibraryManagementSystem.domain.PaymentGateway;
import com.dat.LibraryManagementSystem.domain.PaymentStatus;
import com.dat.LibraryManagementSystem.domain.PaymentType;
import com.dat.LibraryManagementSystem.exception.PaymentException;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.mapper.PaymentMapper;
import com.dat.LibraryManagementSystem.model.Payment;
import com.dat.LibraryManagementSystem.model.Subscription;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.PaymentDTO;
import com.dat.LibraryManagementSystem.payload.request.PaymentRequest;
import com.dat.LibraryManagementSystem.payload.response.PaymentResponse;
import com.dat.LibraryManagementSystem.repository.FineRepository;
import com.dat.LibraryManagementSystem.repository.PaymentRepository;
import com.dat.LibraryManagementSystem.repository.SubscriptionRepository;
import com.dat.LibraryManagementSystem.repository.UserRepository;
import com.dat.LibraryManagementSystem.service.PaymentService;
import com.dat.LibraryManagementSystem.service.WalletService;
import com.nimbusds.openid.connect.sdk.UserInfoResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final FineRepository fineRepository;
    private final WalletService walletService;

    @Override
    public Page<PaymentDTO> getMyPayments(Long userId, String type, Pageable pageable) {
        Page<Payment> page;
        if (type != null && !type.equalsIgnoreCase("ALL")) {
            PaymentType pt = PaymentType.valueOf(type); // type phải khớp enum
            page = paymentRepository.findByUser_IdAndPaymentTypeOrderByCreatedAtDesc(userId, pt, pageable);
        } else {
            page = paymentRepository.findByUser_IdOrderByCreatedAtDesc(userId, pageable);
        }
        return page.map(paymentMapper::toDTO);
    }

    @Override
    public PaymentDTO createPayment(

        PaymentDTO dto) throws PaymentException, UserException {
        User user = userRepository.findById(dto.getUserId()).orElseThrow(
                ()-> new UserException("User id khong ton tai")
        );
        Subscription subscription = null;
        if (dto.getSubscriptionId() != null) {
            subscription = subscriptionRepository.findById(dto.getSubscriptionId())
                    .orElseThrow(() -> new RuntimeException("Subscription khong ton tai"));
        }

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setPaymentType(dto.getPaymentType());
        payment.setGateway(dto.getGateway());
        payment.setAmount(dto.getAmount());
        payment.setSubscription(subscription);
        payment.setDescription(dto.getDescription());
        payment.setTxnRef(dto.getTxnRef() != null ? dto.getTxnRef() :"TXN" + UUID.randomUUID());
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setInitiatedAt(LocalDateTime.now());
        payment.setTransactionId("" + UUID.randomUUID());

        Payment saved = paymentRepository.save(payment);
        return paymentMapper.toDTO(saved);
    }

    @Override
    public PaymentDTO getPayment(Long id) throws PaymentException {
        return paymentRepository.findById(id)
                .map(paymentMapper::toDTO)
                .orElseThrow(() -> new PaymentException("Payment not found for id " + id));
    }

    @Override
    public Page<PaymentDTO> getAllPayments(Pageable pageable) {
        Page<Payment> payments = paymentRepository.findAll(pageable);
        return payments.map(paymentMapper::toDTO);
    }

    @Override
    public void verifyPayment(Long paymentId) throws PaymentException {
        PaymentDTO dto = getPayment(paymentId);
        if (dto.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new PaymentException("Payment is not successful: status=" + dto.getPaymentStatus());
        }
    }

    @Override
    @Transactional
    public PaymentDTO handleVnPayReturn(Map<String, String> parameters) throws PaymentException {
        if (parameters == null || parameters.isEmpty()) {
            throw new PaymentException("Empty parameters from VNPay");
        }

        String txnRef = parameters.get("vnp_TxnRef");
        if (txnRef == null) {
            throw new PaymentException("Missing vnp_TxnRef");
        }
        Payment payment = paymentRepository.findByTxnRef(txnRef)
                .orElseThrow(() -> new PaymentException("Payment not found for txnRef " + txnRef));

        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS
                || payment.getPaymentStatus() == PaymentStatus.FAILED) {
            log.info("[VNPAY] Payment {} đã được xử lý rồi ({}), bỏ qua",
                    txnRef, payment.getPaymentStatus());
            return paymentMapper.toDTO(payment);
        }
        // verify secure hash
        String secureHash = parameters.get("vnp_SecureHash");
        String generatedHash = generateVnpHash(parameters);


        if (!Objects.equals(secureHash, generatedHash)) {
            log.warn("hash mismatch {} vs {}", secureHash, generatedHash);
            throw new PaymentException("Invalid secure hash");
        }

        payment.setTransactionId(parameters.get("vnp_TransactionId"));
        payment.setSecureHash(secureHash);
        payment.setDescription(parameters.get("vnp_OrderInfo"));
        payment.setCompletedAt(LocalDateTime.now());
        payment.setGateway(PaymentGateway.VNPay);

        String responseCode = parameters.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            payment.setPaymentStatus(PaymentStatus.SUCCESS);

            // thanh toan fine set pending-> paid
            if (payment.getPaymentType() == PaymentType.FINE
                    && payment.getFineId() != null) {
                fineRepository.findById(payment.getFineId()).ifPresent(fine -> {
                    if (fine.getStatus() == FineStatus.PENDING) {
                        fine.setStatus(FineStatus.PAID);
                        fine.setPaidAt(LocalDateTime.now());
                        fineRepository.save(fine);
                        log.info("Fine #{} đã được set PAID sau VNPay callback thành công", fine.getId());
                    }
                });
            }
            if (payment.getPaymentType() == PaymentType.WALLET_DEPOSIT) {
                walletService.deposit(
                        payment.getUser().getId(),
                        BigDecimal.valueOf(payment.getAmount()),
                        payment
                );
                log.info("[WALLET] Đã cộng {} VND vào ví user {}",
                        payment.getAmount(), payment.getUser().getId());
            }
        } else {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            payment.setFailureReason(responseCode);
            log.warn("VNPay payment failed: txnRef={}, responseCode={}", txnRef, responseCode);
        }

        Payment updated = paymentRepository.save(payment);
        return paymentMapper.toDTO(updated);

    }

    @Override
    public String generateVnPayUrl(Long paymentId) throws PaymentException {
        PaymentDTO dto = getPayment(paymentId);
        Payment payment = paymentMapper.toEntity(dto);
        if (payment.getTxnRef() == null) {
            throw new PaymentException("Payment must have txnRef set before generating URL");
        }
        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", "2.1.0");
        vnpParams.put("vnp_Command", "pay");
        vnpParams.put("vnp_TmnCode", VNPayConfig.vnp_TmnCode);
        vnpParams.put("vnp_Amount", String.valueOf(payment.getAmount() == null ? 0L : payment.getAmount() * 100));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_IpAddr", "127.0.0.1");
        vnpParams.put("vnp_TxnRef", payment.getTxnRef());
        vnpParams.put("vnp_OrderInfo", payment.getDescription() != null ? payment.getDescription() : "");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", VNPayConfig.vnp_ReturnUrl);
        vnpParams.put("vnp_CreateDate", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

        // build query string and secure hash
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
//        for (String key : fieldNames) {
//            String value = vnpParams.get(key);
//            if (value != null && value.length() > 0) {
////                hashData.append(key).append("=").append(URLEncoder.encode(value, StandardCharsets.US_ASCII)).append('&');
//                hashData.append(key).append("=").append(value).append("&");
//                query.append(key).append("=").append(URLEncoder.encode(value, StandardCharsets.UTF_8)).append('&');
//            }
//        }
        for (String key : fieldNames) {
            String value = vnpParams.get(key);
            if (value != null && value.length() > 0) {
                String encodedValue = URLEncoder.encode(value, StandardCharsets.UTF_8);
                hashData.append(key).append("=").append(encodedValue).append("&");
                query.append(key).append("=").append(encodedValue).append("&");
            }
        }
        if (hashData.length() > 0) hashData.setLength(hashData.length() - 1);
        if (query.length() > 0) query.setLength(query.length() - 1);
        String secureHash = hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
        return VNPayConfig.vnp_PayUrl + "?" + query + "&vnp_SecureHash=" + secureHash;
    }

    private String generateVnpHash(Map<String, String> params) {
        // compute hash using the same algorithm as generateVnPayUrl
        List<String> fieldNames = new ArrayList<>(params.keySet());
        // remove hash field if present
        fieldNames.remove("vnp_SecureHash");

        fieldNames.remove("vnp_SecureHashType");

        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        for (String key : fieldNames) {
            String value = params.get(key);
            if (value != null && value.length() > 0) {
                String encodedValue = URLEncoder.encode(value, StandardCharsets.UTF_8);

//                hashData.append(key).append("=").append(value).append('&');
                hashData.append(key).append("=").append(encodedValue).append('&');
            }
        }
        if (hashData.length() > 0) hashData.setLength(hashData.length() - 1);
        return hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception ex) {
            throw new RuntimeException("Unable to calculate HMAC SHA512", ex);
        }
    }
}
