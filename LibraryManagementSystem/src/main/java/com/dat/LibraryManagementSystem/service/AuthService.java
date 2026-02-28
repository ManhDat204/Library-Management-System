package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.payload.dto.UserDTO;
import com.dat.LibraryManagementSystem.payload.response.AuthResponse;

public interface AuthService {
    AuthResponse login(String username, String password) throws UserException;
    AuthResponse signup(UserDTO req) throws UserException;

    void createPasswordResetToken(String email) throws UserException;
    void resetPassword(String token, String newPassword) throws Exception;
}
