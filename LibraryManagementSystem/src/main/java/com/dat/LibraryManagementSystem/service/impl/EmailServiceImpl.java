package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
public class EmailServiceImpl implements EmailService {
    @Autowired
    private final JavaMailSender javaMailSender;


    public void sendEmail(String to, String subject, String body) {
        try {
            MimeMessage mimeMessage = javaMailSender.createMimeMessage();
            MimeMessageHelper hepler = new MimeMessageHelper(mimeMessage, "utf-8");
            hepler.setSubject(subject);
            hepler.setText(body, true);
            hepler.setTo(to);
            javaMailSender.send(mimeMessage);
        }catch(MailException e){
            throw  new MailSendException(" Loi khi gui email");

        } catch (MessagingException e) {
            throw new RuntimeException(e);
        }
    }
}
