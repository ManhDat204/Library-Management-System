package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.mapper.UserMapper;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.UserDTO;
import com.dat.LibraryManagementSystem.repository.UserRepository;
import com.dat.LibraryManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class UserServiceImpl implements UserService {

    public final UserRepository userRepository;

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
}
