package com.dat.LibraryManagementSystem.mapper;

import com.dat.LibraryManagementSystem.model.BookLoan;
import com.dat.LibraryManagementSystem.payload.dto.BookLoanDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Slf4j
@Component
public class BookLoanMapper {
    public BookLoanDTO toDTO(BookLoan bookLoan){
        if(bookLoan ==null){
            return null;
        }
        BookLoanDTO dto = new BookLoanDTO();
        dto.setId(bookLoan.getId());

        // thong tin nguoi dung
        if(bookLoan.getUser()!=null){
            dto.setUserId(bookLoan.getUser().getId());
            dto.setUserName(bookLoan.getUser().getFullName());
            dto.setUserEmail(bookLoan.getUser().getEmail());
        }

        //thong tin sach
        if(bookLoan.getBook()!= null){
            dto.setBookId(bookLoan.getBook().getId());
            dto.setBookTitle(bookLoan.getBook().getTitle());
            dto.setBookIsbn(bookLoan.getBook().getIsbn());
            dto.setBookAuthor(bookLoan.getBook().getAuthor());
            dto.setBookCoverImage(bookLoan.getBook().getCoverImageUrl());
        }

        //chi tiet muon sach
        dto.setBookLoanType(bookLoan.getBookLoanType());
        dto.setBookLoanStatus(bookLoan.getStatus()  );
        dto.setCheckoutDate(bookLoan.getCheckoutDate());
        dto.setDueDate(bookLoan.getDueDate());
        dto.setRemainingDays(
                ChronoUnit.DAYS.between(
                        LocalDate.now(),
                        bookLoan.getDueDate()
                )
        );
        dto.setReturnDate(bookLoan.getReturnDate());
        dto.setRenewalCount(bookLoan.getReneWalCount());
        dto.setMaxRenewals(bookLoan.getMaxRenewals());

        dto.setNotes(bookLoan.getNotes());
        dto.setIsOverdue(bookLoan.getIsOverDue());
        dto.setOverdueDays(bookLoan.getOverdueDays());
        dto.setCreatedAt(bookLoan.getCreatedAt());
        dto.setUpdatedAt(bookLoan.getUpdatedAt());

        return dto;
    }

}
