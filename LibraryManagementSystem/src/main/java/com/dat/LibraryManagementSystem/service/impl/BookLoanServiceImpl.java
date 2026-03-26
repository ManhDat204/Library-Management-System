package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import com.dat.LibraryManagementSystem.domain.BookLoanType;

import com.dat.LibraryManagementSystem.domain.ReservationStatus;
import com.dat.LibraryManagementSystem.exception.BookException;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.mapper.BookLoanMapper;
import com.dat.LibraryManagementSystem.model.*;
import com.dat.LibraryManagementSystem.payload.dto.BookLoanDTO;
import com.dat.LibraryManagementSystem.payload.dto.SubscriptionDTO;
import com.dat.LibraryManagementSystem.payload.request.*;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.repository.AddressRepository;
import com.dat.LibraryManagementSystem.repository.BookLoanRepository;
import com.dat.LibraryManagementSystem.repository.BookRepository;
import com.dat.LibraryManagementSystem.repository.ReservationRepository;
import com.dat.LibraryManagementSystem.service.*;
import com.dat.LibraryManagementSystem.domain.FineType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.time.LocalDate;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookLoanServiceImpl implements BookLoanService {

    private final BookLoanRepository bookLoanRepository;
    private final BookRepository bookRepository;
    private final UserService userService;
    private final SubscriptionService subscriptionService;
    private final BookLoanMapper bookLoanMapper;
    private final FineService fineService;
    private final ReservationRepository reservationRepository;
    private final EmailService emailService;
    private  final AddressRepository addressRepository;
    private static final int HOURS_TO_PICKUP = 24;

    @Override
    public BookLoanDTO checkoutBook(CheckoutRequest checkoutRequest) throws Exception {
        User user = userService.getCurrentUser();

        return checkoutBookForUser(user.getId(), checkoutRequest);
    }

    @Override
    public BookLoanDTO getMyBookLoanById(Long id) throws Exception {
        User currentUser = userService.getCurrentUser(); // method lấy user đang login
        BookLoan loan = bookLoanRepository.findById(id)
                .orElseThrow(() -> new Exception("Không tìm thấy đơn mượn"));

        // Bảo mật: chỉ cho xem đơn của chính mình
        if (!loan.getUser().getId().equals(currentUser.getId())) {
            throw new Exception("Khong th xem don nay");
        }

        return bookLoanMapper.toDTO(loan);
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
            throw new BookException("Sách đang không hoạt động");
        }
        if (book.getAvailableCopies() <= 0) {
            throw new BookException("Sách không có sẵn");
        }
        //kiem tra user da co book checkout nay chua
        if(bookLoanRepository.hasActiveCheckout(userId, book.getId())){
            throw new BookException("Bạn đang mượn sách này rồi");
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

        Address defaultAddress = addressRepository.findByUserIdAndIsDefaultTrue(user.getId())
                .orElse(null);
        //tao book loan
            BookLoan bookLoan = BookLoan.builder()
                    .user(user)
                    .book(book)
                    .address(defaultAddress)
                    .bookLoanType(BookLoanType.CHECKOUT)
                    .status(BookLoanStatus.CHECK_OUT)
                    .checkoutDate(LocalDate.now())
                    .dueDate(LocalDate.now().plusDays(checkoutRequest.getCheckoutDays()))

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
    public BookLoanDTO confirmReceived(Long loanId) throws Exception {
        User currentUser = userService.getCurrentUser();

        BookLoan bookLoan = bookLoanRepository.findById(loanId)
                .orElseThrow(() -> new Exception("Không tìm thấy đơn mượn #" + loanId));

        // Kiểm tra đúng chủ sở hữu đơn
        if (!bookLoan.getUser().getId().equals(currentUser.getId())) {
            throw new Exception("Bạn không có quyền xác nhận đơn này");
        }

        // Chỉ cho xác nhận khi đang SHIPPING
        if (bookLoan.getStatus() != BookLoanStatus.SHIPPING) {
            throw new BookException("Đơn chưa ở trạng thái đang vận chuyển");
        }

        bookLoan.setStatus(BookLoanStatus.DELIVERED);
        bookLoan.setNotes("User đã xác nhận nhận sách");
        BookLoan saved = bookLoanRepository.save(bookLoan);

        log.info("User {} xác nhận nhận đơn #{}", currentUser.getEmail(), loanId);
        return bookLoanMapper.toDTO(saved);
    }

    @Override
    public BookLoanDTO markAsShipping(Long loanId) throws Exception {
        BookLoan bookLoan = bookLoanRepository.findById(loanId)
                .orElseThrow(() -> new Exception("Không tìm thấy đơn mượn #" + loanId));

        if (bookLoan.getStatus() != BookLoanStatus.CHECK_OUT) {
            throw new BookException("Chỉ có thể giao khi đơn đang ở trạng thái CHECK_OUT");
        }

        bookLoan.setStatus(BookLoanStatus.SHIPPING);
        bookLoan.setNotes("Đang vận chuyển đến người dùng");
        BookLoan saved = bookLoanRepository.save(bookLoan);

        log.info("Đánh dấu đơn #{} đang vận chuyển", loanId);
        return bookLoanMapper.toDTO(saved);
    }

//    @Override
//    public BookLoanDTO checkInBook(CheckInRequest checkInRequest) throws Exception {
//        //validate book loan ton tai
//        BookLoan bookLoan = bookLoanRepository.findById(checkInRequest.getBookLoanId())
//                .orElseThrow(()-> new Exception("Book loan khong ton tai"));
//
//
//        //kiem tra neu san sang returned
//        if(!bookLoan.isActive()){
//            throw  new BookException("book loan is not active");
//        }
//
//        // set return date
//        bookLoan.setReturnDate(LocalDate.now());
//        BookLoanStatus condition = checkInRequest.getCondition();
//        if(condition ==null){
//            condition = BookLoanStatus.RETURNED;
//        }
//        bookLoan.setStatus(condition);
//
//        // fine logic
//        int overdueDays = calculateOverdueDate(bookLoan.getDueDate(), LocalDate.now());
//
//        if(condition == BookLoanStatus.LOST || condition == BookLoanStatus.DAMAGED) {
//            // charge replacement cost (currently book price) plus any fixed fee
//            BigDecimal amount = bookLoan.getBook().getPrice() != null ? bookLoan.getBook().getPrice() : BigDecimal.ZERO;
//            if (condition == BookLoanStatus.DAMAGED) {
//                // maybe add 50% damage fee
//                amount = amount.multiply(BigDecimal.valueOf(1.5));
//            }
//            bookLoan.setIsOverDue(false);
//            bookLoan.setOverdueDays(overdueDays);
//            fineService.createFine(bookLoan, condition == BookLoanStatus.LOST ? FineType.LOST : FineType.DAMAGE, amount, "Book " + condition.name().toLowerCase());
//        } else if(overdueDays > 0){
//            bookLoan.setIsOverDue(true);
//            bookLoan.setOverdueDays(overdueDays);
//            // create overdue fine only if not already exists
//            fineService.createFine(bookLoan, overdueDays);
//        }
//        //
//        bookLoan.setNotes("Sách được trả bởi người dùng");
//        //7 cap nhat book co san
//        if(condition !=BookLoanStatus.LOST){
//            Book book = bookLoan.getBook();
//            book.setAvailableCopies(book.getAvailableCopies()+1);
//            bookRepository.save(book);
//            notifyNextReservation(book);
//
//        }
//
//
//        BookLoan savedBookLoan = bookLoanRepository.save(bookLoan);
//        return bookLoanMapper.toDTO(savedBookLoan);
//
//    }

    // XOÁ method checkInBook cũ, THAY bằng method này
    @Override
    public BookLoanDTO requestReturn(CheckInRequest checkInRequest) throws Exception {
        BookLoan bookLoan = bookLoanRepository.findById(checkInRequest.getBookLoanId())
                .orElseThrow(() -> new Exception("Book loan không tồn tại"));

        if (bookLoan.getStatus() != BookLoanStatus.DELIVERED
                && bookLoan.getStatus() != BookLoanStatus.CHECK_OUT
                && bookLoan.getStatus() != BookLoanStatus.OVERDUE) {
            throw new BookException("Chỉ có thể yêu cầu trả khi đã nhận sách");
        }

        // Chỉ đổi trạng thái, chưa xử lý gì thêm
        bookLoan.setStatus(BookLoanStatus.PENDING_RETURN);
        bookLoan.setNotes("User yêu cầu trả sách, chờ admin duyệt");

        BookLoan saved = bookLoanRepository.save(bookLoan);
        return bookLoanMapper.toDTO(saved);
    }


    @Override
    public BookLoanDTO approveReturn(ApproveReturnRequest request) throws Exception {
        BookLoan bookLoan = bookLoanRepository.findById(request.getBookLoanId())
                .orElseThrow(() -> new Exception("Book loan không tồn tại"));

        // Chỉ duyệt khi đang PENDING_RETURN
        if (bookLoan.getStatus() != BookLoanStatus.PENDING_RETURN) {
            throw new BookException("Book loan không ở trạng thái chờ duyệt");
        }

        bookLoan.setReturnDate(LocalDate.now());

        BookLoanStatus condition = request.getCondition();
        if (condition == null) condition = BookLoanStatus.RETURNED;
        bookLoan.setStatus(condition);

        int overdueDays = calculateOverdueDate(bookLoan.getDueDate(), LocalDate.now());
        String fineMessage = null;
        BigDecimal fineAmount = null;

        // Xử lý fine
        if (condition == BookLoanStatus.LOST || condition == BookLoanStatus.DAMAGED) {
            BigDecimal amount = bookLoan.getBook().getPrice() != null
                    ? bookLoan.getBook().getPrice() : BigDecimal.ZERO;
            if (condition == BookLoanStatus.DAMAGED) {
                amount = amount.multiply(BigDecimal.valueOf(1.5));
            }
            bookLoan.setIsOverDue(false);
            bookLoan.setOverdueDays(overdueDays);

            FineType fineType = condition == BookLoanStatus.LOST ? FineType.LOST : FineType.DAMAGE;
            fineService.createFine(bookLoan, fineType, amount,
                    "Sách " + condition.name().toLowerCase());

            fineMessage = condition == BookLoanStatus.LOST ? "Sách bị mất" : "Sách bị hư hỏng";
            fineAmount = amount;

        } else if (overdueDays > 0) {
            bookLoan.setIsOverDue(true);
            bookLoan.setOverdueDays(overdueDays);
            fineService.createFine(bookLoan, overdueDays);
            fineMessage = "Trả sách trễ " + overdueDays + " ngày";
        }

        bookLoan.setNotes(request.getNotes() != null
                ? request.getNotes() : "Admin đã xác nhận trả sách");

        // Cộng lại availableCopies nếu không mất sách
        if (condition != BookLoanStatus.LOST) {
            Book book = bookLoan.getBook();
            book.setAvailableCopies(book.getAvailableCopies() + 1);
            bookRepository.save(book);
            notifyNextReservation(book);
        }

        BookLoan saved = bookLoanRepository.save(bookLoan);

        // Gửi email thông báo cho user
        sendReturnConfirmationEmail(bookLoan, condition, fineMessage, fineAmount);

        return bookLoanMapper.toDTO(saved);
    }



    private void notifyNextReservation(Book book) {
        try {
            Optional<Reservation> next = reservationRepository
                    .findFirstPendingReservationByBook(book.getId());

            if (next.isEmpty()) {
                log.info("Khong co reservation pending cho bookId={}", book.getId());
                return;
            }

            Reservation reservation = next.get();
            reservation.setStatus(ReservationStatus.AVAILABLE);
            reservation.setAvailableAt(LocalDateTime.now());
            reservation.setAvailableUntil(LocalDateTime.now().plusHours(HOURS_TO_PICKUP));
            reservation.setNotificationSent(true);
            reservationRepository.save(reservation);

            String deadline = reservation.getAvailableUntil()
                    .format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"));

            String userName = reservation.getUser().getFullName() != null
                    ? reservation.getUser().getFullName()
                    : reservation.getUser().getEmail();

            emailService.sendEmail(
                    reservation.getUser().getEmail(),
                    "📚 Sách bạn đặt trước đã có sẵn: " + book.getTitle(),
                    buildAvailableEmailBody(userName, book.getTitle(), book.getAuthor().getAuthorName(), deadline)
            );

            log.info("Đã notify user {} cho sách '{}'", reservation.getUser().getEmail(), book.getTitle());

        } catch (Exception e) {
            log.error("Loi khi notify reservation cho bookId={}: {}", book.getId(), e.getMessage());
        }
    }

    private String buildAvailableEmailBody(String userName, String bookTitle,
                                           String bookAuthor, String deadline) {
        return """
            <!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"/></head>
            <body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0"
                    style="background:#fff;border-radius:20px;overflow:hidden;
                           box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#1a1a2e,#2d1b00);
                                 padding:32px 40px;text-align:center;">
                        <h1 style="margin:0;color:#f5f0e8;font-size:1.4rem;font-weight:800;">
                          Sách<em style="color:#c8956c;">Hay</em>
                        </h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.4);font-size:0.75rem;
                                  text-transform:uppercase;letter-spacing:0.1em;">
                          Thông báo đặt trước
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px 40px;">
                        <p style="margin:0 0 14px;color:#555;font-size:0.95rem;line-height:1.7;">
                          Xin chào <strong style="color:#1a1a1a;">%s</strong>,
                        </p>
                        <p style="margin:0 0 22px;color:#555;font-size:0.9rem;line-height:1.7;">
                          Cuốn sách bạn đặt trước đã <strong style="color:#16a34a;">có sẵn</strong>
                          tại thư viện.
                        </p>
                        <div style="background:#fafafa;border:1.5px solid rgba(0,0,0,0.08);
                                    border-radius:12px;padding:18px 22px;margin-bottom:16px;">
                          <div style="font-size:0.62rem;font-weight:700;color:#c8956c;
                                      text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">
                            Thông tin sách
                          </div>
                          <div style="font-size:1rem;font-weight:800;color:#1a1a1a;margin-bottom:3px;">%s</div>
                          <div style="font-size:0.82rem;color:#888;">%s</div>
                        </div>
                        <div style="background:#fff7ed;border:1.5px solid #fed7aa;
                                    border-radius:12px;padding:16px 20px;">
                          <div style="font-size:0.72rem;font-weight:700;color:#c2410c;margin-bottom:5px;">
                            ⏰ Thời hạn lấy sách
                          </div>
                          <div style="font-size:0.88rem;color:#7c2d12;line-height:1.6;">
                            Vui lòng đến thư viện trước <strong>%s</strong>.<br/>
                            Sau thời gian này, đặt trước sẽ bị huỷ tự động.
                          </div>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#fafafa;border-top:1px solid rgba(0,0,0,0.06);
                                 padding:18px 40px;text-align:center;">
                        <p style="margin:0;color:#ccc;font-size:0.72rem;">
                          © 2025 SáchHay · Email tự động, vui lòng không trả lời.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body></html>
            """.formatted(userName, bookTitle, bookAuthor, deadline);
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

        else if(searchRequest.getUserId() != null){
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
                bookLoan.setOverdueDays(overdueDays);
                bookLoanRepository.save(bookLoan);

                // generate fine for this loan if not already present
                fineService.createFine(bookLoan, overdueDays);
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


    private void sendReturnConfirmationEmail(BookLoan bookLoan,
                                             BookLoanStatus condition,
                                             String fineMessage,
                                             BigDecimal fineAmount) {
        try {
            String userEmail = bookLoan.getUser().getEmail();
            String userName = bookLoan.getUser().getFullName() != null
                    ? bookLoan.getUser().getFullName() : userEmail;
            String bookTitle = bookLoan.getBook().getTitle();

            boolean hasFine = fineMessage != null;
            String subject = hasFine
                    ? "⚠️ Thông báo vi phạm trả sách: " + bookTitle
                    : "✅ Xác nhận trả sách thành công: " + bookTitle;

            emailService.sendEmail(userEmail, subject,
                    buildReturnEmailBody(userName, bookTitle, fineMessage, fineAmount));

        } catch (Exception e) {
            log.error("Lỗi gửi email xác nhận trả sách: {}", e.getMessage());
        }
    }

    private String buildReturnEmailBody(String userName, String bookTitle,
                                        String fineMessage, BigDecimal fineAmount) {
        boolean hasFine = fineMessage != null;
        String statusColor = hasFine ? "#dc2626" : "#16a34a";
        String statusText  = hasFine ? "Vi phạm" : "Trả thành công";

        String fineBlock = "";
        if (hasFine) {
            String amountLine = fineAmount != null
                    ? "Số tiền phạt: <strong>" + fineAmount + " VNĐ</strong>"
                    : "Vui lòng liên hệ thư viện để biết thêm chi tiết.";
            fineBlock = """
            <div style="background:#fef2f2;border:1.5px solid #fecaca;
                        border-radius:12px;padding:16px 20px;margin-top:16px;">
              <div style="font-size:0.72rem;font-weight:700;color:#dc2626;margin-bottom:6px;">
                ⚠️ Thông báo phạt
              </div>
              <div style="font-size:0.88rem;color:#7f1d1d;line-height:1.6;">
                Lý do: <strong>%s</strong><br/>%s
              </div>
            </div>
            """.formatted(fineMessage, amountLine);
        }

        return """
        <!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"/></head>
        <body style="margin:0;padding:0;background:#f5f0e8;
                     font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
            <tr><td align="center">
              <table width="560" cellpadding="0" cellspacing="0"
                style="background:#fff;border-radius:20px;overflow:hidden;
                       box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#1a1a2e,#2d1b00);
                             padding:32px 40px;text-align:center;">
                    <h1 style="margin:0;color:#f5f0e8;font-size:1.4rem;font-weight:800;">
                      Sách<em style="color:#c8956c;">Hay</em>
                    </h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 40px;">
                    <p style="margin:0 0 14px;color:#555;font-size:0.95rem;">
                      Xin chào <strong style="color:#1a1a1a;">%s</strong>,
                    </p>
                    <div style="background:#fafafa;border:1.5px solid rgba(0,0,0,0.08);
                                border-radius:12px;padding:18px 22px;">
                      <div style="font-size:0.62rem;font-weight:700;color:#c8956c;
                                  text-transform:uppercase;margin-bottom:6px;">
                        Thông tin sách
                      </div>
                      <div style="font-size:1rem;font-weight:800;color:#1a1a1a;
                                  margin-bottom:6px;">%s</div>
                      <div style="font-size:0.82rem;color:%s;font-weight:700;">
                        Trạng thái: %s
                      </div>
                    </div>
                    %s
                  </td>
                </tr>
                <tr>
                  <td style="background:#fafafa;border-top:1px solid rgba(0,0,0,0.06);
                             padding:18px 40px;text-align:center;">
                    <p style="margin:0;color:#ccc;font-size:0.72rem;">
                      © 2025 SáchHay · Email tự động, vui lòng không trả lời.
                    </p>
                  </td>
                </tr>
              </table>
            </td></tr>
          </table>
        </body></html>
        """.formatted(userName, bookTitle, statusColor, statusText, fineBlock);
    }
}
