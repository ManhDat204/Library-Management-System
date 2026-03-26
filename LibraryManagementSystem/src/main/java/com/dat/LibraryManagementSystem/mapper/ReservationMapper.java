package com.dat.LibraryManagementSystem.mapper;

import com.dat.LibraryManagementSystem.model.Reservation;
import org.springframework.stereotype.Component;
import com.dat.LibraryManagementSystem.payload.dto.ReservationDTO;

import java.time.Duration;
import java.time.LocalDateTime;

@Component
public class ReservationMapper {
    public ReservationDTO toDTO(Reservation reservation){
        if (reservation ==null){
            return null;
        }
        ReservationDTO dto = new ReservationDTO();
        dto.setId(reservation.getId());

        //user
        if(reservation.getUser()!=null){
            dto.setUserId(reservation.getUser().getId());
            dto.setUserName(reservation.getUser().getFullName());
            dto.setUserEmail(reservation.getUser().getEmail());
        }

        if (reservation.getBook()!= null){
            // book info
            dto.setBookId(reservation.getBook().getId());
            dto.setBookTitle(reservation.getBook().getTitle());
            dto.setBookIsbn(reservation.getBook().getIsbn());
            dto.setIsBookAvailable(reservation.getBook().getAvailableCopies()>0);
        }
        if (reservation.getBook().getAuthor() != null) {
            dto.setAuthorId(reservation.getBook().getAuthor().getId());
            dto.setAuthorName(reservation.getBook().getAuthor().getAuthorName());
        } else {
            dto.setAuthorName("Không rõ");
        }
        // Reservation details
        dto.setStatus(reservation.getStatus());
        dto.setReservedAt(reservation.getReservedAt());

        dto.setAvailableAt(reservation.getAvailableAt());
        dto.setAvailableUntil(reservation.getAvailableUntil());
        dto.setFulfilledAt(reservation.getFulfilledAt());
        dto.setCanceledAt(reservation.getCanceledAt());
        dto.setQueuePosition(reservation.getQueuePosition());
        dto.setNotificationSent(reservation.getNotificationSent());
        dto.setNotes(reservation.getNotes());
        dto.setCreatedAt(reservation.getCreatedAt());
        dto.setUpdatedAt(reservation.getUpdatedAt());

        // Computed fields
        dto.setIsExpired(reservation.hasExpired());
        dto.setCanBeCancelled(reservation.canBeCancelled());



        if(reservation.getAvailableUntil() !=null){
            LocalDateTime now = LocalDateTime.now();
            if(now.isBefore(reservation.getAvailableUntil())){
                long hours = Duration.between(now , reservation.getAvailableUntil()).toHours();
                dto.setHoursUntilExpiry(hours);
            }else{
                dto.setHoursUntilExpiry(0L);
            }

        }
        return dto;
    }
}
