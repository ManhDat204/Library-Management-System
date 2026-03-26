package com.dat.LibraryManagementSystem.payload.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaiveFineRequest {
    @NotNull(message = "fine id  la bat buoc")
    private Long fineId;

    @NotBlank(message = "waiver reason la bat buoc")
    private String reason;
}
