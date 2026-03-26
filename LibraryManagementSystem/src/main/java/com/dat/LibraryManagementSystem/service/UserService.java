package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.UserDTO;

import java.util.List;

public interface UserService {
    public User getCurrentUser() throws UserException;
    public List<UserDTO> getAllUsers();
    User findById(Long id) throws Exception;
    public void deleteUser(Long id) throws UserException;
    public UserDTO updateUser(Long id, UserDTO dto) throws UserException;
    public UserDTO updateMyProfile(UserDTO dto) throws UserException;
}
