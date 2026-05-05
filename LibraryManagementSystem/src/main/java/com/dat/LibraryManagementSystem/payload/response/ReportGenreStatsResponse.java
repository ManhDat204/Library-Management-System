package com.dat.LibraryManagementSystem.payload.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportGenreStatsResponse {
    private Long genreId;
    private String genreName;
    private Long loanCount;
    private Integer percentage;
}
