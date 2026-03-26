package com.dat.LibraryManagementSystem.payload.dto;


import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublisherDTO {
    private Long id;
    private String name;
    private String country;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}