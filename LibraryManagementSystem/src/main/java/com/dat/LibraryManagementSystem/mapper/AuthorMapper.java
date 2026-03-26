package com.dat.LibraryManagementSystem.mapper;


import com.dat.LibraryManagementSystem.model.Author;
import com.dat.LibraryManagementSystem.payload.dto.AuthorDTO;
import org.springframework.stereotype.Component;

@Component
public class AuthorMapper {

    public AuthorDTO toDTO(Author author){
        if(author == null){
            return null;
        }

        return AuthorDTO.builder()
                .id(author.getId())
                .authorName(author.getAuthorName())
                .biography(author.getBiography())
                .nationality(author.getNationality())
                .createdAt(author.getCreatedAt())
                .updatedAt(author.getUpdatedAt())
                .build();
    }

    public Author toEntity(AuthorDTO dto){
        if(dto == null){
            return null;
        }

        Author author = new Author();
        author.setId(dto.getId());
        author.setAuthorName(dto.getAuthorName());
        author.setBiography(dto.getBiography());
        author.setNationality(dto.getNationality());

        return author;
    }

    public void updateEntityFromDTO(AuthorDTO dto, Author author){
        if(dto == null || author == null){
            return;
        }
        author.setAuthorName(dto.getAuthorName());
        author.setBiography(dto.getBiography());
        author.setNationality(dto.getNationality());
    }
}