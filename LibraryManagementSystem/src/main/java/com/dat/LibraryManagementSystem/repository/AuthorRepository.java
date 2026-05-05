package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.model.Author;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface AuthorRepository extends JpaRepository<Author, Long> {



    @Query(value = "SELECT a FROM Author a WHERE a.deleted = false AND LOWER(a.authorName) LIKE :searchTerm OR LOWER(a.nationality) LIKE :searchTerm")
    Page<Author> searchByNameOrNationality(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Query("SELECT a FROM Author a WHERE a.deleted = false")
    Page<Author> findAll(Pageable pageable);

    @Query("SELECT a FROM Author a WHERE a.id = :id AND a.deleted = false")
    Optional<Author> findByIdAndDeletedFalse(@Param("id") Long id);


}