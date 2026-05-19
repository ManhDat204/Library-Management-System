# 📚 Library Management System

A full-stack web application for managing library operations including book inventory, user management, borrowing/returning processes, and administrative functions.

## 🎯 Project Overview

The Library Management System is built with a modern full-stack architecture combining:
- **Backend**: Spring Boot 4.0 with Java 21
- **Frontend**: React 19 with Vite
- **Database**: MySQL
- **Language Composition**: JavaScript (59.3%), Java (40.5%), Other (0.2%)

## ✨ Features

### Core Functionality
- 📖 **Book Management**: Add, update, and manage library books
- 👥 **User Management**: User registration and profile management
- 📋 **Borrowing System**: Track book borrowings and returns
- 🔐 **Authentication**: Secure user authentication with JWT tokens
- 🖼️ **Image Upload**: Cloud-based image management via Cloudinary
- 📊 **Dashboard**: Analytics and statistics visualization
- ✉️ **Email Notifications**: Automated email notifications

### Security Features
- OAuth2 client support
- Spring Security integration
- JWT-based authentication
- Data validation and JDBC protection

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 4.0.0
- **Java Version**: 21
- **Build Tool**: Maven
- **Database**: MySQL
- **Authentication**: Spring Security + JWT (io.jsonwebtoken)
- **File Storage**: Cloudinary
- **ORM**: Spring Data JPA
- **Additional Libraries**:
  - Lombok (for boilerplate reduction)
  - Spring Mail (for email services)
  - Spring Boot DevTools

### Frontend
- **Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **Styling**: Tailwind CSS + Material-UI (MUI)
- **HTTP Client**: Axios
- **Routing**: React Router DOM 7.13.1
- **Charts**: Recharts
- **Icons**: Lucide React
- **State Management**: Emotion for CSS-in-JS

## 📁 Project Structure

```
Library-Management-System/
├── LibraryManagementSystem/          # Backend (Spring Boot)
│   ├── src/
│   ├── pom.xml
│   └── ...
├── frontend/
│   └── library-frontend/            # Frontend (React + Vite)
│       ├── src/
│       ├── package.json
│       ├── vite.config.js
│       └── ...
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Java 21
- Node.js (v16+)
- npm or yarn
- MySQL (v5.7+)

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd LibraryManagementSystem
   ```

2. **Configure database connection**
   - Update `application.properties` or `application.yml` with your MySQL credentials

3. **Build the project**
   ```bash
   mvn clean install
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

The backend will be available at `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend/library-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoints**
   - Update API configuration to point to your backend URL

4. **Run development server**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

### Build for Production

**Backend**
```bash
mvn clean package
```

**Frontend**
```bash
npm run build
```

## 📋 Available Scripts

### Backend (Maven)
- `mvn clean install` - Build the project
- `mvn spring-boot:run` - Run development server
- `mvn test` - Run tests
- `mvn package` - Create JAR package

### Frontend (npm)
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔧 Configuration

### Backend Configuration
- JWT configuration for token management
- Cloudinary API keys for image uploads
- MySQL database connection settings
- Email SMTP configuration

### Frontend Configuration
- API base URL
- Axios interceptors for authentication
- React Router configuration
- Build and optimization settings

## 📚 API Documentation

The backend provides RESTful API endpoints for:
- User authentication and profile management
- Book catalog operations
- Borrowing/returning management
- Admin functionalities

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication
- **Spring Security**: Role-based access control
- **OAuth2**: Third-party authentication support
- **Input Validation**: Request validation using Spring Validation
- **Data Protection**: Secure database connectivity

## 🧪 Testing

- Spring Boot test framework
- Security testing support
- Unit and integration tests for core functionality

## 📦 Dependencies

### Key Backend Dependencies
- Spring Boot Data JPA
- Spring Security + OAuth2
- JWT (JSON Web Tokens)
- MySQL Connector
- Cloudinary

### Key Frontend Dependencies
- React Router
- Material-UI
- Tailwind CSS
- Axios
- Recharts

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**ManhDat204**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the GitHub repository.

## 🗺️ Roadmap

Future enhancements:
- [ ] Advanced search and filtering
- [ ] Book recommendations
- [ ] Reading history and analytics
- [ ] Mobile application
- [ ] Payment integration
- [ ] Reservation system
- [ ] Multi-language support

---

**Last Updated**: May 2026

Made with ❤️ by ManhDat204
