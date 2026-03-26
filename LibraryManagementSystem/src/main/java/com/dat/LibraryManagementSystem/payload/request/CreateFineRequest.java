package com.dat.LibraryManagementSystem.payload.request;


import com.dat.LibraryManagementSystem.domain.FineType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateFineRequest {
    @NotNull(message = "Ma sach la bat buoc")
    private Long bookLoanId;

    @NotNull(message = "Loai phat la bat buoc")
    private FineType fineType;

    @NotNull(message = "Phi phat la bat buoc")
    @Positive(message = "Phi phat phai la so  duong")
    private Long amount;

    private String reason;

    private String notes;
}
