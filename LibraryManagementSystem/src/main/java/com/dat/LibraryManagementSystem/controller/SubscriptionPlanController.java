package com.dat.LibraryManagementSystem.controller;


import com.dat.LibraryManagementSystem.exception.UserException;
import com.dat.LibraryManagementSystem.model.SubscriptionPlan;
import com.dat.LibraryManagementSystem.payload.dto.SubscriptionPlanDTO;
import com.dat.LibraryManagementSystem.payload.response.ApiResponse;
import com.dat.LibraryManagementSystem.service.SubscriptionPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/subscription-plans")
public class SubscriptionPlanController {
    private final SubscriptionPlanService subscriptionPlanService;


    @GetMapping()
    public ResponseEntity<?> getAllSubscriptionPlans(){
        List<SubscriptionPlanDTO> plans = subscriptionPlanService.getAllSubscriptionPlan();
        return ResponseEntity.ok(plans);
    }

    @PostMapping("/admin/create")
    public ResponseEntity<?> createSubscriptionPlan(
            @Valid @RequestBody SubscriptionPlanDTO subscriptionPlanDTO
    ) throws Exception, UserException {
        SubscriptionPlanDTO plans = subscriptionPlanService.createSubscriptionPlan(
                subscriptionPlanDTO);
        return ResponseEntity.ok(plans);
    }


    @PutMapping("/admin/{id}")
    public ResponseEntity<?> updateSubscriptionPlan(
            @Valid @RequestBody SubscriptionPlanDTO subscriptionPlanDTO,
            @PathVariable long id
    ) throws Exception, UserException {
        SubscriptionPlanDTO plans = subscriptionPlanService.updateSubscriptionPlan(
                id, subscriptionPlanDTO);
        return ResponseEntity.ok(plans);
    }


    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteSubscriptionPlan(
            @PathVariable long id
    ) throws Exception {
        subscriptionPlanService.deleteSubscriptionPlan(id);
        ApiResponse res = new ApiResponse(" Xoa thanh cong ", true);
        return ResponseEntity.ok(res);
    }
}
