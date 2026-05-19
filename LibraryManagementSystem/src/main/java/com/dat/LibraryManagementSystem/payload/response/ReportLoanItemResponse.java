package com.dat.LibraryManagementSystem.payload.response;

import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportLoanItemResponse {
    private Long id;
    private Long bookId;
    private String userName;
    private String bookTitle;
    private String authorName;
    private String coverImageUrl;
    private LocalDate checkoutDate;
    private LocalDate dueDate;
    private LocalDate returnDate;
    private Integer overdueDays;
    private BookLoanStatus status;
}
