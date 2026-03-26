package com.dat.LibraryManagementSystem.payload.request;

import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApproveReturnRequest {

    @NotNull(message = "Book loan id là bắt buộc")
    private Long bookLoanId;

    // Admin chọn: RETURNED, DAMAGED, LOST
    private BookLoanStatus condition = BookLoanStatus.RETURNED;

    private String notes;
}