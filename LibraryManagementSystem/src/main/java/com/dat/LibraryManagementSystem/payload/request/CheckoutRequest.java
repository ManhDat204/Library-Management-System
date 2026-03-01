package com.dat.LibraryManagementSystem.payload.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutRequest {
    @NotNull(message = "Ma sach la bat buoc")
    private Long bookId;
    @Min(value = 1, message = "Checkout day co it nhat la 1 ngay")
    private Integer checkoutDays = 14;

    private String notes;




}
