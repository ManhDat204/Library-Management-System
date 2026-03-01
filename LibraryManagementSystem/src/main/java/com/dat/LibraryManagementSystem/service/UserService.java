package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.UserDTO;

import java.util.List;

public interface UserService {
    public User getCurrentUser() throws UserException;
    public List<UserDTO> getAllUsers();
    User findById(Long id) throws Exception;

}
