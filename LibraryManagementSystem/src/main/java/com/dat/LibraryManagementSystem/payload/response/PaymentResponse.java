package com.dat.LibraryManagementSystem.payload.response;

import com.dat.LibraryManagementSystem.domain.PaymentGateway;

public class PaymentResponse {

    private Long userId;

    private Long paymentId;

    private PaymentGateway gateway;

    private String transactionId;

    private Long amount;

    private String description;

    private String message;

    private Boolean success;


}
