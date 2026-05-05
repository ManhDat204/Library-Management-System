package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.mapper.PublisherMapper;
import com.dat.LibraryManagementSystem.model.Author;
import com.dat.LibraryManagementSystem.model.Publisher;
import com.dat.LibraryManagementSystem.payload.dto.PublisherDTO;
import com.dat.LibraryManagementSystem.repository.PublisherRepository;
import com.dat.LibraryManagementSystem.service.PublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
        publisher.setAddress(dto.getAddress());
        publisher.setPhone(dto.getPhone());
        publisher.setEmail(dto.getEmail());
        return publisherMapper.toDTO(publisherRepository.save(publisher));
    }

    @Override
    public PublisherDTO getPublisherById(Long id) {
        return publisherMapper.toDTO(findById(id));
    }

    @Override
    public List<PublisherDTO> getAll() {
        return publisherRepository.findByActiveTrueOrderByCreatedAtDesc()
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

    @Override
    public Map<String, Object> searchPublishers(String searchTerm, String address, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Publisher> publisherPage = publisherRepository.searchPublishers(searchTerm, address, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", publisherPage.getContent().stream()
                .map(publisherMapper::toDTO)
                .toList());
        response.put("totalPage", publisherPage.getTotalPages());
        response.put("totalElement", publisherPage.getTotalElements());
        response.put("currentPage", page);
        response.put("pageSize", size);

        return response;
    }

    private Publisher findById(Long id) {
        return publisherRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà xuất bản với id: " + id));
    }
}