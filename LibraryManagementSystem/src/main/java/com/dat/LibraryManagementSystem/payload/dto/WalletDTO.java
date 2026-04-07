package com.dat.LibraryManagementSystem.payload.dto;

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
public class WalletDTO {
    private Long id;
    private Long userId;
    private String userFullName;
    private String userEmail;

    private BigDecimal balance;

    private BigDecimal lockedBalance;

    private BigDecimal totalBalance;

    private LocalDateTime updatedAt;
}
