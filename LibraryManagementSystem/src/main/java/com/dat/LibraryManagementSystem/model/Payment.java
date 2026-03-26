package com.dat.LibraryManagementSystem.model;




import com.dat.LibraryManagementSystem.domain.PaymentGateway;
import com.dat.LibraryManagementSystem.domain.PaymentStatus;
import com.dat.LibraryManagementSystem.domain.PaymentType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;


import java.time.LocalDateTime;
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Subscription subscription;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    private PaymentGateway gateway;

    private Long amount;

    @Column(name = "fine_id")
    private Long fineId;

    // Mã giao dịch của hệ thống
    private String txnRef;

    // Mã giao dịch trả về từ VNPay
    private String transactionId;

    // Secure hash VNPay
    private String secureHash;

    private String description;
    private String failureReason;

    private LocalDateTime initiatedAt;
    private LocalDateTime completedAt;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
