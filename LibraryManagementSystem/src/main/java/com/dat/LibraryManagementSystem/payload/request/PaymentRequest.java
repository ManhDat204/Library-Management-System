package com.dat.LibraryManagementSystem.payload.request;
import com.dat.LibraryManagementSystem.domain.PaymentGateway;
import com.dat.LibraryManagementSystem.domain.PaymentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "User id la bat buoc")
    private Long userId;


    private Long bookLoanId;
    @NotNull(message = "Loai thanh toan la bat buoc")
    private PaymentType paymentType;

    @NotNull(message = "Cong thanh toan la bat buoc")
    private PaymentGateway paymentGateway;

    @NotNull(message = "So tien la bat buoc")
    @Positive(message = "So tien phai duong")
    private Long amount;

    @Size(min = 3, max = 3, message = "Loai tien te phai la VND")
    private String currency="VND";

    @Size(max = 500, message = "Loai tien te phai la VND")
    private String description;

    private Long subscriptionId;







}
