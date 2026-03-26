package com.dat.LibraryManagementSystem.service;

import com.dat.LibraryManagementSystem.payload.dto.PublisherDTO;

import java.util.List;

public interface PublisherService {
    PublisherDTO createPublisher(PublisherDTO dto) throws Exception;
    PublisherDTO updatePublisher(Long id, PublisherDTO dto);
    PublisherDTO getPublisherById(Long id);
    List<PublisherDTO> getAll();
    void deletePublisher(Long id);
}