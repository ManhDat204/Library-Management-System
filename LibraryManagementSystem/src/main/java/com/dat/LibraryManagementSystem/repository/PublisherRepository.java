package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.model.Publisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PublisherRepository extends JpaRepository<Publisher, Long> {
    boolean existsByName(String name);

    Optional<Publisher> findByName(String name);

    List<Publisher> findByActiveTrueOrderByCreatedAtDesc();

    List<Publisher> findByActiveTrue();

    @Query("SELECT p FROM Publisher p WHERE p.active = true " +
            "AND (:searchTerm IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(p.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))) "
            +
            "AND (:address IS NULL OR p.address = :address) " +
            "ORDER BY p.createdAt DESC")
    Page<Publisher> searchPublishers(@Param("searchTerm") String searchTerm,
            @Param("address") String address,
            Pageable pageable);
}
