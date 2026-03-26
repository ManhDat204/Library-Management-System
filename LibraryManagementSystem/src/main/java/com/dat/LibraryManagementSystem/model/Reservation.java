package com.dat.LibraryManagementSystem.model;


import com.dat.LibraryManagementSystem.domain.ReservationStatus;
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
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status= ReservationStatus.PENDING;

    private LocalDateTime reservedAt;
    private LocalDateTime availableAt;
    private LocalDateTime availableUntil;

    @Column(name = "fulfilled_at")
    private LocalDateTime fulfilledAt;

    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;

    @Column(name = "queue_position")
    private  Integer queuePosition;

    @Column(name = "notification_sent", nullable = false)
    private  Boolean notificationSent = false;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;


    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public boolean canBeCancelled(){
        return status == ReservationStatus.PENDING || status ==ReservationStatus.AVAILABLE;
    }


    //kiem tra dat truoc qua thoi gian
    public boolean hasExpired(){
        return status ==ReservationStatus.AVAILABLE && availableUntil != null
                && LocalDateTime.now().isAfter(availableUntil);
    }


}
