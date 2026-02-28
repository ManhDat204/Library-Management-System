package com.dat.LibraryManagementSystem.Configrations;

import org.springframework.stereotype.Component;

@Component
public class VNPayConfig {

    public static final String vnp_TmnCode = "YOUR_TMN_CODE";
    public static final String vnp_HashSecret = "YOUR_HASH_SECRET";
    public static final String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static final String vnp_ReturnUrl = "http://localhost:8080/payments/vnpay-return";
}
