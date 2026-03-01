package com.dat.LibraryManagementSystem.payload.request;

import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RenewalRequest {
    @NotNull(message = "Book loan id la bat buoc")
    private Long bookLoanId;

    @Min(value = 1, message = "Ngay gia han it nhat la 1")
            private Integer extensionDays=14;

    private String notes;
}
