package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.repository.UserRepository;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Collections;


@Service
public class CustomerUserServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;


    public CustomerUserServiceImpl (UserRepository   userRepository){
        this.userRepository = userRepository;
    }



    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username);

        if(user == null){
            throw new UsernameNotFoundException("User"+ username + " khong ton tai ");
        }
        GrantedAuthority authority = new SimpleGrantedAuthority(user.getRole().toString());

        Collection<? extends GrantedAuthority> authorities = Collections.singletonList(authority);
        return new org.springframework.security.core.userdetails.User(
                user.getEmail(), user.getPassword() , authorities
        );
    }



}
