package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.payload.dto.AddressDTO;
import com.dat.LibraryManagementSystem.payload.request.AddressRequest;
import com.dat.LibraryManagementSystem.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressDTO>> getAll(@PathVariable Long userId) {
        return ResponseEntity.ok(addressService.getAll(userId));
    }

    @GetMapping("/{addressId}")
    public ResponseEntity<AddressDTO> getById(
            @PathVariable Long userId,
            @PathVariable Long addressId) {
        return ResponseEntity.ok(addressService.getById(addressId, userId));
    }

    @PostMapping
    public ResponseEntity<AddressDTO> create(
            @PathVariable Long userId,
            @Valid @RequestBody AddressRequest.Create request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(addressService.create(userId, request));
    }

    @PutMapping("/{addressId}")
    public ResponseEntity<AddressDTO> update(
            @PathVariable Long userId,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest.Update request) {
        return ResponseEntity.ok(addressService.update(addressId, userId, request));
    }

    @PatchMapping("/{addressId}/default")
    public ResponseEntity<AddressDTO> setDefault(
            @PathVariable Long userId,
            @PathVariable Long addressId) {
        return ResponseEntity.ok(addressService.setDefault(addressId, userId));
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<Void> delete(
            @PathVariable Long userId,
            @PathVariable Long addressId) {
        addressService.delete(addressId, userId);
        return ResponseEntity.noContent().build();
    }
}