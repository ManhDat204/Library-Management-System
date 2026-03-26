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
import org.springframework.security.access.prepost.PreAuthorize;
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


//    @PostMapping("/checkin")
//    public ResponseEntity<?> checkin(
//            @Valid @RequestBody CheckInRequest checkInRequest) throws Exception{
//        BookLoanDTO bookLoan = bookLoanService.checkInBook(checkInRequest);
//        return new ResponseEntity<>(bookLoan,HttpStatus.CREATED);
//    }
    @GetMapping("/my/{id}")
    public ResponseEntity<BookLoanDTO> getMyBookLoanById(
        @PathVariable Long id) throws Exception {
    BookLoanDTO bookLoan = bookLoanService.getMyBookLoanById(id);
    return ResponseEntity.ok(bookLoan);
}

    // User bấm "Đã nhận đơn"
    @PatchMapping("/my/{id}/confirm-received")
    public ResponseEntity<BookLoanDTO> confirmReceived(
            @PathVariable Long id) throws Exception {
        return ResponseEntity.ok(bookLoanService.confirmReceived(id));
    }

// Thêm vào admin controller (hoặc cùng file, thêm @PreAuthorize):

    // Admin bấm "Giao hàng"
    @PatchMapping("/{id}/shipping")
    public ResponseEntity<BookLoanDTO> markAsShipping(
            @PathVariable Long id) throws Exception {
        return ResponseEntity.ok(bookLoanService.markAsShipping(id));
    }


    @GetMapping("/my")
    public ResponseEntity<?> getMyBookLoans(
            @RequestParam(required = false) BookLoanStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) throws Exception{

        PageResponse<BookLoanDTO> bookLoan= bookLoanService.getMyBookLoans(status, page,size);
        return ResponseEntity.ok(bookLoan);
    }
//    @PostMapping("/my/checkin")
//    public ResponseEntity<?> selfCheckin(
//            @Valid @RequestBody CheckInRequest checkInRequest) throws Exception {
//        BookLoanDTO bookLoan = bookLoanService.checkInBook(checkInRequest);
//        return new ResponseEntity<>(bookLoan, HttpStatus.OK);
//    }


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

    @PostMapping("/my/return-request")
    public ResponseEntity<?> requestReturn(
            @Valid @RequestBody CheckInRequest checkInRequest) throws Exception {
        BookLoanDTO bookLoan = bookLoanService.requestReturn(checkInRequest);
        return ResponseEntity.ok(bookLoan);
    }

    // Admin duyệt yêu cầu trả sách
    @PostMapping("/admin/approve-return")
    public ResponseEntity<?> approveReturn(
            @Valid @RequestBody ApproveReturnRequest request) throws Exception {
        BookLoanDTO bookLoan = bookLoanService.approveReturn(request);
        return ResponseEntity.ok(bookLoan);
    }



}
