package com.dat.LibraryManagementSystem.mapper;

import com.dat.LibraryManagementSystem.model.Fine;
import com.dat.LibraryManagementSystem.payload.dto.FineDTO;
import org.springframework.stereotype.Component;

@Component
public class FineMapper {

        public FineDTO toDTO(Fine fine){

            return FineDTO.builder()
                    .id(fine.getId())
                    .userId(fine.getUser().getId())
                    .userName(fine.getUser().getFullName())
                    .bookLoanId(fine.getBookLoan().getId())
                    .bookTitle(fine.getBookLoan().getBook().getTitle())
                    .overdueDays(fine.getOverdueDays())
                    .amount(fine.getAmount().longValue())
                    .status(fine.getStatus())
                    .reason(fine.getReason())
                    .paidAt(fine.getPaidAt())
                    .createdAt(fine.getCreatedAt())
                    .build();
        }
    }

