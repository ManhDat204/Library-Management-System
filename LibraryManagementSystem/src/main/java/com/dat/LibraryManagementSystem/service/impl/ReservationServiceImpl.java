package com.dat.LibraryManagementSystem.service.impl;



import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import com.dat.LibraryManagementSystem.domain.ReservationStatus;
import com.dat.LibraryManagementSystem.domain.UserRole;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.mapper.ReservationMapper;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.model.BookLoan;

import com.dat.LibraryManagementSystem.model.Reservation;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.ReservationDTO;
import com.dat.LibraryManagementSystem.payload.request.CheckoutRequest;
import com.dat.LibraryManagementSystem.payload.request.ReservationRequest;
import com.dat.LibraryManagementSystem.payload.request.ReservationSearchRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.repository.BookLoanRepository;
import com.dat.LibraryManagementSystem.repository.BookRepository;
import com.dat.LibraryManagementSystem.repository.ReservationRepository;
import com.dat.LibraryManagementSystem.service.BookLoanService;
import com.dat.LibraryManagementSystem.service.EmailService;
import com.dat.LibraryManagementSystem.service.ReservationService;
import com.dat.LibraryManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationServiceImpl implements ReservationService {
    private final BookLoanRepository bookLoanRepository;
    private final UserService userService;
    private final BookRepository bookRepository;
    private final ReservationRepository reservationRepository;
    private final ReservationMapper reservationMapper;
    private final BookLoanService bookLoanService;
    private final EmailService emailService;

    int MAX_RESERVATIONS = 5;

    @Override
    public ReservationDTO createReservation(ReservationRequest reservationRequest) throws Exception {
        User user = userService.getCurrentUser();
        return createReservationForUser(reservationRequest, user.getId());
    }

    @Override
    public ReservationDTO createReservationForUser(ReservationRequest reservationRequest, Long userId) throws Exception {
        boolean alreadyHasLoan = bookLoanRepository.existsByUserIdAndBookIdAndStatus(
                userId,reservationRequest.getBookId(), BookLoanStatus.CHECK_OUT
        );
        if (alreadyHasLoan){
            throw new Exception("Bạn đang mượn sách này rồi ");
        }

        // kiem tra user ton tai
        User user = userService.getCurrentUser();

        // kiem tra book ton tai
        Book book = bookRepository.findById(reservationRequest.getBookId())
                .orElseThrow(()-> new Exception("Sách không tồn tại")
        );

        if(reservationRepository.hasActiveReservation(userId, book.getId())){
            throw new Exception("Bạn đã đặt trước sách này rồi");
        }

        if(book.getAvailableCopies()>0){
            throw new Exception("Sach dang co san ");
        }

        long activateReservations = reservationRepository.countActiveReservationsByUser(userId);

        if(activateReservations>= MAX_RESERVATIONS){
            throw new Exception("Ban da dat truoc " +MAX_RESERVATIONS + "lan");
        }
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setBook(book);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation.setReservedAt(LocalDateTime.now());
        reservation.setNotificationSent(false);
        reservation.setNotes(reservationRequest.getNotes());

        long pendingCount = reservationRepository.countPendingReservationsByBook(
                book.getId()
        );
        reservation.setQueuePosition((int)pendingCount +1);

        Reservation savedReservation = reservationRepository.save(reservation);

        sendReservationConfirmationEmail(user, book, savedReservation);

        return reservationMapper.toDTO(savedReservation);
    }

    @Override
    public ReservationDTO cancelReservation(Long reservationId) throws Exception {
        Reservation reservation= reservationRepository.findById(reservationId)
                .orElseThrow(()-> new Exception("Ma reservation khong ton tai voi id " + reservationId));

        User currentUser = userService.getCurrentUser();
        if(!reservation.getUser().getId().equals(currentUser.getId()) && currentUser.getRole()!= UserRole.ROLE_ADMIN){
            throw new Exception("Ban co the tu choi dat truoc");
        }
        if(!reservation.canBeCancelled()){
            throw new Exception("Khong the tu choi dat truoc "+ reservation);
        }
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservation.setCanceledAt(LocalDateTime.now());
        Reservation savedReservation = reservationRepository.save(reservation);

//        updateQueuePossitions(reservation.getUser().getId());
//        longer.info("Dat truoc da bi huy boi user", reservationId, currentUser.getId());

        return reservationMapper.toDTO(savedReservation);
    }

    @Override
    public ReservationDTO fulfillReservation(Long reservationId) throws Exception {
        Reservation reservation= reservationRepository.findById(reservationId)
                .orElseThrow(()-> new Exception("Ma reservation khong ton tai voi id " + reservationId));
        if(reservation.getBook().getAvailableCopies()<=0){
            throw new Exception("Khong co san de dat truoc (trang thai hien tai :" +reservation);
        }
        reservation.setStatus(ReservationStatus.FULFILLED);
        reservation.setFulfilledAt(LocalDateTime.now());

        Reservation savedReservation = reservationRepository.save(reservation);
        CheckoutRequest checkoutRequest = new CheckoutRequest();
        checkoutRequest.setBookId(reservation.getBook().getId());
        checkoutRequest.setNotes("Xac nhan boi admin");
        bookLoanService.checkoutBookForUser(reservation.getUser().getId(), checkoutRequest);
        return reservationMapper.toDTO(savedReservation);
    }

    @Override
    public PageResponse<ReservationDTO> getMyReservations(ReservationSearchRequest searchRequest) throws UserException {
        User user = userService.getCurrentUser() ;
        searchRequest.setUserId(user.getId());
        return searchReservations(searchRequest);
    }

    @Override
    public PageResponse<ReservationDTO> searchReservations(ReservationSearchRequest searchRequest) {
        Pageable pageable = createPageable(searchRequest);
        Page<Reservation> reservationPage = reservationRepository.searchReservationsWithFilters(
                searchRequest.getUserId(),
                searchRequest.getBookId(),
                searchRequest.getStatus(),
                searchRequest.getActiveOnly() != null ? searchRequest.getActiveOnly() :false,
                pageable
        );
        return buildPageResponse(reservationPage);
    }

    public PageResponse<ReservationDTO> buildPageResponse(Page<Reservation> reservationPage){
        List<ReservationDTO> dtos = reservationPage.getContent().stream()
                .map(reservationMapper::toDTO)
                .toList();
        PageResponse<ReservationDTO> response = new PageResponse<>();
        response.setContent(dtos);
        response.setPageNumber(reservationPage.getNumber());
        response.setPageSize(reservationPage.getSize());
        response.setTotalElement(reservationPage.getTotalElements());
        response.setTotalPage(reservationPage.getTotalPages());
        response.setLast(reservationPage.isLast());
        return response;

    }


    private Pageable createPageable(ReservationSearchRequest searchRequest){
        Sort sort = "ASC".equalsIgnoreCase(searchRequest.getSortDirection())
                ? Sort.by(searchRequest.getSortBy()).ascending()
                : Sort.by(searchRequest.getSortBy()).descending();
        return PageRequest.of(searchRequest.getPage(), searchRequest.getSize(), sort);
    }



    private void sendReservationConfirmationEmail(User user, Book book, Reservation reservation) {
        try {
            String userName  = user.getFullName() != null ? user.getFullName() : user.getEmail();
            String subject   = "Xác nhận đặt trước: " + book.getTitle();
            String body      = buildConfirmationEmailBody(userName, book.getTitle(),
                    book.getAuthor().getAuthorName(), reservation.getQueuePosition());
            emailService.sendEmail(user.getEmail(), subject, body);
        } catch (Exception e) {
            // Không để lỗi email fail cả request
            log.error("Gui email xac nhan that bai cho {}: {}", user.getEmail(), e.getMessage());
        }
    }
    private String buildConfirmationEmailBody(String userName, String bookTitle,
                                              String bookAuthor, int queuePosition) {
        return """
            <!DOCTYPE html><html lang="vi"><head><meta charset="UTF-8"/></head>
            <body style="margin:0;padding:0;background:#f5f0e8;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0"
                    style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

                    <!-- Header -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#1a1a2e,#2d1b00);padding:32px 40px;text-align:center;">
                        <h1 style="margin:0;color:#f5f0e8;font-size:1.4rem;font-weight:800;">
                          Sách<em style="color:#c8956c;">Hay</em>
                        </h1>
                        <p style="margin:6px 0 0;color:rgba(255,255,255,0.4);font-size:0.75rem;
                                  text-transform:uppercase;letter-spacing:0.1em;">
                          Xác nhận đặt trước
                        </p>
                      </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:32px 40px;">
                        <p style="margin:0 0 14px;color:#555;font-size:0.95rem;line-height:1.7;">
                          Xin chào <strong style="color:#1a1a1a;">%s</strong>,
                        </p>
                        <p style="margin:0 0 22px;color:#555;font-size:0.9rem;line-height:1.7;">
                          Yêu cầu đặt trước của bạn đã được ghi nhận thành công.
                          Chúng tôi sẽ thông báo ngay khi sách có sẵn.
                        </p>

                        <!-- Book info -->
                        <div style="background:#fafafa;border:1.5px solid rgba(0,0,0,0.08);
                                    border-radius:12px;padding:18px 22px;margin-bottom:16px;">
                          <div style="font-size:0.62rem;font-weight:700;color:#c8956c;
                                      text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">
                            Thông tin sách
                          </div>
                          <div style="font-size:1rem;font-weight:800;color:#1a1a1a;margin-bottom:3px;">%s</div>
                          <div style="font-size:0.82rem;color:#888;">%s</div>
                        </div>

                        <!-- Queue position -->
                        <div style="background:#eff6ff;border:1.5px solid #bfdbfe;
                                    border-radius:12px;padding:16px 20px;">
                          <div style="font-size:0.72rem;font-weight:700;color:#1d4ed8;margin-bottom:5px;">
                            📋 Vị trí trong hàng đợi
                          </div>
                          <div style="font-size:0.88rem;color:#1e3a5f;line-height:1.6;">
                            Bạn đang ở vị trí <strong>#%d</strong> trong danh sách chờ.<br/>
                            Chúng tôi sẽ gửi email thông báo khi đến lượt bạn.
                          </div>
                        </div>
                      </td>
                    </tr>

                    <!-- Footer -->
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
            """.formatted(userName, bookTitle, bookAuthor, queuePosition);
    }
}
