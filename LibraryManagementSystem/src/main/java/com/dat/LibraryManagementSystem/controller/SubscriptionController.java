package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.exception.SubscriptionException;
import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.model.Subscription;
import com.dat.LibraryManagementSystem.model.SubscriptionPlan;
import com.dat.LibraryManagementSystem.payload.dto.SubscriptionDTO;
import com.dat.LibraryManagementSystem.payload.response.ApiResponse;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    @PostMapping("/subscribe")
    public ResponseEntity<?>  subscribe(
            @RequestBody SubscriptionDTO subscriptionDTO
            ) throws Exception {
        SubscriptionDTO dto = subscriptionService.subscribe(subscriptionDTO);
        return ResponseEntity.ok(dto);
    }
    @GetMapping("/user/active")
    public ResponseEntity<?>  getUserActiveSubscriptions(
            @RequestParam(required = false) Long userId
    ) throws Exception {

        SubscriptionDTO dto = subscriptionService.getUsersActiveSubscription(userId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/admin")
    public ResponseEntity<?>  getAllSubscriptions(){
        int page =0 ;
        int size = 10;
        Pageable pageable = PageRequest.of(page,size);
        List<SubscriptionDTO> dtoList = subscriptionService.getAllSubscriptions(pageable);
        return ResponseEntity.ok(dtoList);
    }


    @GetMapping("/admin/deactivate-expired")
    public ResponseEntity<?>  deactivateExpiredSubscriptions() throws Exception {
        int page =0 ;
        int size = 10;
        Pageable pageable = PageRequest.of(page,size);
        subscriptionService.deactivateExpiredSubscriptions();
        ApiResponse res = new ApiResponse("task done", true);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/cancel/{subscriptionId}")
    public ResponseEntity<?>  cancelSubscription(
            @PathVariable Long subscriptionId,
            @RequestParam(required = false) String reason) throws Exception {
            SubscriptionDTO subscription = subscriptionService.cancelSubscription(subscriptionId,reason);
            return ResponseEntity.ok(subscription);
    }

    @PostMapping("/activate")
    public ResponseEntity<?>  activateSubscription(
            @RequestParam Long subscriptionId,
            @RequestParam Long paymentId) throws SubscriptionException {
        SubscriptionDTO subscription = subscriptionService
                .activateSubscription(subscriptionId,paymentId);
        return ResponseEntity.ok(subscription);
    }








}
