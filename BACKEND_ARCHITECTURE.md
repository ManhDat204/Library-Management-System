# 🏗️ Backend Architecture - Library Management System

## Tổng Quan Kiến Trúc

Hệ thống backend tuân theo kiến trúc **Layered Architecture** (3-Layer Architecture) kết hợp với các pattern **DTO**, **Mapper** và **Exception Handling** tập trung.

```
┌─────────────────────────────────────────────────┐
│           Controller Layer (Presentation)       │
├─────────────────────────────────────────────────┤
│  - Tiếp nhận HTTP Request                       │
│  - Gọi Service                                  │
│  - Trả về HTTP Response                         │
├─────────────────────────────────────────────────┤
│         Service Layer (Business Logic)          │
├─────────────────────────────────────────────────┤
│  - Service Interface                            │
│  - ServiceImpl (Implementation)                  │
│  - Chứa toàn bộ logic nghiệp vụ                │
├─────────────────────────────────────────────────┤
│     Repository Layer (Data Persistence)         │
├─────────────────────────────────────────────────┤
│  - Spring Data JPA                              │
│  - Giao tiếp với Database                       │
│  - Không chứa logic nghiệp vụ                  │
└─────────────────────────────────────────────────┘
```

---

## 📂 Cấu Trúc Thư Mục

```
com/dat/LibraryManagementSystem/
├── controller/              # Controller Layer
│   ├── AdminBookController.java
│   ├── AuthController.java
│   ├── BookController.java
│   ├── UserController.java
│   └── ...
│
├── service/                 # Service Layer
│   ├── BookService.java    # Interface
│   ├── UserService.java
│   ├── AuthService.java
│   └── impl/
│       ├── BookServiceImpl.java
│       ├── UserServiceImpl.java
│       └── AuthServiceImpl.java
│
├── repository/              # Repository Layer (Data Access)
│   ├── BookRepository.java
│   ├── UserRepository.java
│   ├── BookLoanRepository.java
│   └── ...
│
├── domain/                  # Domain Models (Entities)
│   ├── User.java
│   ├── Book.java
│   ├── BookLoan.java
│   ├── UserRole.java
│   └── ...
│
├── payload/                 # DTOs và Payloads
│   ├── request/            # Request DTOs
│   │   ├── CreateBookRequest.java
│   │   ├── UpdateUserRequest.java
│   │   └── ...
│   ├── response/           # Response DTOs
│   │   ├── BookResponse.java
│   │   ├── UserResponse.java
│   │   └── ...
│   └── dto/                # Common DTOs
│       ├── PaginationDTO.java
│       └── ...
│
├── mapper/                  # Entity ↔ DTO Mapping
│   ├── BookMapper.java
│   ├── UserMapper.java
│   └── ...
│
├── Configrations/           # System Configuration
│   ├── SecurityConfig.java
│   ├── JwtProvider.java
│   ├── JwtValidator.java
│   ├── CloudinaryConfig.java
│   ├── VNPayConfig.java
│   └── WebSocketConfig.java
│
├── security/                # JWT & Security
│   ├── JwtAuthenticationFilter.java
│   ├── JwtTokenProvider.java
│   └── CustomUserDetailsService.java
│
├── exception/               # Exception Handling
│   ├── GlobalException.java
│   ├── UserException.java
│   ├── BookException.java
│   ├── PaymentException.java
│   └── GlobalExceptionHandler.java
│
├── model/                   # Model Support Classes
│   └── (legacy/common models)
│
└── websocket/               # WebSocket Support
    └── WebSocketHandler.java
```

---

## 🔄 Chi Tiết Các Layer

### 1️⃣ **Controller Layer** (Tầng Trình Bày)

**Mục đích:** Tiếp nhận HTTP request từ Frontend, xử lý và trả về HTTP response.

**Trách nhiệm:**

- Tiếp nhận request từ client
- Gọi các method từ Service
- Trả về response với HTTP status code thích hợp
- Không chứa logic nghiệp vụ

**Ví dụ:**

