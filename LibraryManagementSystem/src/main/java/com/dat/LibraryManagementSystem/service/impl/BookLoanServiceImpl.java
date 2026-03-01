package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import com.dat.LibraryManagementSystem.domain.BookLoanType;
import com.dat.LibraryManagementSystem.exception.BookException;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.mapper.BookLoanMapper;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.model.BookLoan;
import com.dat.LibraryManagementSystem.model.Subscription;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.BookLoanDTO;
import com.dat.LibraryManagementSystem.payload.dto.SubscriptionDTO;
import com.dat.LibraryManagementSystem.payload.request.BookLoanSearchRequest;
import com.dat.LibraryManagementSystem.payload.request.CheckInRequest;
import com.dat.LibraryManagementSystem.payload.request.CheckoutRequest;
import com.dat.LibraryManagementSystem.payload.request.RenewalRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.repository.BookLoanRepository;
import com.dat.LibraryManagementSystem.repository.BookRepository;
import com.dat.LibraryManagementSystem.service.BookLoanService;
import com.dat.LibraryManagementSystem.service.SubscriptionService;
import com.dat.LibraryManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.awt.*;
import java.time.LocalDate;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class BookLoanServiceImpl implements BookLoanService {

    private final BookLoanRepository bookLoanRepository;
    private final BookRepository bookRepository;
    private final UserService userService;
    private final SubscriptionService subscriptionService;
    private final BookLoanMapper bookLoanMapper;
    @Override
    public BookLoanDTO checkoutBook(CheckoutRequest checkoutRequest) throws Exception {
        User user = userService.getCurrentUser();

        return checkoutBookForUser(user.getId(), checkoutRequest);
    }

    @Override
    public BookLoanDTO checkoutBookForUser(Long userId, CheckoutRequest checkoutRequest) throws Exception {
        User user = userService.findById(userId);

        //user has active subscription

        SubscriptionDTO subscription = subscriptionService
                .getUsersActiveSubscription(user.getId());

        Book book = bookRepository.findById(checkoutRequest.getBookId())
                .orElseThrow(() -> new BookException("Sach khong ton tai voi id" + checkoutRequest.getBookId()));

        if (!book.getActive()) {
            throw new BookException("Book khong active");
        }
        if (book.getAvailableCopies() <= 0) {
            throw new BookException("Book khong co san");
        }
        //kiem tra user da co book checkout nay chua
        if(bookLoanRepository.hasActiveCheckout(userId, book.getId())){
            throw new BookException("Book da co active checkout");
        }
        //kiem tra gioi han user active checkout

        long activeCheckouts = bookLoanRepository.countActiveBookLoanByUser(userId);
        int maxBooksAllowed = subscription.getMaxBooksAllowed();

        if(activeCheckouts>=maxBooksAllowed){
            throw new Exception("Ban da dat gioi han muon sach");
        }

        // kiem tra overdue book

        long overdueCount = bookLoanRepository.countOverdueBookLoansByUser(userId);
        if(overdueCount>0) {
            throw new Exception("Lan tra dau tien cho viec qua han");
        }

        //tao book loan
            BookLoan bookLoan = BookLoan.builder()
                    .user(user)
                    .book(book)
                    .bookLoanType(BookLoanType.CHECKOUT)
                    .status(BookLoanStatus.CHECK_OUT)
                    .checkoutDate(LocalDate.now())
                    .dueDate(LocalDate.now().plusDays(checkoutRequest.getCheckoutDays()))
                    .reneWalCount(0)
                    .maxRenewals(2)
                    .notes(checkoutRequest.getNotes())
                    .isOverDue(false)
                    .overdueDays(0)
                    .build();

        //cap nhat book co san {tru 1 them sau }
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        //save book loan
        BookLoan savedBookLoan = bookLoanRepository.save(bookLoan);

        return bookLoanMapper.toDTO(savedBookLoan);

    }

    @Override
    public BookLoanDTO checkInBook(CheckInRequest checkInRequest) throws Exception {
        //validate book loan ton tai
        BookLoan bookLoan = bookLoanRepository.findById(checkInRequest.getBookLoanId())
                .orElseThrow(()-> new Exception("Book loan khong ton tai"));


        //kiem tra neu san sang returned
        if(!bookLoan.isActive()){
            throw  new BookException("book loan is not active");
        }

        // set return date
        bookLoan.setReturnDate(LocalDate.now());
        BookLoanStatus condition = checkInRequest.getCondition();
        if(condition ==null){
            condition = BookLoanStatus.RETURNED;
        }
        bookLoan.setStatus(condition);

        // fine todo
        bookLoan.setOverdueDays(0);
        bookLoan.setIsOverDue(false);
        //
        bookLoan.setNotes("book retured by user");
        //7 cap nhat book co san
        if(condition !=BookLoanStatus.LOST){
            Book book = bookLoan.getBook();
            book.setAvailableCopies(book.getAvailableCopies()+1);
            bookRepository.save(book);
        }
        BookLoan savedBookLoan = bookLoanRepository.save(bookLoan);
        return bookLoanMapper.toDTO(savedBookLoan);

    }

    @Override
    public BookLoanDTO renewCheckout(RenewalRequest renewalRequest) throws Exception {
        BookLoan bookLoan = bookLoanRepository.findById(renewalRequest.getBookLoanId())
                .orElseThrow(()-> new Exception("Book loan khong ton tai"));

        //kiem tra co the renewed

        if(!bookLoan.canRenew()){
            throw new BookException("book khong the renewed");
        }
        // cap nhat due date
        bookLoan.setDueDate(bookLoan.getDueDate().plusDays(renewalRequest.getExtensionDays()));
        bookLoan.setReneWalCount(bookLoan.getReneWalCount() + 1);

        bookLoan.setNotes("book renewed boi nguoi dung");
        BookLoan savedBookLoan = bookLoanRepository.save(bookLoan);
        return bookLoanMapper.toDTO(savedBookLoan);
    }

    @Override
    public PageResponse<BookLoanDTO> getMyBookLoans(BookLoanStatus status, int page, int size) throws UserException {
        User currentUser = userService.getCurrentUser();
        Page<BookLoan> bookLoanPage;

        if(status !=null){
            // tra ve chi checkout active , sap xep theo due date
            Pageable pageable = PageRequest.of(page, size, Sort.by("dueDate").ascending());
            bookLoanPage = bookLoanRepository.findByStatusAndUser(
                    status, currentUser, pageable
            );

        }else{
            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            bookLoanPage = bookLoanRepository.findByUserId(currentUser.getId(), pageable);
        }

        return convertToPageResponse(bookLoanPage);
    }

    @Override
    public PageResponse<BookLoanDTO> getBookLoans(BookLoanSearchRequest searchRequest){

        Pageable pageable = createPageable(
                searchRequest.getPage(),
                searchRequest.getSize(),
                searchRequest.getSortBy(),
                searchRequest.getSortDirection()
        );
        Page<BookLoan> bookLoanPage;

        if(Boolean.TRUE.equals(searchRequest.getOverdueOnly())){
            bookLoanPage = bookLoanRepository.findOverdueBookLoans(LocalDate.now(), pageable);
        }

        if(searchRequest.getUserId() != null){
            bookLoanPage = bookLoanRepository.findByUserId(searchRequest.getUserId(), pageable);

        }else if (searchRequest.getBookId() != null) {
            bookLoanPage = bookLoanRepository.findByBookId(searchRequest.getBookId(), pageable);

        }else if (searchRequest.getStatus() != null) {
            bookLoanPage = bookLoanRepository.findByStatus(searchRequest.getStatus(), pageable);

        }else if (searchRequest.getStartDate()!= null && searchRequest.getEndDate() !=null) {
           bookLoanPage =bookLoanRepository.findBookLoansByDateRange(
                   searchRequest.getStartDate(),
                   searchRequest.getEndDate(),
                   pageable
           );
        }
        else {
            //mac dinh tra ve tat ca loan
            bookLoanPage = bookLoanRepository.findAll(pageable);
        }
        /// convert entities to dto and wrap in response obj
        return convertToPageResponse(bookLoanPage);

    }

    @Override
    public int updateOverdueBookLoan() {
        Pageable pageable = PageRequest.of(0,1000);
        Page<BookLoan> overduePage = bookLoanRepository.findOverdueBookLoans(LocalDate.now(), pageable);
        int updateCount =0;
        for(BookLoan bookLoan : overduePage.getContent()){
            if(bookLoan.getStatus()==BookLoanStatus.CHECK_OUT){
                bookLoan.setStatus(BookLoanStatus.OVERDUE);
                bookLoan.setIsOverDue(true);
                //tinh ngay qua han overdue
                int overdueDays = calculateOverdueDate(
                        bookLoan.getDueDate(),LocalDate.now());

                bookLoanRepository.save(bookLoan);
                updateCount++;
            }
        }
        return updateCount;
    }
    private Pageable createPageable(int page , int size , String sortBy, String sortDirection){
        size = Math.min(size, 10);
        size = Math.max(size, 1);
        Sort sort= sortDirection.equalsIgnoreCase("ASC")
                ?Sort.by(sortBy).ascending():Sort.by(sortBy).descending();
        return PageRequest.of(page, size, sort);

    }

    public PageResponse<BookLoanDTO> convertToPageResponse(Page<BookLoan> bookLoanPage){
        List<BookLoanDTO> bookLoanDTOS = bookLoanPage.getContent()
                .stream()
                .map(bookLoanMapper::toDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(
                bookLoanDTOS,
                bookLoanPage.getNumber(),
                bookLoanPage.getSize(),
                bookLoanPage.getTotalElements(),
                bookLoanPage.getTotalPages(),
                bookLoanPage.isLast(),
                bookLoanPage.isFirst(),
                bookLoanPage.isEmpty()
        );
    }

    public int calculateOverdueDate(LocalDate dueDate, LocalDate today){
        if(today.isBefore(dueDate) || today.isEqual(dueDate)){
            return 0;
        }
        return (int) ChronoUnit.DAYS.between(dueDate, today);
    }
}
