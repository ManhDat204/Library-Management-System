package com.dat.LibraryManagementSystem.repository;

import com.dat.LibraryManagementSystem.model.Genre;



import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;


public interface GenreRepository extends JpaRepository<Genre, Long> {
    List<Genre> findByActiveTrueOrderByDisplayOrderAsc( );

    List<Genre> findByParentGenreIsNullAndActiveTrueOrderByDisplayOrderAsc( );

    List<Genre> findByParentGenreIdAndActiveTrueOrderByDisplayOrderAsc(Long parentGenreId);

    Long countByActiveTrue();
//    @Query("select count(b) from book b where b.genre.id = : genreId")
//    Long CountBooksByGenre(@Param("genreId") Long genreId);

    @Query("select count(b) from Book b where b.genre.id = :genreId")
    Long countBooksByGenre(@Param("genreId") Long genreId);



}
