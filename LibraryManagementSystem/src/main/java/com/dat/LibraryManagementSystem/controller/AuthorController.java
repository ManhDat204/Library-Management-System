package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.payload.dto.AuthorDTO;
import com.dat.LibraryManagementSystem.payload.request.AuthorSearchRequest;
import com.dat.LibraryManagementSystem.payload.response.ApiResponse;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/authors")
public class AuthorController {

    private final AuthorService authorService;

    @PostMapping("/create")
    public ResponseEntity<?> createAuthor(@RequestBody AuthorDTO dto) {
        AuthorDTO created = authorService.createAuthor(dto);
        return ResponseEntity.ok(created);
    }



    @GetMapping("/{authorId}")
    public ResponseEntity<?> getAuthorById(@PathVariable("authorId") Long authorId) throws Exception {
        AuthorDTO author = authorService.getAuthorById(authorId);
        return ResponseEntity.ok(author);
    }

    @PutMapping("/{authorId}")
    public ResponseEntity<?> updateAuthor(@PathVariable("authorId") Long authorId,
                                          @RequestBody AuthorDTO dto) throws Exception {
        AuthorDTO updated = authorService.updateAuthor(authorId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{authorId}")
    public ResponseEntity<?> deleteAuthor(@PathVariable("authorId") Long authorId) throws Exception {
        authorService.deleteAuthor(authorId);
        ApiResponse response = new ApiResponse("Xóa tác giả thành công", true);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<?> getAllAuthors(
            @RequestParam(defaultValue = "") String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {

        AuthorSearchRequest request = new AuthorSearchRequest();
        request.setSearchTerm(searchTerm);
        request.setPage(page);
        request.setSize(size);
        request.setSortBy(sortBy);
        request.setSortDirection(sortDirection);

        return ResponseEntity.ok(authorService.searchAuthors(request));
    }
}