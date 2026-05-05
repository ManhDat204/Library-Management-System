package com.dat.LibraryManagementSystem.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Genre {
    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Genre code bat buov")
    private String code;


    @NotBlank(message = "Genre name bat buoc")
    private String name;

    @Size(max = 500, message = "khong duoc qua 500 ky tu")
    private String description;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active=true;

    @ManyToOne
    private Genre parentGenre;

    @OneToMany
    @Builder.Default
    private List<Genre> subGenres= new ArrayList<Genre>();

//    @OneToMany(mappedBy = "Genre", cascade = CascadeType.PERSIST)
//    private List<Book> book= new ArrayList<Book>();

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

}
