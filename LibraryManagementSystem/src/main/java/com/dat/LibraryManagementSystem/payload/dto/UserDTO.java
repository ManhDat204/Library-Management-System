package com.dat.LibraryManagementSystem.payload.dto;

import com.dat.LibraryManagementSystem.domain.AuthProvider;
import com.dat.LibraryManagementSystem.domain.UserRole;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;

    @NotNull( message = "email la bat buoc")
    private String email;

    @NotBlank( message = "fullname la bat buoc")
    private String fullName;

    private String phone;

    private UserRole role;

    @NotNull( message = "Mat khau la bat buoc")
    private String password;

    private String username;

    private LocalDateTime lastLogin;



}
