package com.dat.LibraryManagementSystem.service;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
}
