package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.mapper.UserMapper;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.UserDTO;
import com.dat.LibraryManagementSystem.repository.UserRepository;
import com.dat.LibraryManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    public final UserRepository userRepository;
    public final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public User getCurrentUser() throws UserException {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email);
        if(user ==null){
            throw new UserException("Nguoi dung khong ton tai");
        }
        return user;
    }

    @Override
    public List<UserDTO> getAllUsers() {
        List<User> users= userRepository.findAll();

        return users.stream().map(
                UserMapper::toDTO
        ).collect(Collectors.toList());
    }

    @Override
    public User findById(Long id) throws Exception {
        return userRepository.findById(id).orElseThrow(
                ()-> new Exception("User khong ton tai voi id")
        );
    }

    @Override
    public UserDTO updateUser(Long id, UserDTO dto) throws UserException {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserException("User not found"));

        if(dto.getRole() != null){
            user.setRole(dto.getRole());
        }


        userRepository.save(user);

        return userMapper.toDTO(user);
    }

    @Override
    public UserDTO updateMyProfile(UserDTO dto) throws UserException {
        User currentUser = getCurrentUser();

        if (dto.getFullName() != null && !dto.getFullName().isBlank()) {
            currentUser.setFullName(dto.getFullName());
        }
        if (dto.getPhone() != null) {
            currentUser.setPhone(dto.getPhone());
        }
        if (dto.getEmail() != null && !dto.getEmail().isBlank()
                && !dto.getEmail().equals(currentUser.getEmail())) {
            // Kiểm tra email mới chưa bị dùng bởi người khác
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new UserException("Email này đã được sử dụng bởi tài khoản khác");
            }
            currentUser.setEmail(dto.getEmail());
        }
        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            currentUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        // KHÔNG cho đổi role ở đây

        userRepository.save(currentUser);
        return userMapper.toDTO(currentUser);
    }

    @Override
    public void deleteUser(Long id) throws UserException {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserException("User not found"));

        userRepository.delete(user);
    }

}
