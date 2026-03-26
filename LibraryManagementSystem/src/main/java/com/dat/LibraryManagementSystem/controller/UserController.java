package com.dat.LibraryManagementSystem.controller;


import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.UserDTO;
import com.dat.LibraryManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @PutMapping("/admin/{id}")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserDTO userDTO
    ) throws UserException {

        return ResponseEntity.ok(
                userService.updateUser(id, userDTO)
        );
    }
    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateMyProfile(
            @RequestBody UserDTO userDTO
    ) throws UserException {
        return ResponseEntity.ok(
                userService.updateMyProfile(userDTO)
        );
    }
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id
    ) throws UserException {

        userService.deleteUser(id);

        return ResponseEntity.ok("User deleted successfully");
    }
}
