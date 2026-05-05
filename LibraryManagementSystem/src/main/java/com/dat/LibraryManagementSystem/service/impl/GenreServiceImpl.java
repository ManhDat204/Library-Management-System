package com.dat.LibraryManagementSystem.service.impl;

import com.dat.LibraryManagementSystem.exception.GenreException;
import com.dat.LibraryManagementSystem.mapper.GenreMapper;
import com.dat.LibraryManagementSystem.model.Genre;
import com.dat.LibraryManagementSystem.payload.dto.GenreDTO;
import com.dat.LibraryManagementSystem.payload.request.GenreSearchRequest;
import com.dat.LibraryManagementSystem.payload.response.PageResponse;
import com.dat.LibraryManagementSystem.repository.GenreRepository;
import com.dat.LibraryManagementSystem.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;
    private final GenreMapper genreMapper;

    @Override
    public GenreDTO createGenre(GenreDTO genreDTO) {
        Genre genre = genreMapper.toEntity(genreDTO);
        Genre savedGenre = genreRepository.save(genre);
        return genreMapper.toDTO(savedGenre);
    }

    @Override
    public List<GenreDTO> getAllGenres() {
        // FIXED: findAllByOrderByDisplayOrder → findAllByOrderByNameAsc
        return genreRepository.findAllByOrderByNameAsc().stream()
                .map(genreMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public GenreDTO getGenreById(Long genreId) throws GenreException {
        Genre genre = genreRepository.findById(genreId)
                .orElseThrow(() -> new GenreException("Thể loại không tồn tại"));
        return genreMapper.toDTO(genre);
    }

    @Override
    public GenreDTO updateGenre(Long genreId, GenreDTO genreDTO) throws GenreException {
        Genre existingGenre = genreRepository.findById(genreId)
                .orElseThrow(() -> new GenreException("Thể loại không tồn tại"));
        genreMapper.updateEntityFromDTO(genreDTO, existingGenre);
        Genre updatedGenre = genreRepository.save(existingGenre);
        return genreMapper.toDTO(updatedGenre);
    }

    @Override

    public void deleteGenre(Long genreId) throws GenreException {
        Genre existingGenre = genreRepository.findById(genreId)
                .orElseThrow(() -> new GenreException("Thể loại không tồn tại"));
        existingGenre.setActive(false);  // ✅ SOFT DELETE
        genreRepository.save(existingGenre);
    }

    @Override
    public void hardDeleteGenre(Long genreId) throws GenreException {
        Genre existingGenre = genreRepository.findById(genreId)
                .orElseThrow(() -> new GenreException("Thể loại không tồn tại"));
        genreRepository.delete(existingGenre);
    }

    @Override
    public List<GenreDTO> getAllActiveGenresWithSubGenres() {
        // FIXED: OrderByDisplayOrderAsc → OrderByNameAsc
        List<Genre> topLevelGenres = genreRepository
                .findByParentGenreIsNullAndActiveTrueOrderByNameAsc();
        return genreMapper.toDTOList(topLevelGenres);
    }

    @Override
    public List<GenreDTO> getSubGenres(Long genreId) {
        // FIXED: OrderByDisplayOrderAsc → OrderByNameAsc
        return genreRepository.findByParentGenreIdAndActiveTrueOrderByNameAsc(genreId)
                .stream()
                .map(genreMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<GenreDTO> getTopLevelGenres() {
        // FIXED: OrderByDisplayOrderAsc → OrderByNameAsc
        List<Genre> topLevelGenres = genreRepository
                .findByParentGenreIsNullAndActiveTrueOrderByNameAsc();
        return genreMapper.toDTOList(topLevelGenres);
    }

    @Override
    public List<GenreDTO> getTopBorrowedGenres(int limit) {
        List<Object[]> results = genreRepository.findTopBorrowedGenres(limit);
        return results.stream()
                .map(row -> {
                    GenreDTO dto = new GenreDTO();
                    dto.setId(((Number) row[0]).longValue());
                    dto.setName((String) row[1]);
                    dto.setBorrowCount(((Number) row[2]).longValue());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public long getTotalActiveGenres() {
        return genreRepository.countByActiveTrue();
    }

    @Override
    public long getBookCountByGenres(Long genreId) {
        return genreRepository.countBooksByGenre(genreId);
    }

    @Override
    public PageResponse<GenreDTO> searchGenres(GenreSearchRequest request) {
        Sort sort = Sort.by(
                "DESC".equalsIgnoreCase(request.getSortDirection())
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC,
                request.getSortBy()
        );
        Pageable pageable = PageRequest.of(request.getPage(), request.getSize(), sort);

        Page<Genre> page;
        if (request.getSearchTerm() != null && !request.getSearchTerm().trim().isEmpty()) {
            page = genreRepository.findByNameContainingIgnoreCase(request.getSearchTerm(), pageable);
        } else {
            page = genreRepository.findAll(pageable);
        }

        return new PageResponse<>(
                page.getContent().stream()
                        .map(genreMapper::toDTO)
                        .collect(Collectors.toList()),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast(),
                page.isFirst(),
                page.isEmpty()
        );
    }
}