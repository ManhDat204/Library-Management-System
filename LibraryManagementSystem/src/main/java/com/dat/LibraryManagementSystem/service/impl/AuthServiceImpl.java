package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.Configrations.JwtProvider;
import com.dat.LibraryManagementSystem.domain.UserRole;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.mapper.UserMapper;
import com.dat.LibraryManagementSystem.model.PasswordResetToken;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.UserDTO;
import com.dat.LibraryManagementSystem.payload.response.AuthResponse;
import com.dat.LibraryManagementSystem.repository.PasswordResetTokenRepository;
import com.dat.LibraryManagementSystem.repository.UserRepository;
import com.dat.LibraryManagementSystem.service.AuthService;
import com.dat.LibraryManagementSystem.service.EmailService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.UUID;

@RequiredArgsConstructor
@Service

public class AuthServiceImpl implements AuthService {
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtProvider jwtProvider;
    private final UserMapper userMapper;
    private final CustomerUserServiceImpl customerUserService;
    private final EmailService emailService;

    @Override
    public AuthResponse login(String username, String password) throws UserException {
        Authentication authentication = authenticate(username, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Collection<? extends GrantedAuthority> authorities
        // =authentication.getAuthorities();
        // String role = authorities.iterator().next().getAuthority();
        String token = JwtProvider.generateToken(authentication);

        User user = userRepository.findByEmail(username);

        user.setLastLogin(LocalDateTime.now());
        user.setActive(true);
        userRepository.save(user);

        AuthResponse response = new AuthResponse();
        response.setTitle("Dang nhap thanh cong");
        response.setMessage("Chao mung " + username);
        response.setJwt(token);
        ;
        response.setUser(UserMapper.toDTO(user));
        return response;

    }

    private Authentication authenticate(String username, String password) throws UserException {
        try {
            UserDetails userDetails = customerUserService.loadUserByUsername(username);

            if (!passwordEncoder.matches(password, userDetails.getPassword())) {
                throw new UserException("Mat khau khong dung");
            }
            return new UsernamePasswordAuthenticationToken(username, null,
                    userDetails.getAuthorities());
        } catch (UsernameNotFoundException e) {
            throw new UserException("Nguoi dung khong ton tai");
        }
    }

    @Override
    public AuthResponse signup(UserDTO req) throws UserException {
        User user = userRepository.findByEmail(req.getEmail());
        if (user != null) {
            throw new UserException("Email da duoc ton tai");
        }
        User createUser = new User();
        createUser.setEmail(req.getEmail());
        createUser.setPassword(passwordEncoder.encode(req.getPassword()));
        createUser.setPhone(req.getPhone());
        createUser.setFullName(req.getFullName());
        createUser.setLastLogin(LocalDateTime.now());
        createUser.setRole(UserRole.ROLE_USER);
        createUser.setActive(true);

        User savedUser = userRepository.save(createUser);

        Authentication auth = new UsernamePasswordAuthenticationToken(
                savedUser.getEmail(), savedUser.getPassword());
        SecurityContextHolder.getContext().setAuthentication(auth);

        String jwt = jwtProvider.generateToken(auth);

        AuthResponse response = new AuthResponse();
        response.setJwt(jwt);
        response.setTitle("Chao mung " + createUser.getFullName());
        response.setMessage("Dang ky tai khoan thanh cong");
        response.setUser(UserMapper.toDTO(savedUser));
        return response;
    }

    @Transactional
    public void createPasswordResetToken(String email) throws UserException {
        String frontendUrl = "http://localhost:5173";
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new UserException("User khong ton tai voi email");

        }
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusMinutes(5))
                .build();
        passwordResetTokenRepository.save(resetToken);
        String resetLink = frontendUrl + token;
        String subject = "Quen mat khau";
        String body = "Ban da yeu cau quen mat khau. Su dung link nay " + resetLink;

        emailService.sendEmail(user.getEmail(), subject, body);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) throws Exception {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new Exception("Token khong hop le"));
        if (resetToken.isExpiryDate()) {
            passwordResetTokenRepository.delete(resetToken);
            throw new Exception("Token expired");
        }
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        passwordResetTokenRepository.delete(resetToken);
    }
}
