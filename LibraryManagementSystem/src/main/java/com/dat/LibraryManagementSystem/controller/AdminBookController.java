package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.exception.BookException;
import com.dat.LibraryManagementSystem.payload.dto.BookDTO;
import com.dat.LibraryManagementSystem.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/admin/book")
public class AdminBookController {

    private final BookService bookService;

    @PostMapping()
    public ResponseEntity<BookDTO> createBook(
            @Valid @RequestBody BookDTO bookDTO) throws BookException {
        BookDTO createdBook = bookService.createBook(bookDTO);
        return ResponseEntity.ok(createdBook);
    }

}
