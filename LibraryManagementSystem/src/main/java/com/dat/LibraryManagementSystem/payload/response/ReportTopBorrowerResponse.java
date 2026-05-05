package com.dat.LibraryManagementSystem.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportTopBorrowerResponse {
    private Long id;
    private Integer rank;
    private String name;
    private Long total;
    private String onTime;
    private String plan;
}
