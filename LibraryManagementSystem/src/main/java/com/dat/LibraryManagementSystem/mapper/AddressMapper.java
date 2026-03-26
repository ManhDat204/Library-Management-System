package com.dat.LibraryManagementSystem.mapper;

import com.dat.LibraryManagementSystem.model.Address;
import com.dat.LibraryManagementSystem.payload.dto.AddressDTO;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class AddressMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public AddressDTO toDTO(Address address) {
        String fullAddress = String.join(", ",
                address.getWard(),
                address.getDistrict(),
                address.getProvince());

        return AddressDTO.builder()
                .id(address.getId())
                .userId(address.getUser().getId())
                .recipientName(address.getRecipientName())
                .phoneNumber(address.getPhoneNumber())
                .province(address.getProvince())
                .district(address.getDistrict())
                .ward(address.getWard())
                .isDefault(address.getIsDefault())
                .fullAddress(fullAddress)
                .createdAt(address.getCreatedAt() != null ? address.getCreatedAt().format(FORMATTER) : null)
                .updatedAt(address.getUpdatedAt() != null ? address.getUpdatedAt().format(FORMATTER) : null)
                .build();
    }
}