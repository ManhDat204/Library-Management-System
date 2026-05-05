package com.dat.LibraryManagementSystem.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportMonthlyRevenueItemResponse {
    private String month;
    private Long subscription;
    private Long fines;
}