```java
@RestController
@RequestMapping("/api/books")
public class BookController {

    @Autowired
    private BookService bookService;

    @Autowired
    private BookMapper bookMapper;

    // GET - Lấy tất cả sách
    @GetMapping
    public ResponseEntity<List<BookResponse>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        List<BookResponse> books = bookService.getAllBooks(page, size);
        return ResponseEntity.ok(books);
    }

    // POST - Tạo sách mới
    @PostMapping
    public ResponseEntity<BookResponse> createBook(
            @Valid @RequestBody CreateBookRequest request) {
        BookResponse bookResponse = bookService.createBook(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(bookResponse);
    }

    // GET - Lấy sách theo ID
    @GetMapping("/{id}")
    public ResponseEntity<BookResponse> getBookById(@PathVariable Long id) {
        BookResponse book = bookService.getBookById(id);
        return ResponseEntity.ok(book);
    }

    // PUT - Cập nhật sách
    @PutMapping("/{id}")
    public ResponseEntity<BookResponse> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBookRequest request) {
        BookResponse bookResponse = bookService.updateBook(id, request);
        return ResponseEntity.ok(bookResponse);
    }

    // DELETE - Xóa sách
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.noContent().build();
    }
}
```

**Best Practices:**

- Chỉ chứa logic điều hướng request
- Không xử lý logic nghiệp vụ
- Sử dụng `@RequestBody`, `@PathVariable`, `@RequestParam` để nhận dữ liệu
- Trả về `ResponseEntity` với status code phù hợp
- Validate request sử dụng `@Valid`

---

### 2️⃣ **Service Layer** (Tầng Nghiệp Vụ)

**Mục đích:** Chứa toàn bộ logic nghiệp vụ của ứng dụng.

**Cấu trúc:**

- **Service Interface** - Định nghĩa các method
- **ServiceImpl** - Triển khai logic

**Ví dụ - BookService (Interface):**

```java
public interface BookService {
    List<BookResponse> getAllBooks(int page, int size);
    BookResponse getBookById(Long id);
    BookResponse createBook(CreateBookRequest request);
    BookResponse updateBook(Long id, UpdateBookRequest request);
    void deleteBook(Long id);
    List<BookResponse> searchBooks(String keyword);
}
```

**Ví dụ - BookServiceImpl (Implementation):**

```java
@Service
public class BookServiceImpl implements BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private BookMapper bookMapper;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Override
    public List<BookResponse> getAllBooks(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Book> books = bookRepository.findAll(pageable);
        return books.map(bookMapper::toResponse).toList();
    }

    @Override
    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new BookException("Sách không tồn tại"));
        return bookMapper.toResponse(book);
    }

    @Transactional
    @Override
    public BookResponse createBook(CreateBookRequest request) {
        // Validate dữ liệu
        if (bookRepository.existsByTitle(request.getTitle())) {
            throw new BookException("Tiêu đề sách đã tồn tại");
        }

        // Lấy Genre
        Genre genre = genreRepository.findById(request.getGenreId())
            .orElseThrow(() -> new BookException("Thể loại không tồn tại"));

        // Lấy Author
        Author author = authorRepository.findById(request.getAuthorId())
            .orElseThrow(() -> new BookException("Tác giả không tồn tại"));

        // Tạo Book
        Book book = new Book();
        book.setTitle(request.getTitle());
        book.setDescription(request.getDescription());
        book.setGenre(genre);
        book.setAuthor(author);
        book.setIsbn(request.getIsbn());
        book.setPublishedYear(request.getPublishedYear());

        Book savedBook = bookRepository.save(book);
        return bookMapper.toResponse(savedBook);
    }

    @Transactional
    @Override
    public BookResponse updateBook(Long id, UpdateBookRequest request) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new BookException("Sách không tồn tại"));

        book.setTitle(request.getTitle());
        book.setDescription(request.getDescription());

        if (request.getGenreId() != null) {
            Genre genre = genreRepository.findById(request.getGenreId())
                .orElseThrow(() -> new BookException("Thể loại không tồn tại"));
            book.setGenre(genre);
        }

        Book updatedBook = bookRepository.save(book);
        return bookMapper.toResponse(updatedBook);
    }

    @Transactional
    @Override
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new BookException("Sách không tồn tại"));
        bookRepository.delete(book);
    }

    @Override
    public List<BookResponse> searchBooks(String keyword) {
        List<Book> books = bookRepository.searchByKeyword(keyword);
        return books.map(bookMapper::toResponse).toList();
    }
}
```

