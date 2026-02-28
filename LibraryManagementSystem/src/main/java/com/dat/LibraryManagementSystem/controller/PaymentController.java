package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.exception.PaymentException;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.payload.dto.PaymentDTO;
import com.dat.LibraryManagementSystem.payload.response.ApiResponse;
import com.dat.LibraryManagementSystem.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentDTO> createPayment(@RequestBody @Valid PaymentDTO dto) throws PaymentException, UserException {
        PaymentDTO created = paymentService.createPayment(dto);
        return ResponseEntity.ok(created);
    }


    @GetMapping("/{id}")
    public ResponseEntity<PaymentDTO> getPayment(@PathVariable Long id) throws PaymentException {
        PaymentDTO dto = paymentService.getPayment(id);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/{id}/url")
    public ResponseEntity<ApiResponse> getVnPayUrl(@PathVariable Long id) throws PaymentException {
        String url = paymentService.generateVnPayUrl(id);
        return ResponseEntity.ok(new ApiResponse(url, true));
    }



    @GetMapping("/vnpay-return")
    public ResponseEntity<?> vnpayReturn(HttpServletRequest request) throws PaymentException {
        Map<String, String> params = new HashMap<>();
        request.getParameterMap().forEach((k, v) -> {
            if (v != null && v.length > 0) {
                params.put(k, v[0]);
            }
        });
        PaymentDTO dto = paymentService.handleVnPayReturn(params);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/vnpay-verify")
    public ResponseEntity<?> verify(@RequestBody Map<String, String> params) throws PaymentException {

        PaymentDTO dto = paymentService.handleVnPayReturn(params);

        if ("00".equals(params.get("vnp_ResponseCode"))) {
            return ResponseEntity.ok(Map.of("status", "SUCCESS"));
        } else {
            return ResponseEntity.ok(Map.of("status", "FAILED"));
        }
    }
}
