package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.exception.BookException;
import com.dat.LibraryManagementSystem.mapper.BookMapper;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.payload.dto.BookDTO;
import com.dat.LibraryManagementSystem.payload.request.BookSearchRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.repository.BookRepository;
import com.dat.LibraryManagementSystem.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookServiceImpl implements BookService {

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;
    @Override
    public BookDTO createBook(BookDTO bookDTO) throws BookException {
        if(bookRepository.existsByIsbn(bookDTO.getIsbn())){
            throw new BookException("Sach voi ma isbn "+ bookDTO.getIsbn() + " da ton tai");
        }

        Book book= bookMapper.toEntity(bookDTO);
        book.isAvailableCopiesValid();

        Book savedbook = bookRepository.save(book);
        return bookMapper.toDTO(savedbook);
    }

//    @Override
//    public List<BookDTO> createBooksBulk() {
//        return List.of();
//    }

    @Override
    public List<BookDTO> createBooksBulk(List<BookDTO> bookDTOs) throws BookException {
        List<BookDTO> createdBooks = new ArrayList<>();
        for(BookDTO bookDTO:bookDTOs){
            BookDTO book = createBook(bookDTO);
            createdBooks.add(book);
        }
        return createdBooks;
    }

    @Override
    public BookDTO getBookById(Long bookId) throws BookException {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(()->new BookException("Book khong ton tai"));
        return bookMapper.toDTO(book);
    }

    @Override
    public BookDTO getBookByISBN(String isbn) throws BookException {
        Book book = bookRepository.findByIsbn(isbn)
                .orElseThrow(()->new BookException("Book khong ton tai"));
        return bookMapper.toDTO(book);

    }

    @Override
    public BookDTO updateBookById(Long bookId, BookDTO bookDTO) throws BookException {
        Book existingBook = bookRepository.findById(bookId)
                .orElseThrow(()->new BookException("Book khong ton tai"));

        bookMapper.updateEntityFromDTO(bookDTO, existingBook);
        existingBook.isAvailableCopiesValid();
        Book savedBook = bookRepository.save(existingBook);
        return bookMapper.toDTO(savedBook);

    }

    @Override
    public void deleteBook(Long bookId) throws BookException {
        Book existingBook = bookRepository.findById(bookId)
                .orElseThrow(()->new BookException("Book khong ton tai"));
        existingBook.setActive(false);
        bookRepository.save(existingBook);

    }

    @Override
    public void deleteHardBook(Long bookId) throws BookException {
        Book existingBook = bookRepository.findById(bookId)
                .orElseThrow(()->new BookException("Book khong ton tai"));
        existingBook.setActive(false);
        bookRepository.delete(existingBook);
    }

    @Override
    public PageResponse<BookDTO> searchBookWithFilters(BookSearchRequest searchRequest) {
        Pageable pageable = createPageable(searchRequest.getPage(),
                searchRequest.getSize(),
                searchRequest.getSortBy(),
                searchRequest.getSortDirection());
        Page<Book> bookPage =  bookRepository.searchBookWithFilters(
                searchRequest.getSearchTerm(),
                searchRequest.getGenreId(),
                searchRequest.getAvailableOnly(),
                pageable

                );
        return convertToPageResponse(bookPage);
    }

    @Override
    public Long getTotalActiveBooks() {

        return bookRepository.countByActiveTrue();
    }

    @Override
    public Long getTotalAvailableBooks() {

        return bookRepository.countAvailableBooks();
    }

    private Pageable createPageable(int page , int size , String sortBy, String sortDirection){
        size = Math.min(size, 10);
        size = Math.max(size, 1);
        Sort sort= sortDirection.equalsIgnoreCase("ASC")
                ?Sort.by(sortBy).ascending():Sort.by(sortBy).descending();
                return PageRequest.of(page, size, sort);
    }
    private PageResponse<BookDTO> convertToPageResponse(Page<Book> books){
        List<BookDTO> bookDTOS =books.getContent()
                .stream()
                .map(bookMapper::toDTO)
                .collect(Collectors.toList());

        return new PageResponse<>(bookDTOS,
                books.getNumber(),
                books.getSize(),
                books.getTotalElements(),
                books.getTotalPages(),
                books.isLast(),
                books.isFirst(),
                books.isEmpty()
        );
    }
}
