package com.dat.LibraryManagementSystem.payload.dto;

import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionPlanDTO {

    private Long id;

    @NotBlank( message = "Ma goi la bat buoc")
    private String planCode;

    @NotBlank( message = "Teen goi la bat buoc")
    private String name;


    private String description;

    @NotNull(message = "Thoi han goi la bat buoc ")
    @Positive(message = "Thoi han goi khong duoc am ")
    private Integer durationDays;

    @NotNull(message = "Gia goi la bat buoc ")
    @Positive(message = "Gía gói không được âm ")
    private Long price;

    private String currency;

    @NotNull(message = "So sach toi da cho phep la bat buoc ")
    @Positive(message = "So sach toi da không được âm ")
    private Integer maxBooksAllowed ;

    @NotNull(message = "So ngay muon toi da la bat buoc ")
    @Positive(message = "So nagy muon không được âm ")
    private Integer maxDaysPerBook;


    private Integer displayOrder;

    private Boolean isActive;
    private Boolean isFeatured ;

    private String badgeText;
    private String adminNotes;


    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String createdBy;
    private String updatedBy;
}
