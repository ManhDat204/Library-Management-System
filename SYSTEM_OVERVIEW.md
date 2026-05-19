# 📚 Library Management System - Tổng Quan Hệ Thống Chi Tiết

**Dự án:** Library Management System  
**Loại:** Ứng dụng Full-Stack Web  
**Ngôn ngữ:** React + Spring Boot  
**Ngày tạo:** 2026  
**Trạng thái:** Đang phát triển

---

## 📑 Mục Lục

1. [Tổng Quan Hệ Thống](#-tổng-quan-hệ-thống)
2. [Kiến Trúc Tổng Thể](#-kiến-trúc-tổng-thể)
3. [Công Nghệ Sử Dụng](#-công-nghệ-sử-dụng)
4. [Cấu Trúc Frontend](#-cấu-trúc-frontend)
5. [Cấu Trúc Backend](#-cấu-trúc-backend)
6. [Mô Hình Dữ Liệu](#-mô-hình-dữ-liệu)
7. [Các Tính Năng Chính](#-các-tính-năng-chính)
8. [Luồng Xử Lý Chính](#-luồng-xử-lý-chính)
9. [API Endpoints](#-api-endpoints)
10. [Hướng Dẫn Setup & Deploy](#-hướng-dẫn-setup--deploy)
11. [Quy Trình Bảo Mật](#-quy-trình-bảo-mật)
12. [Thống Kê Dự Án](#-thống-kê-dự-án)

---

## 🎯 Tổng Quan Hệ Thống

### Mô Tả Dự Án

**Library Management System** là một nền tảng quản lý thư viện toàn diện, cho phép quản lý sách, người dùng, mượn/trả sách, và hệ thống thanh toán. Hệ thống hỗ trợ cả người dùng bình thường (đọc sách, mượn sách) và quản trị viên (quản lý thư viện).

### Người Dùng Chính

1. **Quản Trị Viên (Admin)**
   - Quản lý kho sách, tác giả, nhà xuất bản, thể loại
   - Quản lý người dùng, phân quyền
   - Quản lý mượn/trả sách, xử lý tiền phạt
   - Theo dõi doanh thu, báo cáo thống kê
   - Quản lý gói đăng ký

2. **Người Dùng Thông Thường (User)**
   - Xem danh sách sách
   - Mượn sách, xem danh sách mượn
   - Đặt sách, quản lý danh sách yêu thích
   - Thanh toán tiền phạt
   - Đánh giá sách
   - Quản lý ví điện tử

### Tính Năng Nổi Bật

- ✅ Quản lý toàn diện kho sách
- ✅ Hệ thống mượn/trả tự động tính tiền phạt
- ✅ Thanh toán trực tuyến
- ✅ Ví điện tử
- ✅ Đặt sách trước (Reservation)
- ✅ Gói đăng ký linh hoạt
- ✅ Báo cáo thống kê chi tiết
- ✅ Upload ảnh bìa sách (Cloudinary)
- ✅ Xác thực JWT

---

## 🏗️ Kiến Trúc Tổng Thể

### Sơ Đồ Kiến Trúc

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Pages: Login, Dashboard, Admin Panel, User Pages   │  │
│  │  Components: Headers, Cards, Tables, Dialogs        │  │
│  │  Services: API calls (authorService, bookService)   │  │
│  │  State: Context API (Auth), Local state (hooks)     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────────────┘
                  │ HTTPS/REST API + JWT Token
┌─────────────────┴──────────────────────────────────────────┐
│              Backend (Spring Boot 4.0.0)                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Controllers: AuthController, BookController, etc    │  │
│  │ Services: AuthService, BookService, etc             │  │
│  │ Repositories: BookRepository, UserRepository, etc   │  │
│  │ Models: JPA Entities (User, Book, Author, etc)      │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Security: Spring Security, JWT, CORS                │  │
│  │ Validation: Bean Validation                         │  │
│  │ File Storage: Cloudinary Integration                │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────┬──────────────────────────────────────────┘
                  │ JDBC
┌─────────────────┴──────────────────────────────────────────┐
│                  Database (MySQL)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Tables: users, books, authors, genres, loans, etc   │  │
│  │ Relationships: FK constraints, Indexes               │  │
│  │ Data: Books, Authors, Users, Transactions           │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### Mô Hình 3 Tầng

```
Presentation Tier (Frontend)
    ↓
Business Logic Tier (Backend Services)
    ↓
Data Access Tier (Repositories + Database)
```

---

## 🛠️ Công Nghệ Sử Dụng

### Frontend Stack

| Công Nghệ             | Phiên Bản | Mục Đích                          |
| --------------------- | --------- | --------------------------------- |
| **React**             | 19.2.0    | UI Framework - xây dựng giao diện |
| **Vite**              | 7.3.1     | Build tool - biên dịch & HMR      |
| **React Router DOM**  | 7.13.1    | Routing - điều hướng trang        |
| **Tailwind CSS**      | 3.4.4     | Styling - CSS utility-first       |
| **Material-UI (MUI)** | 7.3.8     | UI Components - thành phần UI     |
| **Axios**             | 1.13.5    | HTTP Client - gọi API backend     |
| **Recharts**          | 3.7.0     | Data Visualization - biểu đồ      |
| **Lucide React**      | 0.577.0   | Icons - biểu tượng SVG            |
| **Emotion**           | 11.14.x   | CSS-in-JS - styling động          |
| **ESLint**            | 9.39.1    | Code Quality - kiểm tra code      |
| **PostCSS**           | 8.5.6     | CSS Processing - xử lý CSS        |
| **Autoprefixer**      | 10.4.24   | CSS Vendor Prefixes - tương thích |

**Cài đặt dependencies:**

```bash
cd frontend/library-frontend
pnpm install  # hoặc npm install
```

### Backend Stack

| Công Nghệ                | Phiên Bản | Mục Đích                           |
| ------------------------ | --------- | ---------------------------------- |
| **Java**                 | 21        | Ngôn ngữ lập trình                 |
| **Spring Boot**          | 4.0.0     | Framework chính                    |
| **Spring Data JPA**      | Latest    | ORM - truy cập database            |
| **Spring Security**      | Latest    | Authentication & Authorization     |
| **Spring WebSocket**     | Latest    | Real-time Communication            |
| **Spring Mail**          | Latest    | Email Service - gửi email          |
| **MySQL Connector**      | Latest    | JDBC Driver cho MySQL              |
| **JWT (JJWT)**           | 0.11.5    | Token-based Authentication         |
| **Lombok**               | Latest    | Code Generation - giảm boilerplate |
| **Cloudinary**           | 1.39.0    | Image Storage - lưu trữ ảnh        |
| **Spring OAuth2 Client** | Latest    | OAuth2 Integration                 |
| **Maven**                | Latest    | Build Tool - quản lý dependencies  |

**Cài đặt dependencies:**

```bash
cd LibraryManagementSystem
mvn clean install  # Tải dependencies & build
```

### Database

- **DBMS**: MySQL
- **Connection Pool**: HikariCP (built-in Spring Boot)
- **ORM**: Hibernate (JPA implementation)

---

## 📱 Cấu Trúc Frontend

### Cây Thư Mục Chi Tiết

```
frontend/library-frontend/
│
├── 📄 package.json           # Dependencies config
├── 📄 vite.config.js         # Vite build config
├── 📄 tailwind.config.js     # Tailwind CSS config
├── 📄 postcss.config.js      # PostCSS plugins
├── 📄 eslint.config.js       # ESLint rules
├── 📄 index.html             # Entry HTML file
├── 📄 pnpm-lock.yaml         # Dependency lock file
│
├── 📁 public/                # Static assets
│   └── [static files]
│
└── 📁 src/                   # Source code
    │
    ├── 📄 Main.jsx           # Root component
    ├── 📄 App.jsx            # App container + routes
    ├── 📄 index.css          # Global styles
    ├── 📄 App.css            # App-specific styles
    │
    ├── 📁 assets/            # Images, fonts, etc
    │   └── [media files]
    │
    ├── 📁 components/        # Reusable components
    │   ├── PageHeader.jsx
    │   └── 📁 common/
    │       ├── ConfirmDialog.jsx    # Confirm modal
    │       ├── Field.jsx             # Form field component
    │       ├── Pagination.jsx        # Pagination control
    │       ├── StatusBadge.jsx       # Status badge
    │       └── Toast.jsx             # Toast notification
    │
    ├── 📁 pages/             # Page-level components
    │   ├── Login.jsx         # Login page
    │   │
    │   ├── 📁 admin/         # Admin pages
    │   │   ├── AdminLayout.jsx           # Admin layout
    │   │   ├── Dashboard.jsx             # Admin dashboard
    │   │   ├── Reports.jsx               # Reports & Analytics ✨ NEW
    │   │   ├── Authors.jsx               # Manage authors
    │   │   ├── Books.jsx                 # Manage books
    │   │   ├── Genres.jsx                # Manage genres
    │   │   ├── Publishers.jsx            # Manage publishers
    │   │   ├── Users.jsx                 # Manage users
    │   │   ├── Loans.jsx                 # Manage loans
    │   │   ├── Fines.jsx                 # Manage fines
    │   │   ├── Subscriptions.jsx         # Manage subscriptions
    │   │   └── Subscriptionplans.jsx     # Manage plans
    │   │
    │   └── 📁 user/          # User pages
    │       ├── Layout.jsx              # User layout
    │       ├── HomePage.jsx            # Home page
    │       ├── Book.jsx                # Book listing
    │       ├── BookDetail.jsx          # Book details
    │       ├── Checkout.jsx            # Checkout page
    │       ├── Loan.jsx                # My loans
    │       ├── Loandetail.jsx          # Loan details
    │       ├── Reservations.jsx        # My reservations
    │       ├── Subscription.jsx        # Subscriptions
    │       ├── Wallet.jsx              # Wallet page
    │       ├── Wishlist.jsx            # Wishlist page
    │       ├── Profile.jsx             # User profile
    │       ├── Register.jsx            # Registration
    │       └── PaymentSuccess.jsx      # Payment success
    │
    ├── 📁 services/          # API service layer
    │   ├── api.js                   # Axios config + interceptor
    │   ├── authorService.js         # Author API calls
    │   ├── bookService.js           # Book API calls
    │   ├── fineService.js           # Fine API calls
    │   ├── genreService.js          # Genre API calls
    │   ├── loanService.js           # Loan API calls
    │   ├── publisherService.js      # Publisher API calls
    │   ├── subscriptionService.js   # Subscription API calls
    │   ├── subscriptionPlanService.js # Plan API calls
    │   ├── userService.js           # User API calls
    │   ├── reportService.js         # Reports API calls ✨ NEW
    │   ├── notificationService.js   # Notification service
    │   └── websocketService.js      # WebSocket service
    │
    ├── 📁 context/           # React Context
    │   └── AuthContext.jsx   # Authentication state
    │
    ├── 📁 hooks/             # Custom React hooks
    │   └── [custom hooks]
    │
    ├── 📁 routes/            # Route components
    │   └── ProtectedRoute.jsx # Route protection
    │
    ├── 📁 constants/         # Application constants
    │   └── loanStatus.js    # Loan status values
    │
    ├── 📁 utils/             # Utility functions
    │   ├── dateHelpers.js   # Date formatting
    │   ├── formatters.js    # Number/text formatting
    │   ├── statusHelpers.js # Status helpers
    │   └── tokenHelpers.js  # JWT token helpers
    │
    └── 📁 styles/           # CSS modules
        └── [style files]
```

### Quan Trọng: Services API Integration

**api.js** - Cấu hình Axios chính:

```javascript
- Base URL config
- JWT token interceptor
- Error handling
- CORS headers
```

**Các Services:**

- Mỗi service tương ứng với một phần của hệ thống
- Gọi các endpoint REST từ backend
- Format & transform dữ liệu từ API

---

## 🖥️ Cấu Trúc Backend

### Cây Thư Mục Chi Tiết

```
LibraryManagementSystem/
│
├── 📄 pom.xml                # Maven configuration
├── 📄 mvnw / mvnw.cmd        # Maven wrapper
│
├── 📁 src/main/java/com/dat/LibraryManagementSystem/
│   │
│   ├── 📄 LibraryManagementSystemApplication.java  # Main entry point
│   │
│   ├── 📁 controller/        # REST API Controllers (16 files)
│   │   ├── AuthController.java              # Auth endpoints
│   │   ├── UserController.java              # User CRUD
│   │   ├── BookController.java              # Book queries
│   │   ├── AdminBookController.java         # Admin book management
│   │   ├── AuthorController.java            # Author CRUD
│   │   ├── GenreController.java             # Genre CRUD
│   │   ├── PublisherController.java         # Publisher CRUD
│   │   ├── BookLoanController.java          # Loan endpoints
│   │   ├── ReservationController.java       # Reservation CRUD
│   │   ├── FineController.java              # Fine management
│   │   ├── PaymentController.java           # Payment processing
│   │   ├── WalletController.java            # Wallet endpoints
│   │   ├── SubscriptionController.java      # Subscription management
│   │   ├── SubscriptionPlanController.java  # Plan CRUD
│   │   ├── BookReviewController.java        # Review CRUD
│   │   ├── WishlistController.java          # Wishlist CRUD
│   │   ├── AddressController.java           # Address management
│   │   ├── CloudinaryController.java        # Image upload
│   │   └── ReportController.java            # Analytics/Reports ✨ NEW
│   │
│   ├── 📁 service/           # Business Logic Services (18+ files)
│   │   ├── AuthService.java
│   │   ├── UserService.java
│   │   ├── BookService.java
│   │   ├── AuthorService.java
│   │   ├── GenreService.java
│   │   ├── PublisherService.java
│   │   ├── BookLoanService.java
│   │   ├── ReservationService.java
│   │   ├── FineService.java
│   │   ├── PaymentService.java
│   │   ├── WalletService.java
│   │   ├── SubscriptionService.java
│   │   ├── SubscriptionPlanService.java
│   │   ├── BookReviewService.java
│   │   ├── WishlistService.java
│   │   ├── AddressService.java
│   │   ├── CloudinaryService.java
│   │   ├── EmailService.java
│   │   ├── ReportService.java               # Reports/Analytics ✨ NEW
│   │   └── 📁 impl/          # Implementation classes
│   │
│   ├── 📁 model/             # JPA Entity Models (17 entities)
│   │   ├── User.java                    # User entity
│   │   ├── Book.java                    # Book entity
│   │   ├── Author.java                  # Author entity
│   │   ├── Genre.java                   # Genre entity
│   │   ├── Publisher.java               # Publisher entity
│   │   ├── BookLoan.java                # Loan record
│   │   ├── Reservation.java             # Reservation
│   │   ├── Fine.java                    # Fine record
│   │   ├── Payment.java                 # Payment record
│   │   ├── Wallet.java                  # Wallet entity
│   │   ├── WalletTransaction.java       # Wallet transactions
│   │   ├── Subscription.java            # User subscription
│   │   ├── SubscriptionPlan.java        # Plan template
│   │   ├── BookReview.java              # Book review
│   │   ├── Wishlist.java                # Wishlist item
│   │   ├── Address.java                 # Address entity
│   │   └── PasswordResetToken.java      # Password reset token
│   │
│   ├── 📁 repository/        # Spring Data JPA Repositories
│   │   ├── UserRepository.java
│   │   ├── BookRepository.java
│   │   ├── AuthorRepository.java
│   │   ├── GenreRepository.java
│   │   ├── PublisherRepository.java
│   │   ├── BookLoanRepository.java
│   │   ├── ReservationRepository.java
│   │   ├── FineRepository.java
│   │   ├── PaymentRepository.java
│   │   ├── WalletRepository.java
│   │   ├── WalletTransactionRepository.java
│   │   ├── SubscriptionRepository.java
│   │   ├── SubscriptionPlanRepository.java
│   │   ├── BookReviewRepository.java
│   │   ├── WishlistRepository.java
│   │   ├── AddressRepository.java
│   │   ├── PasswordResetTokenRepository.java
│   │   └── ReportRepository.java         # Reports queries ✨ NEW
│   │
│   ├── 📁 payload/           # DTOs (Request/Response)
│   │   ├── LoginRequest.java
│   │   ├── RegisterRequest.java
│   │   ├── UserDTO.java
│   │   ├── BookDTO.java
│   │   ├── AuthorDTO.java
│   │   ├── LoanDTO.java
│   │   ├── FineDTO.java
│   │   ├── PaymentRequest.java
│   │   ├── ReportDTO.java               # Report DTOs ✨ NEW
│   │   └── [other DTOs]
│   │
│   ├── 📁 mapper/            # Entity-DTO Mappers
│   │   ├── UserMapper.java
│   │   ├── BookMapper.java
│   │   └── [other mappers]
│   │
│   ├── 📁 exception/         # Custom Exceptions
│   │   ├── ResourceNotFoundException.java
│   │   ├── UnauthorizedException.java
│   │   ├── ValidationException.java
│   │   └── [other exceptions]
│   │
│   ├── 📁 Configrations/     # Spring Configurations (5+ files)
│   │   ├── SecurityConfig.java          # Spring Security
│   │   ├── JwtConfig.java               # JWT configuration
│   │   ├── CorsConfig.java              # CORS settings
│   │   ├── WebSocketConfig.java         # WebSocket setup
│   │   └── [other configs]
│   │
│   ├── 📁 domain/            # Domain classes
│   │   └── [domain objects]
│   │
│   └── 📁 utils/             # Utility classes
│       └── [utility classes]
│
├── 📁 src/main/resources/
│   ├── 📄 application.properties  # Spring Boot config
│   ├── 📁 static/               # Static files (CSS, JS)
│   └── 📁 templates/            # HTML templates
│
├── 📁 src/test/                 # Test files
│   └── java/com/dat/LibraryManagementSystem/
│       └── LibraryManagementSystemApplicationTests.java
│
└── 📁 target/                   # Build output (auto-generated)
    ├── classes/
    ├── generated-sources/
    └── maven-compiler-plugin/
```

### Application Properties

**application.properties** - Cấu hình chính:

```properties
# Server
server.port=8080
server.servlet.context-path=/api

# Database (MySQL)
spring.datasource.url=jdbc:mysql://localhost:3306/library_db
spring.datasource.username=root
spring.datasource.password=password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT
jwt.secret=your_secret_key_here
jwt.expiration=86400000 # 24 hours

# Cloudinary
cloudinary.cloud-name=your_cloud_name
cloudinary.api-key=your_api_key
cloudinary.api-secret=your_api_secret

# Email (for notifications)
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email
spring.mail.password=your_password
```

---

## 📊 Mô Hình Dữ Liệu

### Entity Relationships

```
User (1) ─────────────────(M) BookLoan
  │                           │
  │                           ├─ Book (M)
  │                           ├─ Fine (M)
  │                           └─ Payment (M)
  │
  ├─ Address (1)
  ├─ Wallet (1) ────────────(M) WalletTransaction
  ├─ Subscription (M) ─────────(1) SubscriptionPlan
  ├─ Reservation (M)
  ├─ Wishlist (M)
  └─ BookReview (M)

Book (1) ───────────────────(M) BookLoan
  │                             │
  │                             └─ User (M)
  │
  ├─ Author (M)
  ├─ Genre (M)
  ├─ Publisher (M)
  ├─ BookReview (M)
  └─ Reservation (M)
```

### Các Entities Chính

| Entity                 | Mô Tả                               |
| ---------------------- | ----------------------------------- |
| **User**               | Thông tin người dùng, auth, role    |
| **Book**               | Thông tin sách, ISBN, số lượng, giá |
| **Author**             | Tác giả sách                        |
| **Genre**              | Thể loại/danh mục sách              |
| **Publisher**          | Nhà xuất bản                        |
| **BookLoan**           | Ghi nhận mượn sách (ngày mượn, trả) |
| **Reservation**        | Đặt sách trước                      |
| **Fine**               | Tiền phạt (mượn quá hạn, sách hỏng) |
| **Payment**            | Ghi nhận thanh toán tiền phạt       |
| **Wallet**             | Ví điện tử (số dư)                  |
| **WalletTransaction**  | Lịch sử giao dịch ví                |
| **Subscription**       | Gói đăng ký của người dùng          |
| **SubscriptionPlan**   | Định nghĩa các gói đăng ký          |
| **BookReview**         | Đánh giá sách từ người dùng         |
| **Wishlist**           | Danh sách yêu thích                 |
| **Address**            | Địa chỉ người dùng                  |
| **PasswordResetToken** | Token reset mật khẩu                |

### Các Trường Chính

**User (Người Dùng)**

- id, email, password, fullName, phone
- avatar, role (ADMIN, USER)
- isActive, isLocked, createdAt, updatedAt

**Book (Sách)**

- id, title, isbn, quantity, availableQuantity
- author, genre, publisher
- price, coverImage, description
- publishedDate, createdAt, updatedAt

**BookLoan (Mượn Sách)**

- id, user, book, loanDate, dueDate, returnDate
- status (ACTIVE, RETURNED, OVERDUE)
- actualReturnDate, createdAt

**Fine (Tiền Phạt)**

- id, user, bookLoan
- fineAmount, reason (OVERDUE, LOST, DAMAGED)
- status (PENDING, PAID)
- createdAt, paidDate

**Wallet (Ví Điện Tử)**

- id, user, balance
- lastTransaction, createdAt, updatedAt

**Subscription (Gói Đăng Ký)**

- id, user, subscriptionPlan
- startDate, endDate, status (ACTIVE, EXPIRED, CANCELLED)

---

## ✨ Các Tính Năng Chính

### 1. Xác Thực & Phân Quyền (Authentication & Authorization)

**Tính năng:**

- Đăng nhập/Đăng ký bằng email & mật khẩu
- JWT token-based authentication
- Role-based access control (Admin/User)
- Forget password & reset password via email
- Khóa/mở khóa tài khoản người dùng

**Endpoints:**

```
POST   /api/auth/login          # Đăng nhập
POST   /api/auth/register       # Đăng ký
POST   /api/auth/forgot-password # Quên mật khẩu
POST   /api/auth/reset-password # Đặt lại mật khẩu
POST   /api/auth/refresh-token  # Refresh JWT token
```

### 2. Quản Lý Sách (Book Management)

**Tính năng:**

- Thêm/Sửa/Xóa sách (Admin)
- Xem danh sách sách với bộ lọc
- Tìm kiếm sách theo tiêu đề, tác giả, thể loại
- Upload ảnh bìa (Cloudinary)
- Quản lý số lượng sách

**Endpoints:**

```
GET    /api/books               # Danh sách sách
GET    /api/books/{id}          # Chi tiết sách
POST   /api/admin/books         # Thêm sách (Admin)
PUT    /api/admin/books/{id}    # Sửa sách (Admin)
DELETE /api/admin/books/{id}    # Xóa sách (Admin)
GET    /api/books/search?q=...  # Tìm kiếm
```

### 3. Hệ Thống Mượn/Trả Sách (Loan Management)

**Tính năng:**

- Mượn sách (tạo loan)
- Trả sách (cập nhật status)
- Tự động tính tiền phạt quá hạn
- Theo dõi sách mượn hiện tại
- Lịch sử mượn sách

**Luồng:**

1. Người dùng chọn sách → Tạo BookLoan (status: ACTIVE)
2. Hệ thống ghi nhận loanDate, tính dueDate
3. Khi trả sách → cập nhật returnDate, status: RETURNED
4. Nếu trả quá hạn → tạo Fine record

**Endpoints:**

```
POST   /api/loans               # Mượn sách
GET    /api/loans               # Danh sách mượn
PUT    /api/loans/{id}/return   # Trả sách
GET    /api/loans/{id}          # Chi tiết mượn
```

### 4. Hệ Thống Tiền Phạt (Fine Management)

**Tính năng:**

- Tính tiền phạt tự động (theo quy định)
- Thanh toán tiền phạt trực tuyến
- Báo cáo tiền phạt chưa thanh toán
- Xem lịch sử phạt

**Luật tính phạt:**

```
- Quá hạn: 5,000 VND/ngày
- Sách hỏng: 20% giá sách
- Sách mất: 100% giá sách
```

**Endpoints:**

```
GET    /api/fines               # Danh sách phạt
POST   /api/fines/{id}/pay      # Thanh toán phạt
GET    /api/fines/user/{userId} # Phạt của user
```

### 5. Thanh Toán (Payment Processing)

**Tính năng:**

- Thanh toán tiền phạt
- Nạp tiền ví
- Sử dụng ví để thanh toán
- Hỗ trợ nhiều phương thức (Visa, Mastercard, etc.)

**Endpoints:**

```
POST   /api/payments            # Tạo payment
GET    /api/payments/{id}       # Trạng thái payment
POST   /api/payments/callback   # Webhook callback
```

### 6. Ví Điện Tử (Wallet)

**Tính năng:**

- Xem số dư ví
- Nạp tiền
- Sử dụng ví thanh toán
- Lịch sử giao dịch

**Endpoints:**

```
GET    /api/wallet              # Thông tin ví
POST   /api/wallet/topup        # Nạp tiền
GET    /api/wallet/transactions # Lịch sử
```

### 7. Đặt Sách (Reservation)

**Tính năng:**

- Đặt sách nếu hết
- Hủy đặt sách
- Thông báo khi sách có sẵn
- Xem danh sách đặt

**Endpoints:**

```
POST   /api/reservations        # Đặt sách
DELETE /api/reservations/{id}   # Hủy đặt
GET    /api/reservations        # Danh sách đặt
```

### 8. Gói Đăng Ký (Subscription)

**Tính năng:**

- Các gói đăng ký (Basic, Premium, VIP)
- Nâng cấp gói
- Quản lý thời hạn gói
- Lợi ích: mượn nhiều sách hơn, thời hạn lâu hơn, phí thấp hơn

**Endpoints:**

```
GET    /api/subscription-plans  # Danh sách gói
POST   /api/subscriptions       # Đăng ký
PUT    /api/subscriptions/{id}  # Nâng cấp
```

### 9. Đánh Giá Sách (Book Review)

**Tính năng:**

- Đánh giá sách (1-5 sao)
- Viết bình luận
- Xem đánh giá từ người khác
- Xóa/sửa đánh giá

**Endpoints:**

```
POST   /api/reviews             # Thêm đánh giá
GET    /api/books/{id}/reviews  # Danh sách đánh giá
DELETE /api/reviews/{id}        # Xóa đánh giá
```

### 10. Danh Sách Yêu Thích (Wishlist)

**Tính năng:**

- Thêm sách vào yêu thích
- Xóa khỏi yêu thích
- Xem danh sách yêu thích

**Endpoints:**

```
POST   /api/wishlist            # Thêm
DELETE /api/wishlist/{bookId}   # Xóa
GET    /api/wishlist            # Danh sách
```

### 11. Báo Cáo & Thống Kê (Reports & Analytics) ✨

**Tính năng:**

- Thống kê doanh thu
- Phân tích người dùng
- Báo cáo sách
- Phân tích mượn sách
- Báo cáo tiền phạt
- Thống kê gói đăng ký
- Export báo cáo (Excel/PDF)

**Endpoints:**

```
GET    /api/reports/revenue           # Doanh thu
GET    /api/reports/users-analytics   # Phân tích user
GET    /api/reports/books-analytics   # Phân tích sách
GET    /api/reports/loans-analytics   # Phân tích mượn
GET    /api/reports/fines-analytics   # Phân tích phạt
GET    /api/reports/subscriptions     # Phân tích gói
POST   /api/reports/export            # Export báo cáo
```

---

## 🔄 Luồng Xử Lý Chính

### Luồng Đăng Nhập

```
1. User nhập email & password
2. Frontend gửi POST /api/auth/login
3. Backend validate thông tin
4. Kiểm tra password hash (bcrypt)
5. Nếu đúng → tạo JWT token
6. Return token cho Frontend
7. Frontend lưu token vào localStorage
8. Các request sau gửi kèm token trong header
9. Backend xác thực token → cho phép access
```

### Luồng Mượn Sách

```
1. User chọn sách từ danh sách
2. Click nút "Mượn Sách"
3. Frontend gửi POST /api/loans
4. Backend kiểm tra:
   - Sách có còn không?
   - User có bị khóa không?
   - User có phạt chưa trả không?
5. Nếu hợp lệ:
   - Tạo BookLoan record
   - Giảm availableQuantity
   - Gửi email xác nhận
6. Frontend cập nhật UI
```

### Luồng Trả Sách & Tính Phạt

```
1. User trả sách tại quầy
2. Admin scan sách hoặc tìm loan
3. Click "Trả Sách" trong hệ thống
4. Backend:
   - Cập nhật returnDate = ngày hôm nay
   - Cập nhật status = RETURNED
   - Tăng availableQuantity
5. Kiểm tra nếu overdue:
   - Tính số ngày quá hạn
   - Tạo Fine record
   - Gửi email thông báo
6. Admin thấy thông báo phạt
```

### Luồng Thanh Toán Tiền Phạt

```
1. User xem danh sách phạt chưa trả
2. Click "Thanh Toán"
3. Chọn phương thức thanh toán
4. Nếu dùng ví:
   - Kiểm tra số dư ví
   - Trừ từ ví
   - Cập nhật Payment status = PAID
5. Nếu card:
   - Redirect đến payment gateway
   - Xử lý callback từ gateway
   - Cập nhật status = PAID
6. Gửi email xác nhận
```

---

## 🌐 API Endpoints

### Authentication (AuthController)

| Method | Endpoint                    | Mô Tả                   |
| ------ | --------------------------- | ----------------------- |
| POST   | `/api/auth/login`           | Đăng nhập               |
| POST   | `/api/auth/register`        | Đăng ký                 |
| POST   | `/api/auth/forgot-password` | Quên mật khẩu           |
| POST   | `/api/auth/reset-password`  | Đặt lại mật khẩu        |
| POST   | `/api/auth/refresh-token`   | Refresh JWT token       |
| GET    | `/api/auth/me`              | Thông tin user hiện tại |

### Book Management (BookController, AdminBookController)

| Method | Endpoint                       | Mô Tả              |
| ------ | ------------------------------ | ------------------ |
| GET    | `/api/books`                   | Danh sách sách     |
| GET    | `/api/books/{id}`              | Chi tiết sách      |
| GET    | `/api/books/search`            | Tìm kiếm sách      |
| POST   | `/api/admin/books`             | Thêm sách          |
| PUT    | `/api/admin/books/{id}`        | Sửa thông tin sách |
| DELETE | `/api/admin/books/{id}`        | Xóa sách           |
| GET    | `/api/books/genre/{genreId}`   | Sách theo thể loại |
| GET    | `/api/books/author/{authorId}` | Sách theo tác giả  |

### Loan Management (BookLoanController)

| Method | Endpoint                   | Mô Tả          |
| ------ | -------------------------- | -------------- |
| POST   | `/api/loans`               | Mượn sách      |
| GET    | `/api/loans`               | Danh sách mượn |
| GET    | `/api/loans/{id}`          | Chi tiết mượn  |
| PUT    | `/api/loans/{id}/return`   | Trả sách       |
| GET    | `/api/loans/user/{userId}` | Mượn của user  |
| GET    | `/api/loans/overdue`       | Sách quá hạn   |

### Fine Management (FineController)

| Method | Endpoint                   | Mô Tả           |
| ------ | -------------------------- | --------------- |
| GET    | `/api/fines`               | Danh sách phạt  |
| GET    | `/api/fines/{id}`          | Chi tiết phạt   |
| GET    | `/api/fines/user/{userId}` | Phạt của user   |
| POST   | `/api/fines/{id}/pay`      | Thanh toán phạt |
| GET    | `/api/fines/pending`       | Phạt chưa trả   |

### Payment (PaymentController)

| Method | Endpoint                      | Mô Tả              |
| ------ | ----------------------------- | ------------------ |
| POST   | `/api/payments`               | Tạo payment        |
| GET    | `/api/payments/{id}`          | Trạng thái payment |
| POST   | `/api/payments/callback`      | Webhook callback   |
| GET    | `/api/payments/user/{userId}` | Payment của user   |

### Wallet (WalletController)

| Method | Endpoint                   | Mô Tả             |
| ------ | -------------------------- | ----------------- |
| GET    | `/api/wallet`              | Thông tin ví      |
| POST   | `/api/wallet/topup`        | Nạp tiền          |
| GET    | `/api/wallet/transactions` | Lịch sử giao dịch |
| GET    | `/api/wallet/balance`      | Số dư             |

### User Management (UserController)

| Method | Endpoint                  | Mô Tả             |
| ------ | ------------------------- | ----------------- |
| GET    | `/api/users`              | Danh sách user    |
| GET    | `/api/users/{id}`         | Chi tiết user     |
| PUT    | `/api/users/{id}`         | Cập nhật user     |
| DELETE | `/api/users/{id}`         | Xóa user          |
| PUT    | `/api/users/{id}/lock`    | Khóa tài khoản    |
| PUT    | `/api/users/{id}/unlock`  | Mở khóa tài khoản |
| GET    | `/api/admin/users/locked` | Danh sách khóa    |

### Author Management (AuthorController)

| Method | Endpoint            | Mô Tả             |
| ------ | ------------------- | ----------------- |
| GET    | `/api/authors`      | Danh sách tác giả |
| GET    | `/api/authors/{id}` | Chi tiết tác giả  |
| POST   | `/api/authors`      | Thêm tác giả      |
| PUT    | `/api/authors/{id}` | Sửa tác giả       |
| DELETE | `/api/authors/{id}` | Xóa tác giả       |

### Genre Management (GenreController)

| Method | Endpoint           | Mô Tả              |
| ------ | ------------------ | ------------------ |
| GET    | `/api/genres`      | Danh sách thể loại |
| GET    | `/api/genres/{id}` | Chi tiết thể loại  |
| POST   | `/api/genres`      | Thêm thể loại      |
| PUT    | `/api/genres/{id}` | Sửa thể loại       |
| DELETE | `/api/genres/{id}` | Xóa thể loại       |

### Publisher Management (PublisherController)

| Method | Endpoint               | Mô Tả         |
| ------ | ---------------------- | ------------- |
| GET    | `/api/publishers`      | Danh sách NXB |
| GET    | `/api/publishers/{id}` | Chi tiết NXB  |
| POST   | `/api/publishers`      | Thêm NXB      |
| PUT    | `/api/publishers/{id}` | Sửa NXB       |
| DELETE | `/api/publishers/{id}` | Xóa NXB       |

### Subscription (SubscriptionController)

| Method | Endpoint                  | Mô Tả         |
| ------ | ------------------------- | ------------- |
| GET    | `/api/subscriptions`      | Danh sách gói |
| GET    | `/api/subscriptions/{id}` | Chi tiết gói  |
| POST   | `/api/subscriptions`      | Đăng ký gói   |
| PUT    | `/api/subscriptions/{id}` | Nâng cấp gói  |
| DELETE | `/api/subscriptions/{id}` | Hủy gói       |

### Reports (ReportController) ✨

| Method | Endpoint                       | Mô Tả          |
| ------ | ------------------------------ | -------------- |
| GET    | `/api/reports/revenue`         | Doanh thu      |
| GET    | `/api/reports/users-analytics` | Phân tích user |
| GET    | `/api/reports/books-analytics` | Phân tích sách |
| GET    | `/api/reports/loans-analytics` | Phân tích mượn |
| GET    | `/api/reports/fines-analytics` | Phân tích phạt |
| GET    | `/api/reports/subscriptions`   | Phân tích gói  |
| POST   | `/api/reports/export`          | Export báo cáo |

---

## 🚀 Hướng Dẫn Setup & Deploy

### Prerequisites (Yêu Cầu)

**Backend:**

- Java 21+
- Maven 3.8+
- MySQL 8.0+
- Postman (optional, để test API)

**Frontend:**

- Node.js 18+
- pnpm 9+ (hoặc npm)

**External Services:**

- Cloudinary (image storage)
- Email SMTP server (Gmail hoặc Mailgun)
- Payment gateway (Stripe, PayPal, etc.)

### Backend Setup

**1. Clone repository và install dependencies:**

```bash
cd LibraryManagementSystem
mvn clean install
```

**2. Cấu hình Database:**

```bash
# Tạo database MySQL
mysql -u root -p
> CREATE DATABASE library_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> EXIT;
```

**3. Cấu hình application.properties:**

```properties
# File: src/main/resources/application.properties

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/library_db
spring.datasource.username=root
spring.datasource.password=your_password

# JPA
spring.jpa.hibernate.ddl-auto=update

# JWT
jwt.secret=your_very_long_secret_key_for_jwt_token
jwt.expiration=86400000

# Cloudinary
cloudinary.cloud-name=your_cloudinary_name
cloudinary.api-key=your_cloudinary_api_key
cloudinary.api-secret=your_cloudinary_secret

# Email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_app_password
```

**4. Chạy Backend:**

```bash
mvn spring-boot:run
# Hoặc
java -jar target/LibraryManagementSystem-0.0.1-SNAPSHOT.jar
```

Backend sẽ chạy tại: `http://localhost:8080`

### Frontend Setup

**1. Install dependencies:**

```bash
cd frontend/library-frontend
pnpm install
```

**2. Cấu hình API (nếu cần):**

```javascript
// File: src/services/api.js
const API_BASE_URL = "http://localhost:8080/api"; // Adjust if needed
```

**3. Chạy Frontend (Development):**

```bash
pnpm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

**4. Build cho Production:**

```bash
pnpm run build
pnpm run preview
```

### Database Initialization

**Tạo data mẫu (seeders):**

```sql
-- Insert Authors
INSERT INTO authors (name, bio) VALUES
('J.K. Rowling', 'British author known for Harry Potter series'),
('George R.R. Martin', 'Author of A Song of Ice and Fire');

-- Insert Genres
INSERT INTO genres (name, description) VALUES
('Fantasy', 'Fantasy novels'),
('Mystery', 'Mystery novels');

-- Insert Publishers
INSERT INTO publishers (name, country) VALUES
('Bloomsbury Publishing', 'UK'),
('Bantam Spectra', 'USA');

-- Insert Books
INSERT INTO books (title, isbn, author_id, genre_id, publisher_id, quantity, price)
VALUES ('Harry Potter and the Philosopher\'s Stone', '9780747532699', 1, 1, 1, 50, 350000);
```

---

## 🔐 Quy Trình Bảo Mật

### Authentication Flow

```
1. User đăng nhập
2. Backend xác thực (kiểm tra email/password)
3. Tạo JWT token với payload (userId, email, role)
4. Trả token cho Frontend
5. Frontend lưu token vào localStorage
6. Mỗi request gửi token qua header: Authorization: Bearer <token>
7. Backend verify token
8. Nếu valid → xử lý request
9. Nếu invalid/expired → return 401 Unauthorized
```

### JWT Structure

```
Header: {
  "alg": "HS256",
  "typ": "JWT"
}

Payload: {
  "userId": 1,
  "email": "user@example.com",
  "role": "USER",
  "iat": 1234567890,
  "exp": 1234654290
}

Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
```

### Password Security

- Passwords hashed with bcrypt
- Minimum 8 characters
- Must contain: uppercase, lowercase, numbers, special characters
- Password reset via email token (24 hour expiration)

### CORS Configuration

```javascript
// Allowed origins
- http://localhost:5173 (dev)
- http://localhost:3000 (dev)
- https://yourdomain.com (production)

// Allowed methods
- GET, POST, PUT, DELETE, OPTIONS

// Allowed headers
- Content-Type, Authorization
```

### Role-Based Access Control (RBAC)

```
ADMIN:
  - Quản lý tất cả tài nguyên
  - Xem báo cáo
  - Quản lý người dùng

USER:
  - Xem sách
  - Mượn/trả sách
  - Thanh toán tiền phạt
  - Xem profile của mình
```

---

## 📊 Thống Kê Dự Án

### Code Statistics

| Thành Phần       | Số Lượng |
| ---------------- | -------- |
| Controllers      | 18       |
| Services         | 18+      |
| Entities/Models  | 17       |
| Repositories     | 17       |
| React Components | 30+      |
| Pages            | 15+      |
| Services (FE)    | 12       |
| Utilities (FE)   | 4        |

### Database Tables

| Bảng                  | Mục Đích              |
| --------------------- | --------------------- |
| users                 | Người dùng            |
| books                 | Sách                  |
| authors               | Tác giả               |
| genres                | Thể loại              |
| publishers            | Nhà xuất bản          |
| book_loans            | Mượn sách             |
| reservations          | Đặt sách              |
| fines                 | Tiền phạt             |
| payments              | Thanh toán            |
| wallets               | Ví điện tử            |
| wallet_trans.         | Giao dịch ví          |
| subscriptions         | Gói đăng ký           |
| subscription_plans    | Định nghĩa gói        |
| book_reviews          | Đánh giá sách         |
| wishlists             | Danh sách yêu thích   |
| addresses             | Địa chỉ               |
| password_reset_tokens | Reset password tokens |

### Performance Metrics (Dự Kiến)

| Metric              | Target  |
| ------------------- | ------- |
| API Response Time   | < 200ms |
| Page Load Time      | < 3s    |
| Database Query Time | < 100ms |
| Max Users           | 10,000+ |
| Max Concurrent Req  | 1,000+  |

---

## 📱 Responsive Design

### Breakpoints (Tailwind CSS)

```
sm: 640px   - Small devices (tablets)
md: 768px   - Medium devices
lg: 1024px  - Large devices (desktops)
xl: 1280px  - Extra large devices
```

### Mobile Optimization

- Touch-friendly buttons & inputs
- Optimized images
- Responsive navigation
- Mobile-first design approach

---

## 🧪 Testing

### Backend Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=UserControllerTest

# Run with coverage
mvn test jacoco:report
```

### Frontend Testing

```bash
# Run linting
pnpm lint

# Fix linting issues
pnpm lint --fix
```

---

## 📝 Coding Standards

### Backend

- **Language:** Java 21
- **Style Guide:** Google Java Style Guide
- **Naming Convention:**
  - Classes: PascalCase (UserService)
  - Methods: camelCase (getUserById)
  - Constants: UPPER_SNAKE_CASE (MAX_USERS)

### Frontend

- **Language:** JavaScript/JSX (ES6+)
- **Style Guide:** Airbnb JavaScript Style Guide
- **Naming Convention:**
  - Components: PascalCase (BookCard)
  - Functions: camelCase (handleSubmit)
  - Constants: UPPER_SNAKE_CASE (API_BASE_URL)

---

## 🐛 Troubleshooting

### Backend Issues

**Issue:** "Cannot connect to database"

- **Solution:** Check MySQL is running, verify credentials in application.properties

**Issue:** "JWT token expired"

- **Solution:** Refresh token using refresh-token endpoint or login again

**Issue:** "CORS error"

- **Solution:** Check CorsConfig.java, ensure frontend URL is in allowed origins

### Frontend Issues

**Issue:** "API calls failing with 401"

- **Solution:** Check token in localStorage, refresh if expired

**Issue:** "Images not loading"

- **Solution:** Verify Cloudinary configuration, check image URLs

**Issue:** "Build failing"

- **Solution:** Run `pnpm install` to ensure all dependencies, check Node.js version

---

## 📞 Support & Contact

- **Repository:** GitHub URL
- **Issues:** GitHub Issues
- **Email:** support@library-system.com
- **Documentation:** See SYSTEM_STRUCTURE.md for detailed structure

---

## 📄 License & Credits

**License:** MIT License  
**Created:** 2026  
**Last Updated:** April 25, 2026

---

**End of Documentation**  
_For more detailed information, refer to individual component documentation and code comments._
