package com.dat.LibraryManagementSystem.model;


import jakarta.persistence.*;
import jakarta.validation.constraints.AssertTrue;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(unique = true, nullable = false)
    private String isbn;

    @Column( nullable = false)
    private String title;

    @Column( nullable = false)
    private String author;

    @JoinColumn(nullable = false)
    @ManyToOne
    private Genre genre;

    private String publisher;

    private LocalDate publishedDate;

    private String language;

    private String description;

    private Integer pages;

    @Column( nullable = false)
    private Integer totalCopies;

    @Column( nullable = false)
    private Integer availableCopies;

    private BigDecimal price;

    private String coverImageUrl;

    @Column( nullable = false)
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @AssertTrue(message ="So ban sach co san khong the lon hon tong so ban")
    public boolean  isAvailableCopiesValid(){
        if(totalCopies==null || availableCopies==null){
            return true;
        }
        return availableCopies<=totalCopies;
    }
}
