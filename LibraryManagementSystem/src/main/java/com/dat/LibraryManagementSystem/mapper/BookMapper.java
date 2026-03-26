package com.dat.LibraryManagementSystem.mapper;

import com.dat.LibraryManagementSystem.exception.BookException;
import com.dat.LibraryManagementSystem.model.Author;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.model.Genre;
import com.dat.LibraryManagementSystem.model.Publisher;
import com.dat.LibraryManagementSystem.payload.dto.BookDTO;
import com.dat.LibraryManagementSystem.repository.AuthorRepository;
import com.dat.LibraryManagementSystem.repository.GenreRepository;
import com.dat.LibraryManagementSystem.repository.PublisherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor

public class BookMapper {
    private final GenreRepository genreRepository;
    private final AuthorRepository authorRepository;
    private final PublisherRepository publisherRepository;
    public BookDTO toDTO(Book book){
        if(book==null){
            return null;
        }
        BookDTO dto = BookDTO.builder()
                .id(book.getId())
                .title(book.getTitle())
                .authorId(book.getAuthor().getId())
                .authorName(book.getAuthor().getAuthorName())
                .isbn(book.getIsbn())
                .genreId(book.getGenre().getId())
                .genreName(book.getGenre().getName())
                .genreCode(book.getGenre().getCode())
                .publisherId(book.getPublisher().getId())
                .publisherName(book.getPublisher().getName())
                .publicationDate(book.getPublishedDate())
                .language(book.getLanguage())
                .pages(book.getPages())
                .description(book.getDescription())
                .totalCopies(book.getTotalCopies())
                .availableCopies(book.getAvailableCopies())
                .price(book.getPrice())
                .coverImageUrl(book.getCoverImageUrl())
                .active(book.getActive())
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
        return dto;
    }
    public Book toEntity(BookDTO dto ) throws BookException {
        if (dto==null){
            return null;
        }
        Book book = new Book();
        book.setId(dto.getId()) ;
        book.setIsbn(dto.getIsbn());
        book.setTitle(dto.getTitle());
        if(dto.getAuthorId() != null){
            Author author = authorRepository.findById(dto.getAuthorId())
                    .orElseThrow(() -> new BookException("Author with ID " + dto.getAuthorId() + " not found"));

            book.setAuthor(author);
        }
        //map genre

        if(dto.getGenreId() != null){
            Genre genre = genreRepository.findById(dto.getGenreId())
                    .orElseThrow(() -> new BookException("Genre with id" + dto.getGenreId() + "not found "));
                    book.setGenre(genre);
        }
        if(dto.getPublisherId() != null){
            Publisher publisher = publisherRepository.findById(dto.getPublisherId())
                    .orElseThrow(() -> new BookException("Publisher with id" + dto.getPublisherId() + "not found "));
            book.setPublisher(publisher);
        }
        book.setPublishedDate(dto.getPublicationDate());
        book.setLanguage(dto.getLanguage());
        book.setPages(dto.getPages());
        book.setDescription(dto.getDescription());
        book.setTotalCopies(dto.getTotalCopies());
        book.setAvailableCopies(dto.getAvailableCopies());
        book.setPrice(dto.getPrice());
        book.setCoverImageUrl(dto.getCoverImageUrl());
        book.setActive(true);

        return book;
    }


    public void updateEntityFromDTO(BookDTO dto,  Book book) throws BookException{
        if(dto ==null || book == null){
            return ;
        }
        book.setTitle(dto.getTitle());
        if(dto.getAuthorId() != null){
            Author author = authorRepository.findById(dto.getAuthorId())
                    .orElseThrow(() -> new BookException("Author with ID " + dto.getAuthorId() + " not found"));

            book.setAuthor(author);
        }

        if(dto.getGenreId()!= null){
            Genre genre = genreRepository.findById(dto.getGenreId())
                    .orElseThrow(()->new BookException("Genre with ID" + dto.getGenreId() + "not found "));
            book.setGenre(genre);
        }
        if(dto.getPublisherId()!= null){
            Publisher publisher = publisherRepository.findById(dto.getPublisherId())
                    .orElseThrow(()->new BookException("Genre with ID" + dto.getPublisherId() + "not found "));
            book.setPublisher(publisher);
        }
        book.setPublishedDate(dto.getPublicationDate());
        book.setLanguage(dto.getLanguage());
        book.setPages(dto.getPages());
        book.setDescription(dto.getDescription());
        book.setTotalCopies(dto.getTotalCopies());
        book.setAvailableCopies(dto.getAvailableCopies());
        book.setPrice(dto.getPrice());
        book.setCoverImageUrl(dto.getCoverImageUrl());
        if(dto.getActive()!=null) {
            book.setActive(dto.getActive());
        }
    }
}
