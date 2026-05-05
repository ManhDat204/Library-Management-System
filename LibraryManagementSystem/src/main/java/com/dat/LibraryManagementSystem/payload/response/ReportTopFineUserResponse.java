package com.dat.LibraryManagementSystem.payload.response;

import com.dat.LibraryManagementSystem.domain.FineType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportTopFineUserResponse {
    private Long id;
    private String userName;
    private BigDecimal amount;
    private FineType fineType;
    private String reason;
    private LocalDateTime createdAt;
}
