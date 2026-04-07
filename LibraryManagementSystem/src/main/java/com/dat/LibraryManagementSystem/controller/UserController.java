package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.UserDTO;
import com.dat.LibraryManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

        private final UserService userService;

        @GetMapping("/list")
        public ResponseEntity<List<UserDTO>> getAllUsers() {
                return ResponseEntity.ok(
                                userService.getAllUsers());
        }

        @PostMapping("/admin")
        public ResponseEntity<UserDTO> createUser(
                        @RequestBody UserDTO userDTO) throws UserException {
                return ResponseEntity.ok(
                                userService.createUser(userDTO));
        }

        @GetMapping("/profile")
        public ResponseEntity<User> getUserProfile() throws UserException {
                return ResponseEntity.ok(
                                userService.getCurrentUser());
        }

        @PutMapping("/admin/{id}")
        public ResponseEntity<UserDTO> updateUser(
                        @PathVariable Long id,
                        @RequestBody UserDTO userDTO) throws UserException {

                return ResponseEntity.ok(
                                userService.updateUser(id, userDTO));
        }

        @PutMapping("/profile")
        public ResponseEntity<UserDTO> updateMyProfile(
                        @RequestBody UserDTO userDTO) throws UserException {
                return ResponseEntity.ok(
                                userService.updateMyProfile(userDTO));
        }

        @DeleteMapping("/admin/{id}")
        public ResponseEntity<String> deleteUser(
                        @PathVariable Long id) throws UserException {

                userService.deleteUser(id);

                return ResponseEntity.ok("Xoá thành công user");
        }

        @PostMapping("/profile/avatar")
        public ResponseEntity<?> uploadAvatar(
                        @RequestParam("file") MultipartFile file) throws UserException, IOException {

                User currentUser = userService.getCurrentUser();

                String url = userService.updateAvatar(currentUser.getId(), file);

                return ResponseEntity.ok(Map.of("url", url, "message", "Upload thành công"));
        }
}
