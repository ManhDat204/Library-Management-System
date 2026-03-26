package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.mapper.WishlistMapper;
import com.dat.LibraryManagementSystem.model.Book;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.model.Wishlist;
import com.dat.LibraryManagementSystem.payload.dto.WishlistDTO;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.repository.BookRepository;
import com.dat.LibraryManagementSystem.repository.WishlistRepository;
import com.dat.LibraryManagementSystem.service.UserService;
import com.dat.LibraryManagementSystem.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserService userService;
    private final BookRepository bookRepository;
    private final WishlistMapper wishlistMapper;



    @Override
    public WishlistDTO addToWishlist(Long bookId, String notes) throws Exception {
        User user = userService.getCurrentUser();

        //validate book ton tai
        Book book = bookRepository.findById(bookId)
                .orElseThrow(()-> new Exception("Sach khong ton tai"));

        // kiem tra book da co san trong wishlist

        if(wishlistRepository.existsByUserIdAndBookId(user.getId(), bookId)){
            throw  new Exception("Sach da co trong wishlist");
        }

        //tao wishlist
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setBook(book);
        wishlist.setNotes(notes);
        Wishlist saved = wishlistRepository.save(wishlist);
        return wishlistMapper.toDTO(saved);

    }

    @Override
    public void removeFromWishlist(Long bookId) throws Exception {
        User user = userService.getCurrentUser();
        Wishlist wishlist = wishlistRepository.findByUserIdAndBookId(
                user.getId(), bookId
        );
        if(wishlist==null){
            throw new Exception("Sach khong co tron wish list");
        }
        wishlistRepository.delete(wishlist);

    }

    @Override
    public PageResponse<WishlistDTO> getMyWishList(int page, int size) throws UserException {
        Long userId = userService.getCurrentUser().getId();
        Pageable pageable = PageRequest.of(page, size, Sort.by("addedAt").descending());
        Page<Wishlist> wishlistPage = wishlistRepository.findByUserId(userId, pageable);
        return  convertToPageResponse(wishlistPage);
    }


    private PageResponse<WishlistDTO> convertToPageResponse(Page<Wishlist> wishlistPage){
        List<WishlistDTO> wishlistDTOS = wishlistPage.getContent()
                .stream()
                .map(wishlistMapper::toDTO)
                .collect(Collectors.toList());
        return new PageResponse<>(
                wishlistDTOS,
                wishlistPage.getNumber(),
                wishlistPage.getSize(),
                wishlistPage.getTotalElements(),
                wishlistPage.getTotalPages(),
                wishlistPage.isLast(),
                wishlistPage.isFirst(),
                wishlistPage.isEmpty()
        );
    }
}
