package com.dat.LibraryManagementSystem.controller;

import com.dat.LibraryManagementSystem.payload.response.ReportOverviewResponse;
import com.dat.LibraryManagementSystem.payload.response.ReportSubscriptionsResponse;
import com.dat.LibraryManagementSystem.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/reports")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/overview")
    public ResponseEntity<ReportOverviewResponse> getOverview(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {
        return ResponseEntity.ok(reportService.getOverview(startDate, endDate));
    }

    @GetMapping("/subscriptions")
    public ResponseEntity<ReportSubscriptionsResponse> getSubscriptionsReport(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {
        return ResponseEntity.ok(reportService.getSubscriptionsReport(startDate, endDate));
    }
}
