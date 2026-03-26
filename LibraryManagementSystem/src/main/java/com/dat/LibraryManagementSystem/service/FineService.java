package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.domain.FineStatus;
import com.dat.LibraryManagementSystem.domain.FineType;
import com.dat.LibraryManagementSystem.model.BookLoan;
import com.dat.LibraryManagementSystem.model.Fine;
import com.dat.LibraryManagementSystem.payload.dto.FineDTO;
import com.dat.LibraryManagementSystem.payload.request.CreateFineRequest;
import com.dat.LibraryManagementSystem.payload.request.WaiveFineRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

public interface FineService  {
    // return dto list so controller doesn't expose entities
    List<FineDTO> getUserFines(Long userId);


    FineDTO payFine(Long fineId, Long amount) throws Exception;

    void createFine(BookLoan bookLoan, int overdueDays);

    FineDTO createFine(CreateFineRequest request) throws Exception;

    FineDTO waiveFine(WaiveFineRequest request) throws Exception;

    PageResponse<FineDTO> getAllFines(
            FineStatus fineStatus,
            FineType fineType,
            Long userId,
            int page,
            int size
    );

    FineDTO getFine(Long id) throws Exception;

    void createFine(BookLoan bookLoan, FineType fineType, BigDecimal amount, String reason);

    List<FineDTO> getMyFines() throws Exception;

    Long getTotalPendingFines(Long userId);
}
