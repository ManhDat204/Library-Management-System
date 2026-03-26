package com.dat.LibraryManagementSystem.payload.request;

import com.dat.LibraryManagementSystem.payload.dto.BookDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookSearchRequest {

    private String searchTerm;
    private Long genreId;
    private Long authorId;
    private Long publisherId;
    private Boolean availableOnly;
    private Integer page = 0;
    private Integer size = 20;
    private String sortBy="createdAt";
    private String sortDirection="DESC";

}
