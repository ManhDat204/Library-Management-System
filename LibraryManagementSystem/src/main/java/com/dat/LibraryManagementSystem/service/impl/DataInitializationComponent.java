package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.domain.UserRole;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializationComponent implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeAdminUser();
        initializeStaffUser();
    }

    public void initializeAdminUser() {
        String adminEmail = "coder@gmail.com";
        String adminPassword = "coder";

        if (userRepository.findByEmail(adminEmail) == null) {
            User user = User.builder()
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .fullName("Dat Coder")
                    .role(UserRole.ROLE_ADMIN)
                    .active(true)
                    .build();
            User admin = userRepository.save(user);
        }
    }

    public void initializeStaffUser() {
        String staffEmail = "staff@gmail.com";
        String staffPassword = "staff123";

        if (userRepository.findByEmail(staffEmail) == null) {
            User user = User.builder()
                    .password(passwordEncoder.encode(staffPassword))
                    .email(staffEmail)
                    .fullName("Nhân viên thư viện")
                    .role(UserRole.ROLE_STAFF)
                    .active(true)
                    .build();
            User staff = userRepository.save(user);
        }
    }
}
         