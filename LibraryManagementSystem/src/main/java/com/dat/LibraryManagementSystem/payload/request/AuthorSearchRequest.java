package com.dat.LibraryManagementSystem.payload.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorSearchRequest {
    private String searchTerm;
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy = "authorName";
    private String sortDirection = "ASC";
}