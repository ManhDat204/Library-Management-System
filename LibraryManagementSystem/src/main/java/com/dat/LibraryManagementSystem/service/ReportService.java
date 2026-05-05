package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.payload.response.ReportOverviewResponse;
import com.dat.LibraryManagementSystem.payload.response.ReportSubscriptionsResponse;

import java.time.LocalDate;

public interface ReportService {
    ReportOverviewResponse getOverview(LocalDate startDate, LocalDate endDate);
    ReportSubscriptionsResponse getSubscriptionsReport(LocalDate startDate, LocalDate endDate);
}
