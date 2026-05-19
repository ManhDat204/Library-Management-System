package com.dat.LibraryManagementSystem.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRecentSubscriptionResponse {
    private Long id;
    private String userName;
    private String plan;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long price;
    private Boolean active;
    private LocalDateTime createdAt;
}
