package com.dat.LibraryManagementSystem.mapper;

import com.dat.LibraryManagementSystem.model.Address;
import com.dat.LibraryManagementSystem.model.BookLoan;
import com.dat.LibraryManagementSystem.payload.dto.BookLoanDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
public class BookLoanMapper {
    public BookLoanDTO toDTO(BookLoan bookLoan) {
        if (bookLoan == null) {
            return null;
        }
        BookLoanDTO dto = new BookLoanDTO();
        dto.setId(bookLoan.getId());

        // thong tin nguoi dung
        if (bookLoan.getUser() != null) {
            dto.setUserId(bookLoan.getUser().getId());
            dto.setUserName(bookLoan.getUser().getFullName());
            dto.setUserEmail(bookLoan.getUser().getEmail());
        }

        // thong tin sach
        if (bookLoan.getBook() != null) {
            dto.setBookId(bookLoan.getBook().getId());
            dto.setBookTitle(bookLoan.getBook().getTitle());
            dto.setBookIsbn(bookLoan.getBook().getIsbn());
            dto.setAuthorName(bookLoan.getBook().getAuthor().getAuthorName());
            dto.setBookCoverImage(bookLoan.getBook().getCoverImageUrl());
        }

        // chi tiet muon sach
        dto.setHandledBy(bookLoan.getHandledBy());
        dto.setBookLoanType(bookLoan.getBookLoanType());
        dto.setBookLoanStatus(bookLoan.getStatus());
        dto.setCheckoutDate(bookLoan.getCheckoutDate());
        dto.setCheckoutDateTime(bookLoan.getCheckoutDateTime());
        if (bookLoan.getCheckoutDateTime() != null) {
            dto.setCheckoutTime(bookLoan.getCheckoutDateTime().format(DateTimeFormatter.ofPattern("HH:mm")));
        }
        dto.setDueDate(bookLoan.getDueDate());
        dto.setRemainingDays(
                ChronoUnit.DAYS.between(
                        LocalDate.now(),
                        bookLoan.getDueDate()));
        dto.setReturnDate(bookLoan.getReturnDate());

        dto.setNotes(bookLoan.getNotes());
        dto.setIsOverdue(bookLoan.getIsOverDue());
        dto.setOverdueDays(bookLoan.getOverdueDays());
        dto.setCreatedAt(bookLoan.getCreatedAt());
        dto.setUpdatedAt(bookLoan.getUpdatedAt());

        if (bookLoan.getAddress() != null) {
            Address addr = bookLoan.getAddress();
            dto.setAddressId(addr.getId());
            dto.setRecipientName(addr.getRecipientName());
            dto.setPhoneNumber(addr.getPhoneNumber());
            dto.setProvince(addr.getProvince());
            dto.setDistrict(addr.getDistrict());
            dto.setWard(addr.getWard());

        }
        return dto;
    }
}
