package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.payload.dto.BookLoanDTO;
import com.dat.LibraryManagementSystem.payload.request.*;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;

public interface BookLoanService {
    BookLoanDTO checkoutBook(CheckoutRequest checkoutRequest) throws Exception;

    BookLoanDTO requestReturn(CheckInRequest checkInRequest) throws Exception;

    // Thêm mới
    BookLoanDTO approveReturn(ApproveReturnRequest request) throws Exception;

    BookLoanDTO checkoutBookForUser(Long userId, CheckoutRequest checkoutRequest) throws Exception;

    // BookLoanDTO checkInBook(CheckInRequest checkInRequest ) throws Exception;

    PageResponse<BookLoanDTO> getMyBookLoans(BookLoanStatus bookLoanStatus, int page, int size) throws UserException;

    PageResponse<BookLoanDTO> getBookLoans(BookLoanSearchRequest request) throws UserException;

    int updateOverdueBookLoan();

    BookLoanDTO getMyBookLoanById(Long id) throws Exception;

    // User xác nhận đã nhận sách khi status = SHIPPING
    BookLoanDTO confirmReceived(Long loanId) throws Exception;

    // Admin đánh dấu đang vận chuyển
    BookLoanDTO markAsShipping(Long loanId, String handledBy) throws Exception;

    // Admin đánh dấu giao hàng thành công
    BookLoanDTO markDelivered(Long loanId) throws Exception;

}
