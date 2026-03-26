package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.domain.FineStatus;
import com.dat.LibraryManagementSystem.domain.FineType;
import com.dat.LibraryManagementSystem.domain.PaymentType;
import com.dat.LibraryManagementSystem.mapper.FineMapper;
import com.dat.LibraryManagementSystem.model.BookLoan;
import com.dat.LibraryManagementSystem.model.Fine;
import com.dat.LibraryManagementSystem.payload.dto.FineDTO;
import com.dat.LibraryManagementSystem.payload.dto.PaymentDTO;
import com.dat.LibraryManagementSystem.payload.request.CreateFineRequest;
import com.dat.LibraryManagementSystem.payload.request.WaiveFineRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.repository.BookLoanRepository;
import com.dat.LibraryManagementSystem.repository.FineRepository;
import com.dat.LibraryManagementSystem.service.FineService;
import com.dat.LibraryManagementSystem.service.PaymentService;
import com.dat.LibraryManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class FineServiceImpl implements FineService {

    private final FineRepository fineRepository;
    private final BookLoanRepository bookLoanRepository;
    private final FineMapper fineMapper;
    private final PaymentService paymentService;
    private final UserService userService;

    @Override
    public List<FineDTO> getUserFines(Long userId) {
        List<Fine> fines = fineRepository.findByUserId(userId);
        return fines.stream().map(fineMapper::toDTO).collect(Collectors.toList());
    }

    @Override
    public FineDTO getFine(Long id) throws Exception {
        Fine fine = fineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fine not found"));
        return fineMapper.toDTO(fine);
    }

    @Override
    public FineDTO payFine(Long fineId, Long amount) throws Exception {
        Fine fine = fineRepository.findById(fineId)
                .orElseThrow(() -> new RuntimeException("Fine id không tồn tại"));

        if (fine.getStatus() != FineStatus.PENDING) {
            throw new RuntimeException("Cannot pay a fine that is not pending");
        }
        if (amount != null && fine.getAmount().longValue() != amount) {
            throw new RuntimeException("Payment amount does not match fine amount");
        }

        // record payment via PaymentService
        PaymentDTO paymentDto = PaymentDTO.builder()
                .userId(fine.getUser().getId())
                .bookLoanId(fine.getBookLoan().getId())
                .fineId(fine.getId())
                .paymentType(PaymentType.FINE)
                .gateway(com.dat.LibraryManagementSystem.domain.PaymentGateway.VNPay)
                .amount(fine.getAmount().longValue())
                .currency("VND")
                .description("Thanh toán phí phạt - " + fine.getId()
                        + " - " + fine.getBookLoan().getBook().getTitle())
                .build();

        PaymentDTO saved = paymentService.createPayment(paymentDto);

        FineDTO fineDTO = fineMapper.toDTO(fine);
        fineDTO.setPaymentId(saved.getId());
        return fineDTO;
    }

    @Override
    public void createFine(BookLoan bookLoan, int overdueDays) {
        if (overdueDays <= 0) {
            return;
        }

        // avoid duplicated pending fine for same loan
        if (fineRepository.existsByBookLoanIdAndStatus(bookLoan.getId(), FineStatus.PENDING)) {
            return;
        }

        BigDecimal finePerDay = new BigDecimal("5000");
        BigDecimal amount = finePerDay.multiply(BigDecimal.valueOf(overdueDays));

        Fine fine = Fine.builder()
                .user(bookLoan.getUser())
                .bookLoan(bookLoan)
                .overdueDays(overdueDays)
                .amount(amount)
                .fineType(FineType.OVERDUE)
                .status(FineStatus.PENDING)
                .reason("Sách quá hạn")
                .build();

        fineRepository.save(fine);
    }

    @Override
    public void createFine(BookLoan bookLoan, FineType fineType, BigDecimal amount, String reason) {
        // generic creation, used for lost/damaged or manual fines
        if (bookLoan == null || amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Invalid fine parameters");
        }
        if (fineRepository.existsByBookLoanIdAndStatus(bookLoan.getId(), FineStatus.PENDING)) {
            return;
        }
        Fine fine = Fine.builder()
                .user(bookLoan.getUser())
                .bookLoan(bookLoan)
                .overdueDays(0)
                .amount(amount)
                .fineType(fineType)
                .status(FineStatus.PENDING)
                .reason(reason)
                .build();
        fineRepository.save(fine);
    }

    @Override
    public FineDTO createFine(CreateFineRequest request) throws Exception {
        BookLoan loan = bookLoanRepository.findById(request.getBookLoanId())
                .orElseThrow(() -> new RuntimeException("Id mượn sách không tồn tại"));

        if (fineRepository.existsByBookLoanIdAndStatus(loan.getId(), FineStatus.PENDING)) {
            throw new RuntimeException("A pending fine for this loan already exists");
        }

        Fine fine = Fine.builder()
                .user(loan.getUser())
                .bookLoan(loan)
                .overdueDays(0)
                .amount(BigDecimal.valueOf(request.getAmount()))
                .fineType(request.getFineType())
                .status(FineStatus.PENDING)
                .reason(request.getReason())
                .notes(request.getNotes())
                .build();

        Fine saved = fineRepository.save(fine);
        return fineMapper.toDTO(saved);
    }

    @Override
    public FineDTO waiveFine(WaiveFineRequest request) throws Exception {
        Fine fine = fineRepository.findById(request.getFineId())
                .orElseThrow(() -> new RuntimeException("Fine not found"));
        if (fine.getStatus() != FineStatus.PENDING) {
            throw new RuntimeException("Only pending fines can be waived");
        }
        fine.setStatus(FineStatus.WAIVED);
        fine.setWaiverReason(request.getReason());
        Fine updated = fineRepository.save(fine);
        return fineMapper.toDTO(updated);
    }

    @Override
    public PageResponse<FineDTO> getAllFines(FineStatus fineStatus, FineType fineType, Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<Fine> spec = Specification.where((root, query, cb) -> null);

        if (fineStatus != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), fineStatus));
        }
        if (fineType != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("fineType"), fineType));
        }
        if (userId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("user").get("id"), userId));
        }

        Page<Fine> pageResult = fineRepository.findAll(spec, pageable);
        List<FineDTO> dtos = pageResult.getContent().stream()
                .map(fineMapper::toDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(dtos,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isLast(),
                pageResult.isFirst(),
                pageResult.isEmpty());
    }

    @Override
    public List<FineDTO> getMyFines() throws Exception {
        Long userId = userService.getCurrentUser().getId();
        return getUserFines(userId);
    }

    @Override
    public Long getTotalPendingFines(Long userId) {
        BigDecimal sum = fineRepository.sumAmountByStatusAndUserId(FineStatus.PENDING, userId);
        return sum == null ? 0L : sum.longValue();
    }
}

