package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.model.Genre;


import com.dat.LibraryManagementSystem.payload.dto.GenreDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface GenreRepository extends JpaRepository<Genre, Long> {
    List<Genre> findByActiveTrueOrderByNameAsc();

    List<Genre> findByParentGenreIsNullAndActiveTrueOrderByNameAsc();

    List<Genre> findByParentGenreIdAndActiveTrueOrderByNameAsc(Long parentGenreId);

    Long countByActiveTrue();

    @Query("SELECT COUNT(b) FROM Book b WHERE b.genre.id = :genreId")
    Long countBooksByGenre(@Param("genreId") Long genreId);

    // FIXED: bỏ OrderByDisplayOrder → sort theo name
    List<Genre> findAllByOrderByNameAsc();



}
