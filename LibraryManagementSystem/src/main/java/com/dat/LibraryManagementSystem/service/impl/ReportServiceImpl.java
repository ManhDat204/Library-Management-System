package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.domain.FineStatus;
import com.dat.LibraryManagementSystem.domain.Gender;
import com.dat.LibraryManagementSystem.domain.PaymentStatus;
import com.dat.LibraryManagementSystem.domain.PaymentType;
import com.dat.LibraryManagementSystem.payload.response.ReportOverviewResponse;
import com.dat.LibraryManagementSystem.payload.response.ReportMonthlyRevenueItemResponse;
import com.dat.LibraryManagementSystem.payload.response.ReportSubscriptionExpiringItemResponse;
import com.dat.LibraryManagementSystem.payload.response.ReportSubscriptionMonthlyItemResponse;
import com.dat.LibraryManagementSystem.payload.response.ReportSubscriptionPlanDistributionItemResponse;
import com.dat.LibraryManagementSystem.payload.response.ReportSubscriptionsResponse;
import com.dat.LibraryManagementSystem.payload.response.ReportLoanItemResponse;
import com.dat.LibraryManagementSystem.payload.response.ReportTopFineUserResponse;
import com.dat.LibraryManagementSystem.payload.response.ReportTopBorrowerResponse;
import com.dat.LibraryManagementSystem.payload.response.ReportGenreStatsResponse;
import com.dat.LibraryManagementSystem.model.Subscription;
import com.dat.LibraryManagementSystem.model.BookLoan;
import com.dat.LibraryManagementSystem.model.Fine;
import com.dat.LibraryManagementSystem.model.User;
import com.dat.LibraryManagementSystem.model.Genre;
import com.dat.LibraryManagementSystem.repository.BookLoanRepository;
import com.dat.LibraryManagementSystem.repository.FineRepository;
import com.dat.LibraryManagementSystem.repository.PaymentRepository;
import com.dat.LibraryManagementSystem.repository.SubscriptionRepository;
import com.dat.LibraryManagementSystem.repository.UserRepository;
import com.dat.LibraryManagementSystem.repository.GenreRepository;
import com.dat.LibraryManagementSystem.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

        private final PaymentRepository paymentRepository;
        private final UserRepository userRepository;
        private final BookLoanRepository bookLoanRepository;
        private final FineRepository fineRepository;
        private final SubscriptionRepository subscriptionRepository;
        private final GenreRepository genreRepository;

        @Override
        @Transactional(readOnly = true)
        public ReportOverviewResponse getOverview(LocalDate startDate, LocalDate endDate) {
                LocalDate resolvedStartDate = startDate != null ? startDate : LocalDate.now().withDayOfYear(1);
                LocalDate resolvedEndDate = endDate != null ? endDate : LocalDate.now();

                LocalDateTime startDateTime = resolvedStartDate.atStartOfDay();
                LocalDateTime endDateTime = resolvedEndDate.plusDays(1).atStartOfDay().minusNanos(1);
                LocalDate today = LocalDate.now();

                long totalRevenue = defaultLong(
                                paymentRepository.sumAmountByStatusExcludingTypeAndCreatedAtBetween(
                                                PaymentStatus.SUCCESS,
                                                PaymentType.WALLET_DEPOSIT,
                                                startDateTime,
                                                endDateTime));
                long activeUsers = userRepository.countByActiveTrue();
                long totalUsers = userRepository.count();
                long totalLoans = bookLoanRepository.countByCheckoutDateRange(resolvedStartDate, resolvedEndDate);
                long overdueLoans = bookLoanRepository.countOverdueByCheckoutDateRange(resolvedStartDate,
                                resolvedEndDate);
                int onTimeRate = totalLoans == 0
                                ? 0
                                : (int) Math.round(((double) (totalLoans - overdueLoans) / totalLoans) * 100);
                long totalFines = fineRepository.countCreatedBetween(startDateTime, endDateTime);
                long usersWithPendingFines = fineRepository.countDistinctUsersByStatus(FineStatus.PENDING);
                long activeSubscriptions = subscriptionRepository.countActiveSubscriptions(today);
                long totalSubscriptions = subscriptionRepository.count();
                int activeSubscriptionRate = totalSubscriptions == 0
                                ? 0
                                : (int) Math.round(((double) activeSubscriptions / totalSubscriptions) * 100);
                long maleUsersCount = userRepository.countByGender(Gender.MALE);
                long femaleUsersCount = userRepository.countByGender(Gender.FEMALE);
                long subscriptionRevenue = defaultLong(
                                paymentRepository.sumAmountByStatusAndTypeAndCreatedAtBetween(
                                                PaymentStatus.SUCCESS,
                                                PaymentType.MEMBERSHIP,
                                                startDateTime,
                                                endDateTime));
                long fineRevenue = defaultLong(
                                paymentRepository.sumAmountByStatusAndTypeAndCreatedAtBetween(
                                                PaymentStatus.SUCCESS,
                                                PaymentType.FINE,
                                                startDateTime,
                                                endDateTime));
                List<ReportMonthlyRevenueItemResponse> monthlyRevenue = buildMonthlyRevenue(
                                resolvedStartDate,
                                resolvedEndDate,
                                paymentRepository);

                long activeLoans = bookLoanRepository.countActiveLoans();
                Pageable pageable = PageRequest.of(0, 5);
                List<ReportLoanItemResponse> recentBorrows = mapToReportLoanItems(
                                bookLoanRepository.findRecentCheckouts(pageable).getContent());
                List<ReportLoanItemResponse> recentReturns = mapToReportLoanItems(
                                bookLoanRepository.findRecentReturns(pageable).getContent());

                Pageable finePageable = PageRequest.of(0, 5);
                List<ReportTopFineUserResponse> topFineUsers = mapToReportTopFineUsers(
                                fineRepository.findTopPendingFines(finePageable).getContent());

                Pageable borrowerPageable = PageRequest.of(0, 5);
                List<ReportTopBorrowerResponse> topBorrowers = mapToReportTopBorrowers(
                                bookLoanRepository.findTopBorrowersByCount(borrowerPageable).getContent());

                Pageable genrePageable = PageRequest.of(0, 10);
                List<ReportGenreStatsResponse> genreStats = mapToReportGenreStats(
                                bookLoanRepository.countLoanGroupByGenre(genrePageable));

                return ReportOverviewResponse.builder()
                                .startDate(resolvedStartDate)
                                .endDate(resolvedEndDate)
                                .totalRevenue(totalRevenue)
                                .subscriptionRevenue(subscriptionRevenue)
                                .fineRevenue(fineRevenue)
                                .monthlyRevenue(monthlyRevenue)
                                .activeUsers(activeUsers)
                                .totalUsers(totalUsers)
                                .totalLoans(totalLoans)
                                .onTimeRate(onTimeRate)
                                .totalFines(totalFines)
                                .usersWithPendingFines(usersWithPendingFines)
                                .activeSubscriptions(activeSubscriptions)
                                .activeSubscriptionRate(activeSubscriptionRate)
                                .maleUsersCount(maleUsersCount)
                                .femaleUsersCount(femaleUsersCount)
                                .activeLoans(activeLoans)
                                .recentBorrows(recentBorrows)
                                .recentReturns(recentReturns)
                                .topFineUsers(topFineUsers)
                                .topBorrowers(topBorrowers)
                                .genreStats(genreStats)
                                .build();
        }

        @Override
        @Transactional(readOnly = true)
        public ReportSubscriptionsResponse getSubscriptionsReport(LocalDate startDate, LocalDate endDate) {
                LocalDate resolvedStartDate = startDate != null ? startDate : LocalDate.now().withDayOfYear(1);
                LocalDate resolvedEndDate = endDate != null ? endDate : LocalDate.now();
                LocalDate referenceDate = resolvedEndDate.isBefore(LocalDate.now()) ? resolvedEndDate : LocalDate.now();

                List<Subscription> allSubscriptions = subscriptionRepository.findAllWithUserAndPlan();
                List<Subscription> periodSubscriptions = allSubscriptions.stream()
                                .filter(subscription -> subscription.getStartDate() != null)
                                .filter(subscription -> !subscription.getStartDate().isBefore(resolvedStartDate)
                                                && !subscription.getStartDate().isAfter(resolvedEndDate))
                                .toList();

                List<Subscription> activeSubscriptionsAtReference = allSubscriptions.stream()
                                .filter(subscription -> Boolean.TRUE.equals(subscription.getIsActive()))
                                .filter(subscription -> subscription.getStartDate() != null
                                                && subscription.getEndDate() != null)
                                .filter(subscription -> !referenceDate.isBefore(subscription.getStartDate())
                                                && !referenceDate.isAfter(subscription.getEndDate()))
                                .toList();

                List<Subscription> expiringSoonSubscriptions = activeSubscriptionsAtReference.stream()
                                .filter(subscription -> subscription.getEndDate() != null)
                                .filter(subscription -> !subscription.getEndDate().isBefore(referenceDate)
                                                && !subscription.getEndDate().isAfter(referenceDate.plusDays(7)))
                                .sorted(Comparator.comparing(Subscription::getEndDate))
                                .toList();

                long totalSubscriptions = periodSubscriptions.size();
                long activeSubscriptions = activeSubscriptionsAtReference.size();
                int activeSubscriptionRate = totalSubscriptions == 0
                                ? 0
                                : (int) Math.round(((double) activeSubscriptions / totalSubscriptions) * 100);
                long renewalExpectedRevenue = expiringSoonSubscriptions.stream()
                                .map(Subscription::getPrice)
                                .filter(price -> price != null)
                                .mapToLong(Long::longValue)
                                .sum();

                List<ReportSubscriptionMonthlyItemResponse> monthlyStats = buildMonthlySubscriptionStats(
                                resolvedStartDate,
                                resolvedEndDate,
                                periodSubscriptions);

                List<ReportSubscriptionPlanDistributionItemResponse> planDistribution = buildPlanDistribution(
                                periodSubscriptions);

                List<ReportSubscriptionExpiringItemResponse> expiringItems = expiringSoonSubscriptions.stream()
                                .map(subscription -> ReportSubscriptionExpiringItemResponse.builder()
                                                .id(subscription.getId())
                                                .name(subscription.getUser() != null
                                                                ? subscription.getUser().getFullName()
                                                                : null)
                                                .plan(resolvePlanName(subscription))
                                                .expiry(subscription.getEndDate())
                                                .revenue(defaultLong(subscription.getPrice()))
                                                .build())
                                .toList();

                return ReportSubscriptionsResponse.builder()
                                .startDate(resolvedStartDate)
                                .endDate(resolvedEndDate)
                                .referenceDate(referenceDate)
                                .totalSubscriptions(totalSubscriptions)
                                .activeSubscriptions(activeSubscriptions)
                                .expiringSoonCount((long) expiringItems.size())
                                .activeSubscriptionRate(activeSubscriptionRate)
                                .renewalExpectedRevenue(renewalExpectedRevenue)
                                .monthlyStats(monthlyStats)
                                .planDistribution(planDistribution)
                                .expiringSoonSubscriptions(expiringItems)
                                .build();
        }

        private List<ReportSubscriptionMonthlyItemResponse> buildMonthlySubscriptionStats(
                        LocalDate startDate,
                        LocalDate endDate,
                        List<Subscription> subscriptions) {
                Map<YearMonth, Long> monthlyCounts = subscriptions.stream()
                                .collect(Collectors.groupingBy(
                                                subscription -> YearMonth.from(subscription.getStartDate()),
                                                LinkedHashMap::new,
                                                Collectors.counting()));

                List<ReportSubscriptionMonthlyItemResponse> results = new ArrayList<>();
                YearMonth currentMonth = YearMonth.from(startDate);
                YearMonth endMonth = YearMonth.from(endDate);
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("'T'M");

                while (!currentMonth.isAfter(endMonth)) {
                        results.add(ReportSubscriptionMonthlyItemResponse.builder()
                                        .month(currentMonth.format(formatter))
                                        .newCount(monthlyCounts.getOrDefault(currentMonth, 0L))
                                        .renewedCount(0L)
                                        .build());
                        currentMonth = currentMonth.plusMonths(1);
                }

                return results;
        }

        private List<ReportSubscriptionPlanDistributionItemResponse> buildPlanDistribution(
                        List<Subscription> subscriptions) {
                if (subscriptions.isEmpty()) {
                        return List.of();
                }

                Map<String, Long> countsByPlan = subscriptions.stream()
                                .collect(Collectors.groupingBy(
                                                this::resolvePlanName,
                                                LinkedHashMap::new,
                                                Collectors.counting()));

                long total = subscriptions.size();
                return countsByPlan.entrySet().stream()
                                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                                .map(entry -> ReportSubscriptionPlanDistributionItemResponse.builder()
                                                .name(entry.getKey())
                                                .value((int) Math.round((entry.getValue() * 100.0) / total))
                                                .build())
                                .toList();
        }

        private String resolvePlanName(Subscription subscription) {
                if (subscription.getPlanName() != null && !subscription.getPlanName().isBlank()) {
                        return subscription.getPlanName();
                }
                if (subscription.getPlan() != null && subscription.getPlan().getName() != null) {
                        return subscription.getPlan().getName();
                }
                return "Khac";
        }

        private long defaultLong(Long value) {
                return value != null ? value : 0L;
        }

        private List<ReportMonthlyRevenueItemResponse> buildMonthlyRevenue(
                        LocalDate startDate,
                        LocalDate endDate,
                        PaymentRepository paymentRepository) {
                List<ReportMonthlyRevenueItemResponse> results = new ArrayList<>();
                YearMonth currentMonth = YearMonth.from(startDate);
                YearMonth endMonth = YearMonth.from(endDate);
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("'T'M");

                while (!currentMonth.isAfter(endMonth)) {
                        LocalDateTime monthStart = currentMonth.atDay(1).atStartOfDay();
                        LocalDateTime monthEnd = currentMonth.atEndOfMonth().plusDays(1).atStartOfDay().minusNanos(1);

                        long subscriptionAmount = defaultLong(
                                        paymentRepository.sumAmountByStatusAndTypeAndCreatedAtBetween(
                                                        PaymentStatus.SUCCESS,
                                                        PaymentType.MEMBERSHIP,
                                                        monthStart,
                                                        monthEnd));
                        long fineAmount = defaultLong(
                                        paymentRepository.sumAmountByStatusAndTypeAndCreatedAtBetween(
                                                        PaymentStatus.SUCCESS,
                                                        PaymentType.FINE,
                                                        monthStart,
                                                        monthEnd));

                        results.add(ReportMonthlyRevenueItemResponse.builder()
                                        .month(currentMonth.format(formatter))
                                        .subscription(subscriptionAmount)
                                        .fines(fineAmount)
                                        .build());
                        currentMonth = currentMonth.plusMonths(1);
                }

                return results;
        }

        private List<ReportLoanItemResponse> mapToReportLoanItems(List<BookLoan> bookLoans) {
                return bookLoans.stream()
                                .map(bl -> ReportLoanItemResponse.builder()
                                                .id(bl.getId())
                                                .userName(bl.getUser() != null ? bl.getUser().getFullName() : null)
                                                .bookTitle(bl.getBook() != null ? bl.getBook().getTitle() : null)
                                                .authorName(bl.getBook() != null && bl.getBook().getAuthor() != null
                                                                ? bl.getBook().getAuthor().getAuthorName()
                                                                : null)
                                                .checkoutDate(bl.getCheckoutDate())
                                                .dueDate(bl.getDueDate())
                                                .returnDate(bl.getReturnDate())
                                                .overdueDays(bl.getOverdueDays())
                                                .status(bl.getStatus())
                                                .build())
                                .toList();
        }

        private List<ReportTopFineUserResponse> mapToReportTopFineUsers(List<Fine> fines) {
                return fines.stream()
                                .map(fine -> ReportTopFineUserResponse.builder()
                                                .id(fine.getId())
                                                .userName(fine.getUser() != null ? fine.getUser().getFullName() : null)
                                                .amount(fine.getAmount())
                                                .fineType(fine.getFineType())
                                                .reason(fine.getReason())
                                                .createdAt(fine.getCreatedAt())
                                                .build())
                                .toList();
        }

        private List<ReportTopBorrowerResponse> mapToReportTopBorrowers(List<Object[]> topBorrowerData) {
                List<ReportTopBorrowerResponse> result = new ArrayList<>();
                int rank = 1;
                LocalDate today = LocalDate.now();

                for (Object[] data : topBorrowerData) {
                        Long userId = ((Number) data[0]).longValue();
                        Long loanCount = ((Number) data[1]).longValue();

                        User user = userRepository.findById(userId).orElse(null);
                        if (user == null) {
                                continue;
                        }

                        // Lấy tất cả BookLoan của user
                        List<BookLoan> userLoans = bookLoanRepository.findAllByUserId(userId);

                        // Tính tỷ lệ trả đúng hạn
                        long overdueCount = userLoans.stream()
                                        .filter(bl -> bl.getIsOverDue() != null && bl.getIsOverDue())
                                        .count();
                        long onTimeCount = loanCount - overdueCount;
                        String onTimePercentage = loanCount > 0
                                        ? String.valueOf((int) Math.round(((double) onTimeCount / loanCount) * 100))
                                                        + "%"
                                        : "0%";

                        // Lấy subscription plan hiện tại (đang active)
                        String plan = "Basic";
                        Optional<Subscription> activeSubscription = subscriptionRepository
                                        .findActiveSubscriptionByUserId(userId, today);
                        if (activeSubscription.isPresent()) {
                                plan = activeSubscription.get().getPlan() != null
                                                ? activeSubscription.get().getPlan().getName()
                                                : "Basic";
                        }

                        result.add(ReportTopBorrowerResponse.builder()
                                        .id(user.getId())
                                        .rank(rank++)
                                        .name(user.getFullName())
                                        .total(loanCount)
                                        .onTime(onTimePercentage)
                                        .plan(plan)
                                        .build());
                }
                return result;
        }

        private List<ReportGenreStatsResponse> mapToReportGenreStats(List<Object[]> genreData) {
                if (genreData == null || genreData.isEmpty()) {
                        return new ArrayList<>();
                }

                // Calculate total loans for percentage
                long totalLoans = genreData.stream()
                                .mapToLong(data -> ((Number) data[1]).longValue())
                                .sum();

                List<ReportGenreStatsResponse> result = new ArrayList<>();
                for (Object[] data : genreData) {
                        Long genreId = ((Number) data[0]).longValue();
                        Long loanCount = ((Number) data[1]).longValue();

                        Genre genre = genreRepository.findById(genreId).orElse(null);
                        if (genre == null) {
                                continue;
                        }

                        int percentage = totalLoans > 0
                                        ? (int) Math.round(((double) loanCount / totalLoans) * 100)
                                        : 0;

                        result.add(ReportGenreStatsResponse.builder()
                                        .genreId(genreId)
                                        .genreName(genre.getName())
                                        .loanCount(loanCount)
                                        .percentage(percentage)
                                        .build());
                }
                return result;
        }
}
