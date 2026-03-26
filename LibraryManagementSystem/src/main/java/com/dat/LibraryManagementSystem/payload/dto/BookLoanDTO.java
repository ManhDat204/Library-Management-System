package com.dat.LibraryManagementSystem.payload.dto;


import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import com.dat.LibraryManagementSystem.domain.BookLoanType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookLoanDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long bookId;
    private String bookTitle;
    private String bookIsbn;
    private Long authorId;
    private String authorName;
    private String bookCoverImage;
    private BookLoanType bookLoanType;
    private BookLoanStatus bookLoanStatus;
    private LocalDate checkoutDate;
    private LocalDate dueDate;
    private Long remainingDays;
    private LocalDate returnDate;

    private Long addressId;
    private String recipientName;
    private String phoneNumber;
    private String province;
    private String district;
    private String ward;
    private BigDecimal fineAmount;
    private Boolean finePaid;
    private String notes;
    private Boolean isOverdue;
    private Integer overdueDays;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
