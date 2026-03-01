package com.dat.LibraryManagementSystem.payload.dto;

import com.dat.LibraryManagementSystem.domain.PaymentGateway;
import com.dat.LibraryManagementSystem.domain.PaymentStatus;
import com.dat.LibraryManagementSystem.domain.PaymentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDTO {
    private Long id;
    @NotNull(message = "User id la bat buoc")
    private Long userId;
    private String userName;
    private String userEmail;
    private Long bookLoanId;
    private Long subscriptionId;
    @NotNull(message = "Loai thanh toan la bat buoc")
    private PaymentType paymentType;

    private PaymentStatus paymentStatus;

    @NotNull(message = "Cong thanh toan la bat buoc")
    private PaymentGateway gateway;

    @NotNull(message = "Tong tien la bat buoc")
    @Positive(message = "Tong tien la duong")
    private Long amount;

    @Size(min = 3, max = 3, message = "Loai tien la VND")
    private String currency;


    private String txnRef;
    private String transactionId;
    private String secureHash;

    private String description;
    private String failureReason;

    private LocalDateTime initiatedAt;
    private LocalDateTime completedAt;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
