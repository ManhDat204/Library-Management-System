package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import com.dat.LibraryManagementSystem.payload.dto.BookLoanDTO;
import com.dat.LibraryManagementSystem.payload.request.*;
import com.dat.LibraryManagementSystem.payload.response.ApiResponse;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.service.BookLoanService;
import jakarta.validation.Path;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/book-loans")
public class BookLoanController {

    private final BookLoanService bookLoanService;

    @PostMapping("/checkout")
    public ResponseEntity<?> checkoutBook(
            @Valid @RequestBody CheckoutRequest checkoutRequest) throws Exception{
            BookLoanDTO bookLoan = bookLoanService.checkoutBook(checkoutRequest);
            return new ResponseEntity<>(bookLoan, HttpStatus.CREATED);
    }

    @PostMapping("checkout/user/{userId}")
    public ResponseEntity<?> checkoutBookForUser(
            @PathVariable Long userId,
            @Valid @RequestBody CheckoutRequest checkoutRequest) throws Exception{
        BookLoanDTO bookLoan = bookLoanService.checkoutBookForUser(userId, checkoutRequest);
        return new ResponseEntity<>(bookLoan,HttpStatus.CREATED);
    }


    @PostMapping("/checkin")
    public ResponseEntity<?> checkin(
            @Valid @RequestBody CheckInRequest checkInRequest) throws Exception{
        BookLoanDTO bookLoan = bookLoanService.checkInBook(checkInRequest);
        return new ResponseEntity<>(bookLoan,HttpStatus.CREATED);
    }


    @PostMapping("/renew")
    public ResponseEntity<?> renew(
            @Valid @RequestBody RenewalRequest renewalRequest) throws Exception{
        BookLoanDTO bookLoan = bookLoanService.renewCheckout(renewalRequest);
        return new ResponseEntity<>(bookLoan,HttpStatus.OK);
    }


    @GetMapping("/my")
    public ResponseEntity<?> getMyBookLoans(
            @RequestParam(required = false) BookLoanStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) throws Exception{

        PageResponse<BookLoanDTO> bookLoan= bookLoanService.getMyBookLoans(status, page,size);
        return ResponseEntity.ok(bookLoan);
    }


    @PostMapping("/search")
    public ResponseEntity<?> getAllBookLoans(
            @RequestBody BookLoanSearchRequest searchRequest) throws Exception{

            PageResponse<BookLoanDTO> bookLoans= bookLoanService.getBookLoans(searchRequest);
            return ResponseEntity.ok(bookLoans);
    }

    @PostMapping("/admin/update-overdue")
    public ResponseEntity<?> updateOverdueBookLoans() throws Exception{
        int updateCount = bookLoanService.updateOverdueBookLoan();
        return ResponseEntity.ok( new ApiResponse("overdue da cap nhat", true));
    }





}
