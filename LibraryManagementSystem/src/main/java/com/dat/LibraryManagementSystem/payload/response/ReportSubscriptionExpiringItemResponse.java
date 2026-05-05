package com.dat.LibraryManagementSystem.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSubscriptionExpiringItemResponse {
    private Long id;
    private String name;
    private String plan;
    private LocalDate expiry;
    private Long revenue;
}