**Best Practices:**

- Luôn tạo Interface cho Service
- Sử dụng `@Service`, `@Transactional` decorators
- Chứa toàn bộ logic xử lý dữ liệu
- Gọi Repository để lấy dữ liệu
- Sử dụng Mapper để chuyển Entity ↔ DTO
- Throw Exception khi có lỗi

---

### 3️⃣ **Repository Layer** (Tầng Truy Cập Dữ Liệu)

**Mục đích:** Giao tiếp với cơ sở dữ liệu thông qua Spring Data JPA.

**Trách nhiệm:**

- Chỉ chứa các method query đơn giản
- Không chứa logic nghiệp vụ
- Kế thừa từ `JpaRepository`

**Ví dụ:**

```java
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    // Query method tự động tạo SQL
    List<Book> findByGenre(Genre genre);
    List<Book> findByAuthor(Author author);
    boolean existsByTitle(String title);
    boolean existsByIsbn(String isbn);

    // Custom Query
    @Query("SELECT b FROM Book b WHERE b.title LIKE CONCAT('%', :keyword, '%') " +
           "OR b.description LIKE CONCAT('%', :keyword, '%')")
    List<Book> searchByKeyword(@Param("keyword") String keyword);

    // Pagination
    Page<Book> findByGenreOrderByCreatedAtDesc(Genre genre, Pageable pageable);
}
```

**Best Practices:**

- Kế thừa `JpaRepository<Entity, ID>`
- Không chứa logic xử lý
- Sử dụng Query Methods convention
- Sử dụng `@Query` cho các truy vấn phức tạp
- Hỗ trợ Pagination và Sorting

---

### 4️⃣ **Domain Layer** (Entities / Models)

**Mục đích:** Định nghĩa các Entity ánh xạ với bảng trong database.

**Ví dụ:**

```java
@Entity
@Table(name = "books")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String title;

    @Column(columnDefinition = "LONGTEXT")
    private String description;

    @Column(unique = true)
    private String isbn;

    private Integer publishedYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "genre_id")
    private Genre genre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    private Author author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "publisher_id")
    private Publisher publisher;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP")
    private LocalDateTime updatedAt;

    @Column(name = "is_deleted", columnDefinition = "boolean DEFAULT false")
    private Boolean isDeleted = false;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

**Best Practices:**

- Sử dụng JPA Annotations
- Sử dụng Lombok (`@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`)
- Định nghĩa Relationships (`@ManyToOne`, `@OneToMany`, `@ManyToMany`)
- Sử dụng `FetchType.LAZY` để tránh N+1 query
- Thêm `createdAt`, `updatedAt`, `isDeleted` fields

---

### 5️⃣ **DTO & Payload Layer**

**Mục đích:** Truyền dữ liệu giữa tầng Presentation và Service, tránh lộ cấu trúc Entity.

**Cấu trúc:**

- **Request DTOs** - Nhận dữ liệu từ client
- **Response DTOs** - Trả dữ liệu về cho client
- **Common DTOs** - Dùng chung

**Ví dụ - Request DTO:**

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    @NotBlank(message = "ISBN không được để trống")
    @Pattern(regexp = "^[0-9-]{10,17}$", message = "ISBN không hợp lệ")
    private String isbn;

    @NotNull(message = "Năm xuất bản không được để trống")
    @Min(value = 1000, message = "Năm xuất bản phải từ 1000")
    @Max(value = 2100, message = "Năm xuất bản không hợp lệ")
    private Integer publishedYear;

    @NotNull(message = "Thể loại không được để trống")
    private Long genreId;

    @NotNull(message = "Tác giả không được để trống")
    private Long authorId;

    @NotNull(message = "Nhà xuất bản không được để trống")
    private Long publisherId;
}
```

