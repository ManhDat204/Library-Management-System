package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.exception.GenreException;
import com.dat.LibraryManagementSystem.model.Genre;
import com.dat.LibraryManagementSystem.payload.dto.GenreDTO;
import com.dat.LibraryManagementSystem.payload.response.ApiResponse;
import com.dat.LibraryManagementSystem.repository.GenreRepository;
import com.dat.LibraryManagementSystem.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/genres")


public class GenreController {
    private final GenreService genreService;

    @PostMapping("/create")
     public ResponseEntity<GenreDTO> addGenre(@RequestBody GenreDTO genre) {
         GenreDTO createGenre = genreService.createGenre(genre);
         return ResponseEntity.ok(createGenre);
    }


    @GetMapping("/get")
    public ResponseEntity<?> getAllGenres() {
        List<GenreDTO>  genres = genreService.getAllGenres();
        return ResponseEntity.ok(genres);
    }




    @PutMapping("/{genreId}")
    public ResponseEntity<?> updateGenre(@PathVariable("genreId") Long genreId, @RequestBody GenreDTO genre)
            throws GenreException {
        GenreDTO genres = genreService.updateGenre(genreId, genre);
        return ResponseEntity.ok(genres);
    }

    @DeleteMapping("/{genreId}")
    public ResponseEntity<?> deleteGenre(@PathVariable("genreId") Long genreId)
            throws GenreException {
        genreService.deleteGenre(genreId);
        ApiResponse response = new ApiResponse("Xoa the loai thanh cong - xoa mem", true);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{genreId}/hard")
    public ResponseEntity<?> hardDeleteGenre(@PathVariable("genreId") Long genreId)
            throws GenreException {
        genreService.deleteGenre(genreId);
        ApiResponse response = new ApiResponse("Xoa the loai thanh cong - xoa cung", true);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/top-level")
    public ResponseEntity<?> getTopLevelGenres() {
        List<GenreDTO>  genres = genreService.getTopLevelGenres();
        return ResponseEntity.ok(genres);
    }

    @GetMapping("/top-borrowed")
    public ResponseEntity<List<GenreDTO>> getTopBorrowedGenres(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(genreService.getTopBorrowedGenres(limit));
    }
    @GetMapping("/count")
    public ResponseEntity<?> getTotalActiveGenres() {
        Long genres = genreService.getTotalActiveGenres();
        return ResponseEntity.ok(genres);
    }

    @GetMapping("/{id}/book-count")
    public ResponseEntity<?> getBookCountByGenres(@PathVariable Long id) {
        Long count = genreService.getBookCountByGenres(id);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/{genreId}")
    public ResponseEntity<?> getGenreById(@PathVariable("genreId") Long genreId) throws GenreException {
        GenreDTO genres = genreService.getGenreById(genreId);
        return ResponseEntity.ok(genres);
    }



}
