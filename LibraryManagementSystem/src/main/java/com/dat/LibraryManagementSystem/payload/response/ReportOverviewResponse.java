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
public class ReportOverviewResponse {
    private LocalDate startDate;
    private LocalDate endDate;
    private Long totalRevenue;
    private Long subscriptionRevenue;
    private Long fineRevenue;
    private List<ReportMonthlyRevenueItemResponse> monthlyRevenue;
    private Long activeUsers;
    private Long totalUsers;
    private Long totalLoans;
    private Integer onTimeRate;
    private Long totalFines;
    private Long usersWithPendingFines;
    private Long activeSubscriptions;
    private Integer activeSubscriptionRate;
    private Long maleUsersCount;
    private Long femaleUsersCount;
    private Long activeLoans;
    private List<ReportLoanItemResponse> recentBorrows;
    private List<ReportLoanItemResponse> recentReturns;
    private List<ReportTopFineUserResponse> topFineUsers;
    private List<ReportTopBorrowerResponse> topBorrowers;
    private List<ReportGenreStatsResponse> genreStats;
}
