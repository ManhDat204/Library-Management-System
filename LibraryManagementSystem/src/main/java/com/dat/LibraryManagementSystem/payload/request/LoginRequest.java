package com.dat.LibraryManagementSystem.payload.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    @NotNull(message = " ten nguoi dung hoac email la bat buoc")
    private String email;
    @NotNull(message = "mat khau la bat buoc")
    private  String password;
}
