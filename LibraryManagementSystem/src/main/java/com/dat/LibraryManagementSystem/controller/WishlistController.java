package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.model.Wishlist;
import com.dat.LibraryManagementSystem.payload.dto.WishlistDTO;
import com.dat.LibraryManagementSystem.payload.response.ApiResponse;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.service.WishlistService;
import com.dat.LibraryManagementSystem.service.impl.WishlistServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/wishlist")
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/add/{bookId}")
    public ResponseEntity<?> adToWishList(@PathVariable Long bookId,
                                          @RequestParam(required = false) String notes) throws Exception {
        WishlistDTO wishlistDTO = wishlistService.addToWishlist(bookId,notes);
        return ResponseEntity.ok(wishlistDTO);
    }


    @DeleteMapping("/remove/{bookId}")
    public ResponseEntity<ApiResponse> removeFromWishList(@PathVariable Long bookId) throws Exception {
        wishlistService.removeFromWishlist(bookId);
        return ResponseEntity.ok(
                new ApiResponse("Sach duoc xoa khoi wishlist", true)
        );
    }

    @GetMapping("/my-wishlist")
    public ResponseEntity<?> getMyWishlist(@RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) throws Exception {
        PageResponse<WishlistDTO> wishlist =wishlistService.getMyWishList(page,size);
        return ResponseEntity.ok(wishlist);
    }
}
