package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.domain.UserRole;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.payload.dto.UserDTO;
import com.dat.LibraryManagementSystem.payload.request.ForgotPasswordRequest;
import com.dat.LibraryManagementSystem.payload.request.LoginRequest;
import com.dat.LibraryManagementSystem.payload.request.ResetPasswordRequest;
import com.dat.LibraryManagementSystem.payload.response.ApiResponse;
import com.dat.LibraryManagementSystem.payload.response.AuthResponse;
import com.dat.LibraryManagementSystem.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signupHandler(
            @RequestBody  UserDTO request
            ) throws UserException {
        AuthResponse res = authService.signup(request);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginHandler(
            @Valid @RequestBody LoginRequest request
            ) throws UserException{
        AuthResponse res = authService.login(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(res);

    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(
            @RequestBody ForgotPasswordRequest request
    ) throws UserException{
        authService.createPasswordResetToken(request.getEmail());

        ApiResponse res = new ApiResponse(
                "reset link da duoc gui toi email", true
        );
        return ResponseEntity.ok(res);

    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(
            @RequestBody ResetPasswordRequest request
    ) throws Exception {
        authService.resetPassword(request.getToken(), request.getPassword() );

        ApiResponse res = new ApiResponse(
                "Mat khau reset thanh cong", true
        );
        return ResponseEntity.ok(res);

    }



}
