package com.dat.LibraryManagementSystem.payload.dto;

import com.dat.LibraryManagementSystem.domain.FineStatus;
import com.dat.LibraryManagementSystem.domain.FineType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class FineDTO {

    private Long id;

    private Long bookLoanId;
    private String bookTitle;

    private Long userId;
    private String userName;

    private Integer overdueDays;

    private Long paymentId;

    private Long amount;

    private FineType fineType;

    private FineStatus status;

    private String reason;

    private String notes;

    private String waiverReason;

    private LocalDateTime paidAt;

    private LocalDateTime createdAt;
}