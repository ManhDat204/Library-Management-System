package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.payload.dto.PublisherDTO;
import com.dat.LibraryManagementSystem.service.PublisherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/publishers")

public class PublisherController {

    private final PublisherService publisherService;

    @PostMapping
    public ResponseEntity<PublisherDTO> create(@RequestBody @Valid PublisherDTO dto) throws Exception {
        return ResponseEntity.status(HttpStatus.CREATED).body(publisherService.createPublisher(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PublisherDTO> update(@PathVariable Long id,
            @RequestBody @Valid PublisherDTO dto) {
        return ResponseEntity.ok(publisherService.updatePublisher(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublisherDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(publisherService.getPublisherById(id));
    }

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) String address,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // Luôn dùng searchPublishers để đảm bảo format tương thích
        return ResponseEntity.ok(publisherService.searchPublishers(searchTerm, address, page, size));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        publisherService.deletePublisher(id);
        return ResponseEntity.noContent().build();
    }
}
