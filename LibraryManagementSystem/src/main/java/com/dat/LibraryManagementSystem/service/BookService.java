package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.exception.BookException;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.payload.dto.BookDTO;
import com.dat.LibraryManagementSystem.payload.request.BookSearchRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import org.hibernate.query.Page;

import javax.naming.ldap.PagedResultsResponseControl;
import java.util.List;

public interface BookService {

    BookDTO createBook(BookDTO bookDTO) throws BookException;
//    List<BookDTO> createBooksBulk() throws BookException;

    List<BookDTO> createBooksBulk(List<BookDTO> bookDTOs) throws BookException;

    BookDTO getBookById(Long bookDTO) throws BookException;
    BookDTO getBookByISBN(String isbn) throws BookException;
    BookDTO updateBookById(Long bookId, BookDTO bookDTO) throws BookException;
    void deleteBook(Long bookId) throws BookException;
    void deleteHardBook(Long bookId) throws BookException;
    PageResponse<BookDTO> searchBookWithFilters(BookSearchRequest searchRequest);
    Long getTotalActiveBooks();
    Long getTotalAvailableBooks();
    List<BookDTO> getTopBorrowedBooks(int limit);



}
