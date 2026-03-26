package com.dat.LibraryManagementSystem.Configrations;

import org.springframework.stereotype.Component;

@Component
public class VNPayConfig {
    public static final String vnp_TmnCode = "QWLXMH2P";
    public static final String vnp_HashSecret = "N21Z1TM0D4LSTQF5AHM0M4DTDOWDAUWX";
    public static final String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static final String vnp_ReturnUrl = "http://localhost:5173/home/payment/success";
}
