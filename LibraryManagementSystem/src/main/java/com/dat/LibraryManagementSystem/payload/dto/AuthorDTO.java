package com.dat.LibraryManagementSystem.payload.dto;

import jakarta.persistence.Column;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthorDTO {

    private Long id;

    private String authorName;

    private String nationality;

    private String biography;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}