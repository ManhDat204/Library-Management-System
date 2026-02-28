package com.dat.LibraryManagementSystem.exception;

public class PaymentException extends Exception {
    public PaymentException(String message) {
        super(message);
    }

    public PaymentException(String message, Throwable cause) {
        super(message, cause);
    }
}
