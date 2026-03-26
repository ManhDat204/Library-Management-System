package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.model.Publisher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PublisherRepository extends JpaRepository<Publisher, Long> {
    boolean existsByName(String name);
    Optional<Publisher> findByName(String name);
}