**Ví dụ - Response DTO:**

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookResponse {

    private Long id;
    private String title;
    private String description;
    private String isbn;
    private Integer publishedYear;

    private GenreResponse genre;
    private AuthorResponse author;
    private PublisherResponse publisher;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

**Best Practices:**

- Sử dụng Validation Annotations (`@NotNull`, `@NotBlank`, `@Pattern`, v.v.)
- Tách Request và Response DTOs rõ ràng
- Không chứa toàn bộ Entity fields
- Chỉ include fields cần thiết cho client

---

### 6️⃣ **Mapper Layer** (Entity ↔ DTO Conversion)

**Mục đích:** Chuyển đổi giữa Entity và DTO, tách biệt hoàn toàn tầng dữ liệu từ tầng trình bày.

**Ví dụ:**

```java
@Component
public class BookMapper {

    @Autowired
    private GenreMapper genreMapper;

    @Autowired
    private AuthorMapper authorMapper;

    @Autowired
    private PublisherMapper publisherMapper;

    // Entity → Response DTO
    public BookResponse toResponse(Book book) {
        if (book == null) {
            return null;
        }

        return BookResponse.builder()
            .id(book.getId())
            .title(book.getTitle())
            .description(book.getDescription())
            .isbn(book.getIsbn())
            .publishedYear(book.getPublishedYear())
            .genre(genreMapper.toResponse(book.getGenre()))
            .author(authorMapper.toResponse(book.getAuthor()))
            .publisher(publisherMapper.toResponse(book.getPublisher()))
            .createdAt(book.getCreatedAt())
            .updatedAt(book.getUpdatedAt())
            .build();
    }

    // Request DTO → Entity
    public Book toEntity(CreateBookRequest request) {
        if (request == null) {
            return null;
        }

        return Book.builder()
            .title(request.getTitle())
            .description(request.getDescription())
            .isbn(request.getIsbn())
            .publishedYear(request.getPublishedYear())
            .build();
    }

    // List convert
    public List<BookResponse> toResponseList(List<Book> books) {
        return books.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }
}
```

**Best Practices:**

- Tạo một Mapper cho mỗi Entity
- Sử dụng Builder pattern cho clarity
- Handle null values
- Sử dụng `stream()` cho List conversion

---

### 7️⃣ **Configuration Layer** (Cấu Hình Hệ Thống)

**Mục đích:** Tập trung toàn bộ cấu hình hệ thống.

**Các config chính:**

**SecurityConfig.java** - Cấu hình bảo mật:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors()
            .and()
            .csrf().disable()
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/books/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(new JwtAuthenticationFilter(),
                             UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
```

**JwtProvider.java** - Quản lý JWT tokens:

```java
@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationMs;

    public String generateToken(String username) {
        return Jwts.builder()
            .setSubject(username)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationMs))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
            .setSigningKey(jwtSecret)
            .parseClaimsJws(token)
            .getBody()
            .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

---

### 8️⃣ **Security Layer** (Xác Thực & Phân Quyền)

**Mục đích:** Xử lý xác thực JWT, kiểm tra token, phân quyền theo vai trò.

**JwtAuthenticationFilter.java:**

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtProvider jwtProvider;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                   HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (jwt != null && jwtProvider.validateToken(jwt)) {
                String username = jwtProvider.getUsernameFromToken(jwt);

                // Tạo Authentication object
                UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                        username, null, new ArrayList<>()
                    );

                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        } catch (Exception ex) {
            logger.error("Could not set user authentication", ex);
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
```

---

### 9️⃣ **Exception Layer** (Xử Lý Lỗi Tập Trung)

**Mục đích:** Bắt và xử lý lỗi thống nhất, trả về thông báo rõ ràng cho client.

**Custom Exceptions:**

```java
public class BookException extends RuntimeException {
    public BookException(String message) {
        super(message);
    }
}

public class UserException extends RuntimeException {
    public UserException(String message) {
        super(message);
    }
}
```

**GlobalExceptionHandler.java:**

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BookException.class)
    public ResponseEntity<ErrorResponse> handleBookException(BookException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.NOT_FOUND.value())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UserException.class)
    public ResponseEntity<ErrorResponse> handleUserException(UserException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.CONFLICT.value())
            .message(ex.getMessage())
            .timestamp(LocalDateTime.now())
            .build();
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(FieldError::getDefaultMessage)
            .toList();

        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.BAD_REQUEST.value())
            .message("Validation failed")
            .errors(errors)
            .timestamp(LocalDateTime.now())
            .build();
        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(Exception ex) {
        ErrorResponse error = ErrorResponse.builder()
            .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
            .message("Internal server error")
            .timestamp(LocalDateTime.now())
            .build();
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

**ErrorResponse DTO:**

```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    private int status;
    private String message;
    private List<String> errors;
    private LocalDateTime timestamp;
}
```

---

## 🔄 Luồng Request-Response Điển Hình

```
1. Client gửi Request
   ↓
