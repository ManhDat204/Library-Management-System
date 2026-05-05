package com.dat.LibraryManagementSystem.payload.request;

import lombok.Data;

@Data
public class GenreSearchRequest {
    private String searchTerm;
    private int page = 0;
    private int size = 10;
    private String sortBy = "name";
    private String sortDirection = "ASC";
}