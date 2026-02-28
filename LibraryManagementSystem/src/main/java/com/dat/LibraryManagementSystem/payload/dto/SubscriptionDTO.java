package com.dat.LibraryManagementSystem.payload.dto;


import com.dat.LibraryManagementSystem.model.SubscriptionPlan;
import com.dat.LibraryManagementSystem.model.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubscriptionDTO {
    private Long id;
    @NotNull(message = "ID nguoi dung la bat buoc")
    private Long userId;

    private String userName;
    private String userEmail;


    @NotNull(message = "ID goi dung la bat buoc")
    private Long planId;

    private String planName;
    private String planCode;
    private Long price;
    private String currency;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean isActive;
    private Boolean autoRenew;
    private Integer maxBooksAllowed;
    private Integer maxDaysPerBook;
    private LocalDateTime cancelledAt;
    private String cancellationReason;
    private String notes;
    private Long daysRemaining;
    private Boolean isValid;
    private Boolean isExpired;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
