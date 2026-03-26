package com.dat.LibraryManagementSystem.model;


import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import com.dat.LibraryManagementSystem.domain.BookLoanType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.cglib.core.internal.LoadingCache;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookLoan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @JoinColumn(nullable = false)
    @ManyToOne
    private User user;

    @JoinColumn(nullable = false)
    @ManyToOne
    private Book book;

    private BookLoanType bookLoanType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BookLoanStatus status;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id")
    private Address address;

    @Column( nullable = false)
    private LocalDate checkoutDate;

    private LocalDate dueDate;

    private LocalDate returnDate;





    @Column( length = 500)
    private String notes;

    @Column( nullable = false)
    private Boolean isOverDue = false;

    @Column( nullable = false)
    private Integer overdueDays =0;

    @Column( nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column( nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;


    public boolean isActive() {
        return status == BookLoanStatus.CHECK_OUT
                || status == BookLoanStatus.OVERDUE
                || status == BookLoanStatus.SHIPPING
                || status == BookLoanStatus.DELIVERED;
    }

}
