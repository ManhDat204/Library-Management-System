package com.dat.LibraryManagementSystem.controller;


import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.UserDTO;
import com.dat.LibraryManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;


    @GetMapping("/list")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(
                userService.getAllUsers()
        );
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile() throws UserException {
        return ResponseEntity.ok(
                userService.getCurrentUser()
        );
    }
}
