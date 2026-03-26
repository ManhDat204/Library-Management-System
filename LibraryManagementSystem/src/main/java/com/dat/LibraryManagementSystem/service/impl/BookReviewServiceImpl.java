package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.domain.BookLoanStatus;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.mapper.BookReviewMapper;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.model.BookLoan;
import com.dat.LibraryManagementSystem.model.BookReview;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.payload.dto.BookRatingDTO;
import com.dat.LibraryManagementSystem.payload.dto.BookReviewDTO;
import com.dat.LibraryManagementSystem.payload.request.CreateReviewRequest;
import com.dat.LibraryManagementSystem.payload.request.UpdateReviewRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.repository.BookLoanRepository;
import com.dat.LibraryManagementSystem.repository.BookRepository;
import com.dat.LibraryManagementSystem.repository.BookReviewRepository;
import com.dat.LibraryManagementSystem.service.BookReviewService;
import com.dat.LibraryManagementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collector;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookReviewServiceImpl implements BookReviewService {
    private final BookReviewRepository bookReviewRepository;
    private final UserService userService;
    private final BookRepository bookRepository;
    private final BookReviewMapper bookReviewMapper;
    private final BookLoanRepository bookLoanRepository;


    @Override
    public BookReviewDTO createReview(CreateReviewRequest request) throws Exception {
        //fetch with user
        User user = userService.getCurrentUser();

        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(()-> new Exception("Sach khong ton tai"));

        if(bookReviewRepository.existsByUserIdAndBookId(user.getId(), book.getId())){
            throw  new Exception("Ban da danh gia sach nay roi");
        }
        //kiem tra neu user da doc sach
        boolean hasReadBook = hasUserReadBook(user.getId(), book.getId());
        if(!hasReadBook){
            throw new Exception("Ban chua doc cuon sach nay");
        }
        //tao review
        BookReview bookReview = new BookReview();
        bookReview.setUser(user);
        bookReview.setBook(book);
        bookReview.setRating(request.getRating());
        bookReview.setReviewText(request.getReviewText());
        bookReview.setTitle(request.getTitle());
        BookReview savedBookReview = bookReviewRepository.save(bookReview);
        return bookReviewMapper.toDTO(savedBookReview);
    }

    @Override
    public BookReviewDTO updateReview(Long reviewId, UpdateReviewRequest request) throws Exception {
        //fetch with user
        User user = userService.getCurrentUser();

        BookReview bookReview = bookReviewRepository.findById(reviewId)
                .orElseThrow(()-> new Exception("Danh gia khong ton tai"));
        if(!bookReview.getUser().getId().equals(user.getId())){
            throw new  Exception("Ban khong co danh gia cho sach nay");
        }

        // cap nhat review

        bookReview.setReviewText(request.getReviewText());
        bookReview.setTitle(request.getTitle());
        bookReview.setRating(request.getRating());

        BookReview savedBookReview = bookReviewRepository.save(bookReview);
        return bookReviewMapper.toDTO(savedBookReview);

    }
    @Override
    public BookRatingDTO getRatingByBookId(Long bookId) throws Exception {
        bookRepository.findById(bookId)
                .orElseThrow(() -> new Exception("Sach khong ton tai voi id " + bookId));

        Double avg = bookReviewRepository.getAverageRatingByBookId(bookId);
        long total = bookReviewRepository.countByBookId(bookId);

        // Làm tròn đến 0.5 gần nhất (e.g. 4.3 → 4.5, 4.1 → 4.0)
        double rounded = Math.round(avg * 2.0) / 2.0;

        return BookRatingDTO.builder()
                .bookId(bookId)
                .averageRating(Math.round(avg * 10.0) / 10.0)  // 1 chữ số thập phân
                .totalReviews(total)
                .roundedRating(rounded)
                .build();
    }

    @Override
    public void deleteReview(Long reviewId) throws Exception {

        //fetch with user
        User currentUser = userService.getCurrentUser();

        BookReview bookReview = bookReviewRepository.findById(reviewId)
                .orElseThrow(()-> new Exception("Danh gia khong ton tai voi id" + reviewId));

        if(!bookReview.getUser().getId().equals(currentUser.getId())){
            throw  new Exception("Ban chi co the xoa danh gia cua chinh minh");
        }

        bookReviewRepository.delete(bookReview);

    }

    @Override
    public PageResponse<BookReviewDTO> getReviewsByBookId(Long id, int page, int size) throws Exception {
        Book book = bookRepository.findById(id).orElseThrow(
                ()->new Exception("Sach khong ton tai voi id")
        );
        Pageable pageable = PageRequest.of(page,size, Sort.by("createdAt").descending());
        Page<BookReview> reviewPage = bookReviewRepository.findByBook(book,pageable);
        return convertToPageResponse(reviewPage);
    }

    private PageResponse<BookReviewDTO> convertToPageResponse(Page<BookReview> reviewPage) {
        List<BookReviewDTO> reviewDTOs = reviewPage.getContent()
                .stream().map(bookReviewMapper::toDTO).collect(Collectors.toList());

        return new PageResponse<>(
                reviewDTOs,
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages(),
                reviewPage.isLast(),
                reviewPage.isFirst(),
                reviewPage.isEmpty()
        );
    }

    private boolean  hasUserReadBook(Long userId, Long bookId){
        List<BookLoan> bookLoans = bookLoanRepository.findByBookId(bookId);
        return bookLoans.stream()
                .anyMatch(loan -> loan.getUser().getId().equals(userId)
                        && loan.getStatus() == BookLoanStatus.RETURNED );
    }
}
