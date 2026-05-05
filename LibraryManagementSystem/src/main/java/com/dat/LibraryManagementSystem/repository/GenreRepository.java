package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.model.Genre;


import com.dat.LibraryManagementSystem.payload.dto.GenreDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;


public interface GenreRepository extends JpaRepository<Genre, Long> {
    List<Genre> findByActiveTrueOrderByNameAsc();

    List<Genre> findByParentGenreIsNullAndActiveTrueOrderByNameAsc();

    List<Genre> findByParentGenreIdAndActiveTrueOrderByNameAsc(Long parentGenreId);

    Long countByActiveTrue();

    @Query("SELECT COUNT(b) FROM Book b WHERE b.genre.id = :genreId")
    Long countBooksByGenre(@Param("genreId") Long genreId);

    @Query("SELECT g FROM Genre g WHERE g.active = true")
    List<Genre> findAllByOrderByNameAsc();

    @Query("SELECT g FROM Genre g WHERE g.id = :id AND g.active = true")
    Optional<Genre> findByIdAndActiveTrue(@Param("id") Long id);

    @Query(value = "SELECT g.id, g.name, COUNT(bl.id) as borrowCount " +
            "FROM book_loan bl " +
            "JOIN book b ON bl.book_id = b.id " +
            "JOIN genre g ON b.genre_id = g.id " +
            "WHERE g.active = true " +
            "GROUP BY g.id, g.name " +
            "ORDER BY borrowCount DESC " +
            "LIMIT :limit",
            nativeQuery = true)
    List<Object[]> findTopBorrowedGenres(@Param("limit") int limit);

    Page<Genre> findByNameContainingIgnoreCase(String name, Pageable pageable);

}
