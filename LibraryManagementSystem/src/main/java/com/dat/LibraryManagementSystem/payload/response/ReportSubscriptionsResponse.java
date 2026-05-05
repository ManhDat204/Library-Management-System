package com.dat.LibraryManagementSystem.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportSubscriptionsResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate referenceDate;
    private Long totalSubscriptions;
    private Long activeSubscriptions;
    private Long expiringSoonCount;
    private Integer activeSubscriptionRate;
    private Long renewalExpectedRevenue;
    private List<ReportSubscriptionMonthlyItemResponse> monthlyStats;
    private List<ReportSubscriptionPlanDistributionItemResponse> planDistribution;
    private List<ReportSubscriptionExpiringItemResponse> expiringSoonSubscriptions;
}
