package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.payload.dto.AuthorDTO;
import com.dat.LibraryManagementSystem.payload.request.AuthorSearchRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;

import java.util.List;

public interface AuthorService {

    AuthorDTO createAuthor(AuthorDTO dto);

    AuthorDTO updateAuthor(Long id, AuthorDTO dto) throws Exception;

    AuthorDTO getAuthorById(Long id) throws Exception;

    List<AuthorDTO> getAllAuthors();

    void deleteAuthor(Long id) throws Exception;

    public void softDeleteAuthor(Long id) throws Exception;

    PageResponse<AuthorDTO> searchAuthors(AuthorSearchRequest request);

}
