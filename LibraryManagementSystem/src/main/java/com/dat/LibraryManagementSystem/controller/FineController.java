package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.domain.FineStatus;
import com.dat.LibraryManagementSystem.domain.FineType;
import com.dat.LibraryManagementSystem.payload.dto.FineDTO;
import com.dat.LibraryManagementSystem.payload.request.CreateFineRequest;
import com.dat.LibraryManagementSystem.payload.request.WaiveFineRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.service.FineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fines")
@RequiredArgsConstructor
public class FineController {

    private final FineService fineService;

    // ---- user endpoints -------------------------------------------------

    @GetMapping("/user/{userId}")
    public List<FineDTO> getFinesByUser(@PathVariable Long userId) throws Exception{
        return fineService.getUserFines(userId);
    }

    @GetMapping("/my-fines")
    public List<FineDTO> getMyFines() throws Exception {
        return fineService.getMyFines();
    }

    @GetMapping("/total-pending")
    public Long getTotalPending(@RequestParam(required = false) Long userId) throws Exception {
        return fineService.getTotalPendingFines(userId);
    }

    @PostMapping("/{id}/pay")
    public FineDTO payFine(@PathVariable Long id,
                           @RequestBody(required = false) Map<String, Long> body) throws Exception {
        Long amount = body != null ? body.get("amount") : null;
        return fineService.payFine(id, amount);
    }

    // ---- admin endpoints ------------------------------------------------

    @GetMapping
    public PageResponse<FineDTO> listFines(
            @RequestParam(required = false) FineStatus status,
            @RequestParam(required = false) FineType type,
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) throws Exception {
        return fineService.getAllFines(status, type, userId, page, size);
    }

    @GetMapping("/{id}")
    public FineDTO getFine(@PathVariable Long id) throws Exception {
        return fineService.getFine(id);
    }

    @PostMapping
    public ResponseEntity<FineDTO> createFine(@Valid @RequestBody CreateFineRequest request) throws Exception {
        FineDTO dto = fineService.createFine(request);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/waive")
    public FineDTO waiveFine(@PathVariable Long id, @Valid @RequestBody WaiveFineRequest request) throws Exception {
        // ensure path variable matches request
        if (!id.equals(request.getFineId())) {
            throw new RuntimeException("Path id and body fineId mismatch");
        }
        return fineService.waiveFine(request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFine(@PathVariable Long id) throws Exception {
        fineService.deleteFine(id);
        return ResponseEntity.noContent().build();
    }
}

