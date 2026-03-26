package com.dat.LibraryManagementSystem.payload.dto;


import com.dat.LibraryManagementSystem.domain.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReservationDTO {

    private Long id;

    // thong tin user
    private Long userId;
    private String userName;
    private String userEmail;


    // thong tin book
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private  Boolean isBookAvailable;

    private Long authorId;
    private String authorName;

    //Chi tiet dat truoc
    private ReservationStatus status;
    private LocalDateTime reservedAt;
    private LocalDateTime availableAt;
    private LocalDateTime availableUntil;
    private LocalDateTime fulfilledAt;
    private LocalDateTime canceledAt;

    private Integer queuePosition;
    private Boolean notificationSent;
    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Boolean isExpired;
    private Boolean canBeCancelled;
    private Long hoursUntilExpiry;




}
