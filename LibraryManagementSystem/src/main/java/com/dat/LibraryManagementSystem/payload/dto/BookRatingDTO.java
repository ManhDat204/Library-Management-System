package com.dat.LibraryManagementSystem.payload.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BookRatingDTO {
    private Long bookId;
    private Double averageRating;
    private Long totalReviews;
    private Double roundedRating;   // làm tròn 0.5
}