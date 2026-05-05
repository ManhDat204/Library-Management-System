package com.dat.LibraryManagementSystem.mapper;

import com.dat.LibraryManagementSystem.model.Publisher;
import com.dat.LibraryManagementSystem.payload.dto.PublisherDTO;
import org.springframework.stereotype.Component;

@Component
public class PublisherMapper {
    public Publisher toEntity(PublisherDTO dto) {
        return Publisher.builder()
                .name(dto.getName())
                .country(dto.getCountry())
                .address(dto.getAddress())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .active(true)
                .build();
    }

    public PublisherDTO toDTO(Publisher publisher) {
        return PublisherDTO.builder()
                .id(publisher.getId())
                .name(publisher.getName())
                .country(publisher.getCountry())
                .address(publisher.getAddress())
                .email(publisher.getEmail())
                .phone(publisher.getPhone())
                .active(publisher.getActive())
                .createdAt(publisher.getCreatedAt())
                .updatedAt(publisher.getUpdatedAt())
                .build();
    }
}