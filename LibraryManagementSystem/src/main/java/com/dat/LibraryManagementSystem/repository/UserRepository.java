package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.domain.Gender;
import com.dat.LibraryManagementSystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);

    boolean existsByEmail(String email);

    long countByActiveTrue();

    long countByGender(Gender gender);
}
