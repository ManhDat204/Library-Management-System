package com.dat.LibraryManagementSystem.payload.dto;

import com.dat.LibraryManagementSystem.model.Genre;
import jakarta.persistence.Column;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookDTO {
    private Long id;
    @NotBlank(message = "isbn la bat buoc ")
    private String isbn;

    @NotBlank(message = "Title la bat buoc ")
    @Size(min =1, max = 255, message = "Tieu de co do dai tu 1 den 255")
    private String title;

    private Long authorId;
    private String authorName;

    @NotNull(message = "The loai la bat buoc")
    private Long genreId;

    private String genreName;
    private String genreCode;



    private Long publisherId;
    private String publisherName;



    private LocalDate publicationDate;

    @Size( max = 20, message = "Ngon ngu khong qua 20 ki tu")
    private String language;

    @Size( max = 2000, message = "Mo ta khong qua 2000 ki tu")
    private String description;

    @Min(value =1, message="So trang it nhat la 1")
    @Max(value=5000, message="So trang toi da la 5000")
    private Integer pages;

    @Min(value =0, message="Tong so ban khong the am")
    @NotNull(message = "Tong so ban la bat buoc")
    private Integer totalCopies;

    @Min(value =0, message="Tong so ban co san khong the am")
    @NotNull(message = "Tong so ban co san la bat buoc")
    private Integer availableCopies;

    @DecimalMin(value="0.0" , inclusive = true, message = "Gia khong the am")
    @Digits(integer =8, fraction = 3, message = "Gia phai co it nhat 8 so")
    private BigDecimal price;

    @Size( max = 500, message = "Link anh khong qua 500 ki tu")
    private String coverImageUrl;

    private Boolean active;

    private Boolean alreadyHaveLoan;
    private Boolean alreadyHaveReservation;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
