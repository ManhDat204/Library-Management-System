package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.mapper.AuthorMapper;
import com.dat.LibraryManagementSystem.model.Author;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.payload.dto.AuthorDTO;
import com.dat.LibraryManagementSystem.repository.AuthorRepository;
import com.dat.LibraryManagementSystem.repository.BookRepository;
import com.dat.LibraryManagementSystem.service.AuthorService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.dat.LibraryManagementSystem.payload.request.AuthorSearchRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import org.springframework.http.ResponseEntity;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthorServiceImpl implements AuthorService {

    private final AuthorRepository authorRepository;
    private final AuthorMapper authorMapper;
    private final BookRepository bookRepository;

    @Override
    public AuthorDTO createAuthor(AuthorDTO dto) {

        Author author = authorMapper.toEntity(dto);
        Author savedAuthor = authorRepository.save(author);
        return authorMapper.toDTO(savedAuthor);
    }

    @Override
    public AuthorDTO updateAuthor(Long id, AuthorDTO dto) throws Exception {

        Author author = authorRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new Exception("Author not found"));
        authorMapper.updateEntityFromDTO(dto, author);
        Author updatedAuthor = authorRepository.save(author);
        return authorMapper.toDTO(updatedAuthor);
    }

    @Override
    public AuthorDTO getAuthorById(Long id) throws Exception {

        Author author = authorRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new Exception("Author not found"));
        return authorMapper.toDTO(author);
    }

    @Override
    public List<AuthorDTO> getAllAuthors() {
        return authorRepository.findAll()
                .stream()
                .map(authorMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAuthor(Long id) throws Exception {

        Author author = authorRepository.findById(id)
                .orElseThrow(() -> new Exception("Author not found"));


        authorRepository.delete(author);
    }

    @Override
    public void softDeleteAuthor(Long id) throws Exception {

        Author author = authorRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new Exception("Author not found"));

        author.setDeleted(true);
        authorRepository.save(author);
    }


    @Override
    public PageResponse<AuthorDTO> searchAuthors(AuthorSearchRequest request) {
        Sort sort = Sort.by(
                "DESC".equalsIgnoreCase(request.getSortDirection())
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                request.getSortBy()
        );
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<Author> page;
        if (request.getSearchTerm() != null && !request.getSearchTerm().trim().isEmpty()) {
            String searchTerm = "%" + request.getSearchTerm().toLowerCase() + "%";
            page = authorRepository.searchByNameOrNationality(searchTerm, pageable);
        } else {
            page = authorRepository.findAll(pageable);
        }

        return new PageResponse<>(
                page.getContent().stream()
                        .map(this::convertToDTO)
                        .collect(java.util.stream.Collectors.toList()),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast(),
                page.isFirst(),
                page.isEmpty()
        );
    }

    private AuthorDTO convertToDTO(Author author) {
        AuthorDTO dto = new AuthorDTO();
        dto.setId(author.getId());
        dto.setAuthorName(author.getAuthorName());
        dto.setNationality(author.getNationality());
        dto.setBiography(author.getBiography());
        return dto;
    }
}