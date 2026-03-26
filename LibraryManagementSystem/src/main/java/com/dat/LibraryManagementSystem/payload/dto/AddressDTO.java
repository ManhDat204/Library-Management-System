package com.dat.LibraryManagementSystem.payload.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressDTO {

    private Long id;
    private Long userId;
    private String recipientName;
    private String phoneNumber;
    private String province;
    private String district;
    private String ward;
    private Boolean isDefault;
    private String fullAddress;
    private String createdAt;
    private String updatedAt;
}