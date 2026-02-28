package com.dat.LibraryManagementSystem.mapper;

import com.dat.LibraryManagementSystem.model.Genre;
import com.dat.LibraryManagementSystem.payload.dto.GenreDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;
import com.dat.LibraryManagementSystem.repository.GenreRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class GenreMapper {

    private final GenreRepository genreRepository;

    public GenreDTO toDTO(Genre savedGenre) {
        if (savedGenre == null) {
            return null;
        }

        GenreDTO dto = GenreDTO.builder()
                .id(savedGenre.getId())
                .code(savedGenre.getCode())
                .name(savedGenre.getName())
                .description(savedGenre.getDescription())
                .displayOrder(savedGenre.getDisplayOrder())
                .active(savedGenre.getActive())
                .createdAt(savedGenre.getCreatedAt())
                .updateAt(savedGenre.getUpdatedAt())
                .build();

        if (savedGenre.getParentGenre() != null) {
            dto.setParentGenreId(savedGenre.getParentGenre().getId());
            dto.setParentGenreName(savedGenre.getParentGenre().getName());
        }
        if (savedGenre.getSubGenres() != null && !savedGenre.getSubGenres().isEmpty()) {
            dto.setSubGenre(savedGenre.getSubGenres().stream()
                    .filter(subGenre -> subGenre.getActive())
                    .map(subGenre -> toDTO(subGenre)).collect(Collectors.toList()));
        }

        // dto.setBookCount((Long) (savedGenre.getB))

        return dto;
    }

    public Genre toEntity(GenreDTO genreDTO) {
        if (genreDTO == null) {
            return null;
        }
        Genre genre = Genre.builder()
                .code(genreDTO.getCode())
                .name(genreDTO.getName())
                .description(genreDTO.getDescription())
                .displayOrder(genreDTO.getDisplayOrder())
                .active(true)
                .build();

        if (genreDTO.getParentGenreId() != null) {
            genreRepository.findById(genreDTO.getParentGenreId())
                    .ifPresent(genre::setParentGenre);
        }
        return genre;
    }

    public void updateEntityFromDTO(GenreDTO dto,  Genre ExistingGenre){
        if(dto ==null || ExistingGenre ==null){
            return;
        }
        ExistingGenre.setCode(dto.getCode());
        ExistingGenre.setName(dto.getName());
        ExistingGenre.setDescription(dto.getDescription());
        ExistingGenre.setDisplayOrder(dto.getDisplayOrder()!= null ? dto.getDisplayOrder() :0 );
        if(dto.getParentGenreId()!=null){
            genreRepository.findById(dto.getParentGenreId())
                    .ifPresent(ExistingGenre::setParentGenre);
        }
    }

    public List<GenreDTO> toDTOList(List<Genre> genreList){
        return genreList.stream().map(genre -> toDTO(genre)).collect(Collectors.toList());
    }

}
