package com.dat.LibraryManagementSystem.service;
import com.dat.LibraryManagementSystem.exception.GenreException;
import com.dat.LibraryManagementSystem.payload.dto.GenreDTO;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;




public interface GenreService {
    GenreDTO createGenre (GenreDTO genre);

    List<GenreDTO> getAllGenres();

    GenreDTO getGenreById(Long genreId) throws GenreException;

    GenreDTO updateGenre(Long genreId, GenreDTO genreDTO) throws GenreException;

    void deleteGenre(Long genreId) throws GenreException;

    void hardDeleteGenre(Long genreId) throws GenreException;



    List<GenreDTO> getAllActiveGenresWithSubGenres();

    List<GenreDTO> getSubGenres(Long genreId);

//    List<GenreDTO> getTopLevelGenresWithSubGenres();

    List<GenreDTO> getTopLevelGenres();

    // Page<GenreDTO> searchGenres(String searchTerm, Pageable pageable);

    long getTotalActiveGenres();

    long getBookCountByGenres(Long genreId);

}