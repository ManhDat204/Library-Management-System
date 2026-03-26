package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.mapper.PublisherMapper;
import com.dat.LibraryManagementSystem.model.Author;
import com.dat.LibraryManagementSystem.model.Publisher;
import com.dat.LibraryManagementSystem.payload.dto.PublisherDTO;
import com.dat.LibraryManagementSystem.repository.PublisherRepository;
import com.dat.LibraryManagementSystem.service.PublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PublisherServiceImpl implements PublisherService {

    private final PublisherRepository publisherRepository;
    private final PublisherMapper publisherMapper;

    @Override
    public PublisherDTO createPublisher(PublisherDTO dto) throws Exception {
        if (publisherRepository.existsByName(dto.getName())) {
            throw new Exception("Nhà xuất bản đã tồn tại: " + dto.getName());
        }
        Publisher publisher = publisherMapper.toEntity(dto);
        Publisher savedPublisher = publisherRepository.save(publisher);
        return publisherMapper.toDTO(savedPublisher);

    }

    @Override
    public PublisherDTO updatePublisher(Long id, PublisherDTO dto) {
        Publisher publisher = findById(id);
        publisher.setName(dto.getName());
        publisher.setCountry(dto.getCountry());
        return publisherMapper.toDTO(publisherRepository.save(publisher));
    }

    @Override
    public PublisherDTO getPublisherById(Long id) {
        return publisherMapper.toDTO(findById(id));
    }

    @Override
    public List<PublisherDTO> getAll() {
        return publisherRepository.findAll()
                .stream()
                .map(publisherMapper::toDTO)
                .toList();
    }

    @Override
    public void deletePublisher(Long id) {
        Publisher publisher = findById(id);
        publisher.setActive(false);
        publisherRepository.save(publisher);
    }

    private Publisher findById(Long id) {
        return publisherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà xuất bản với id: " + id));
    }
}