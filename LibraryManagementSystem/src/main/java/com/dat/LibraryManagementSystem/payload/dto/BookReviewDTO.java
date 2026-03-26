package com.dat.LibraryManagementSystem.payload.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookReviewDTO {
    private Long id;

    @NotNull(message = "User id la bat buoc")
    private Long userId;

    private String userName;

    @NotNull(message = "Book id la bat buoc")
    private Long bookId;

    private String bookTitle;

    @NotNull(message = "rating la bat buoc")
    @Min(value = 1, message = "Rating nho nhat la 1")
    @Max(value = 5, message = "Rating lon nhat la 5")
    private Integer rating;

    @NotBlank(message = "Nhan xet la bat buoc")
    @Size(min = 10, max = 1000, message = "Nhan xet tu 10 den 1000 ky tu")
    private String reviewText;

    @Size( max = 2000, message = "Nhan xet tu 10 den 1000 ky tu")
    private String title;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;



}
