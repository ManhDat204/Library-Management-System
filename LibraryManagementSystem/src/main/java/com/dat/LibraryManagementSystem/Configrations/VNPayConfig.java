package com.dat.LibraryManagementSystem.Configrations;

import org.springframework.stereotype.Component;

@Component
public class VNPayConfig {
    public static final String vnp_TmnCode = "JGUX164D";
    public static final String vnp_HashSecret = "V27U9QE4JUCOI0TPVPVBC3TUJ9VD1ZZG";
    public static final String vnp_PayUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    public static final String vnp_ReturnUrl = "http://localhost:5173/home/payment/success";
}
