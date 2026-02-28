package com.dat.LibraryManagementSystem.payload.response;

import com.dat.LibraryManagementSystem.payload.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private  String jwt;
    private String message;
    private String title;
    private UserDTO user;

}