2. Controller nhận request
   ↓
3. Validation (@Valid)
   ↓
4. Controller gọi Service
   ↓
5. Service xử lý logic
   ├── Gọi Repository lấy dữ liệu
   ├── Xử lý business logic
   └── Throw Exception nếu có lỗi
   ↓
6. Service gọi Mapper (Entity → Response DTO)
   ↓
7. Controller trả về ResponseEntity
   ↓
8. Client nhận Response
```

---

## 📋 Checklist Khi Tạo Feature Mới

Khi tạo một feature mới, hãy tuân theo checklist này:

- [ ] **Step 1:** Tạo Request DTO trong `payload/request/`
- [ ] **Step 2:** Tạo Response DTO trong `payload/response/`
- [ ] **Step 3:** Tạo hoặc cập nhật Entity trong `domain/`
- [ ] **Step 4:** Tạo Repository trong `repository/` (kế thừa JpaRepository)
- [ ] **Step 5:** Tạo Mapper trong `mapper/`
- [ ] **Step 6:** Tạo Service Interface trong `service/`
- [ ] **Step 7:** Tạo ServiceImpl trong `service/impl/`
- [ ] **Step 8:** Tạo Controller trong `controller/`
- [ ] **Step 9:** Thêm Exception class nếu cần trong `exception/`
- [ ] **Step 10:** Test tất cả endpoints

---

## 🎯 Best Practices

### 1. Separation of Concerns

- Mỗi layer có trách nhiệm riêng biệt
- Controller chỉ xử lý HTTP
- Service xử lý logic
- Repository xử lý data

### 2. Data Transfer

- Luôn sử dụng DTOs thay vì Entity
- Không expose Entity trực tiếp
- Sử dụng Mapper để chuyển đổi

### 3. Error Handling

- Throw custom exceptions từ Service
- Handle tất cả exceptions trong GlobalExceptionHandler
- Trả về meaningful error messages

### 4. Database Transactions

- Sử dụng `@Transactional` cho các operations ghi dữ liệu
- Set `rollbackFor` cho custom exceptions

### 5. Security

- Validate tất cả inputs sử dụng annotations
- Sử dụng JWT cho authentication
- Check authorization trước xử lý

### 6. Performance

- Sử dụng FetchType.LAZY cho relationships
- Implement pagination cho list endpoints
- Use query optimization khi cần

---

## 📚 Dependencies Chính

```xml
<!-- Spring Boot Web -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <scope>provided</scope>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>

<!-- Validation -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

---

## 🚀 Phát Triển Tiếp Theo

- [ ] Thêm Unit Tests
- [ ] Thêm Integration Tests
- [ ] Caching layer (Redis)
- [ ] Logging system
- [ ] API Documentation (Swagger/OpenAPI)
- [ ] Rate limiting
- [ ] File upload/download
- [ ] Email notifications
