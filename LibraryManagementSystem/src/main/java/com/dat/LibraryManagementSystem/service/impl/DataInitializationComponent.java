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
    public void run(String... args){
        initializeAdminUser();
    }
    public void initializeAdminUser(){
        String adminEmail="coder@gmail.com";
        String adminPassword="coder";

        if(userRepository.findByEmail(adminEmail)==null){
            User user = User.builder()
                    .password(passwordEncoder.encode(adminPassword))
                    .email(adminEmail)
                    .fullName("Dat Coder")
                    .role(UserRole.ROLE_ADMIN)


                    .build();
            User admin = userRepository.save(user);
        }
    }
}
