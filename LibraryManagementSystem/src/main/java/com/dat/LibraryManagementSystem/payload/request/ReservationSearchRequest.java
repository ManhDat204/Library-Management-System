package com.dat.LibraryManagementSystem.payload.request;

import com.dat.LibraryManagementSystem.domain.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationSearchRequest {

    private Long userId;

    private Long bookId;

    private ReservationStatus status;

    private Boolean activeOnly;

    @Builder.Default
    private int page = 0;
    @Builder.Default
    private  int size =20;
    @Builder.Default
    private String sortBy = "reservedAt";
    @Builder.Default
    private String sortDirection ="DESC";

}
