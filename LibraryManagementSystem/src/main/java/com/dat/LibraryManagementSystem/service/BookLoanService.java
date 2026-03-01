package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.payload.dto.BookLoanDTO;
import com.dat.LibraryManagementSystem.payload.request.BookLoanSearchRequest;
import com.dat.LibraryManagementSystem.payload.request.CheckInRequest;
import com.dat.LibraryManagementSystem.payload.request.CheckoutRequest;
import com.dat.LibraryManagementSystem.payload.request.RenewalRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;

public interface BookLoanService {
    BookLoanDTO checkoutBook(CheckoutRequest checkoutRequest) throws Exception;


    BookLoanDTO checkoutBookForUser(Long userId, CheckoutRequest checkoutRequest) throws Exception;

    BookLoanDTO checkInBook(CheckInRequest checkInRequest ) throws Exception;

    BookLoanDTO renewCheckout(RenewalRequest renewalRequest) throws Exception;

    PageResponse<BookLoanDTO> getMyBookLoans(BookLoanStatus bookLoanStatus, int page, int  size) throws UserException;

    PageResponse<BookLoanDTO> getBookLoans(BookLoanSearchRequest request) throws UserException;

    int updateOverdueBookLoan();





}
