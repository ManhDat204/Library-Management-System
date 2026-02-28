package com.dat.LibraryManagementSystem.payload.dto;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;


import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenreDTO {
    private Long id;

    @NotBlank(message = "Genre code is mandatoration")
    private String code;

    @NotBlank(message = "Genre name is mandatoration")
    private String name;

    @Size(max = 500, message = "khong duoc qua 500 ky tu")
    private String description;

    @Min(value = 0, message= "display order cannot be nagetive")
    private Integer displayOrder =0;

    private Boolean active;

    private Long  parentGenreId;

    private String parentGenreName;

    private List<GenreDTO> subGenre;

    private Long bookCount;

    private LocalDateTime createdAt;

    private LocalDateTime updateAt;

}
