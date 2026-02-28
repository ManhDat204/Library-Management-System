package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.exception.PaymentException;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.payload.dto.PaymentDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface PaymentService {


    PaymentDTO createPayment(PaymentDTO dto) throws PaymentException, UserException;

    PaymentDTO getPayment(Long id) throws PaymentException;


    Page<PaymentDTO> getAllPayments(Pageable pageable);

    void verifyPayment(Long paymentId) throws PaymentException;


    PaymentDTO handleVnPayReturn(Map<String, String> parameters) throws PaymentException;


    String generateVnPayUrl(Long paymentId) throws PaymentException;
}
