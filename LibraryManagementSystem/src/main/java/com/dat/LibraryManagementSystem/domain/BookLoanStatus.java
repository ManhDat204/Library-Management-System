package com.dat.LibraryManagementSystem.domain;

import java.util.zip.CheckedOutputStream;

public enum BookLoanStatus {
    CHECK_OUT,
    RETURNED,
    OVERDUE,
    LOST,
    DAMAGED,
    PENDING_RETURN,
    SHIPPING,
    DELIVERED
}
