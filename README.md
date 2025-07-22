# File Storage Management System

A robust and secure file storage management system built with Node.js, TypeScript, Express.js, and Prisma. This system provides comprehensive file and folder management capabilities with user authentication, storage quotas, and advanced security features.

## 🚀 Features

### Authentication & User Management
- **User Registration & Login**: Secure authentication with JWT tokens
- **Role-based Access Control**: Support for USER, ADMIN, and SUPER_ADMIN roles
- **Email Verification**: OTP-based email verification system
- **Password Security**: BCrypt password hashing


### File Management
- **File Upload & Download**: Support for multiple file types
- **File Privacy Controls**: Public and private file settings with password protection
- **Favorites System**: Mark files as favorites for quick access
- **File Metadata**: Track file type, size, and creation/modification dates
- **Storage Quota Management**: 15GB default storage limit per user with usage tracking

### Folder Management
- **Folder Creation & Organization**: Hierarchical folder structure
- **Privacy Settings**: Private folders with password protection
- **User-specific Access**: Each folder belongs to a specific user

### Security Features
- **JWT Authentication**: Access and refresh token system
- **Private File Access**: Special JWT tokens for private file access
- **Password Protection**: Additional layer for sensitive files and folders
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Zod schema validation for all inputs

### Cloud Storage Integration
- **Multiple Storage Providers**: Support for AWS S3, Cloudinary
- **File Upload Optimization**: Efficient file handling with Multer

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: BCrypt
- **Validation**: Zod
- **File Upload**: Multer
- **Email Service**: Nodemailer

### Cloud Services
- **AWS S3**: Primary file storage
- **Cloudinary**: Image optimization and management

### Development Tools
- **TypeScript**: Type-safe development
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Prisma**: Database management and ORM
- **ts-node-dev**: Development server with hot reload

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB database
- Cloud storage account (AWS S3, Cloudinary)
- SMTP email service for notifications

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/masum-khondhoker-efaz/file-storage-management-system.git
   cd file-storage-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="mongodb://localhost:27017/file-storage-db"
   
   # JWT Configuration
   JWT_ACCESS_SECRET=your_access_secret
   JWT_ACCESS_EXPIRES_IN=1d
   JWT_REFRESH_SECRET=your_refresh_secret
   JWT_REFRESH_EXPIRES_IN=7d
   JWT_PRIVATE_ACCESS_SECRET=your_private_secret
   JWT_PRIVATE_ACCESS_EXPIRES_IN=1h
   
   # Security
   BCRYPT_SALT_ROUNDS=12
   SUPER_ADMIN_PASSWORD=your_super_admin_password
   
   # Email Configuration
   EMAIL=your_email@example.com
   EMAIL_PASS=your_email_password
   
   # Cloud Storage (choose one or configure multiple)
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_BUCKET_NAME=your_bucket_name
   AWS_REGION=us-east-1
   
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   

   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run pg
   
   # Push database schema
   npm run pd
   
   # Or run migrations (for production)
   npm run pm
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 API Documentation
```
https://documenter.getpostman.com/view/36263256/2sB34miHws
```

### Base URL
```
http://localhost:6000/api/v1
```



## 🏗️ Project Structure

```
src/
├── app/
│   ├── DB/                     # Database configuration
│   ├── errors/                 # Error handling utilities
│   ├── interface/              # TypeScript interfaces
│   ├── middlewares/            # Express middlewares
│   │   ├── auth.ts            # Authentication middleware
│   │   ├── globalErrorHandler.ts
│   │   └── validateRequest.ts
│   ├── modules/               # Feature modules
│   │   ├── auth/              # Authentication module
│   │   ├── files/             # File management module
│   │   ├── folders/           # Folder management module
│   │   └── user/              # User management module
│   ├── routes/                # Route definitions
│   └── utils/                 # Utility functions
├── config/                    # Configuration files
├── app.ts                     # Express app configuration
└── server.ts                  # Server entry point
```

### Module Structure (Example: Files Module)
```
files/
├── file.controller.ts         # Request handlers
├── file.interface.ts          # TypeScript interfaces
├── file.routes.ts             # Route definitions
├── file.service.ts            # Business logic
└── file.validation.ts         # Input validation schemas
```

## 🔒 Security Features

### Authentication Flow
1. User registers with email and password
2. System sends OTP for email verification
3. User verifies email and account becomes active
4. User logs in and receives access/refresh tokens
5. Access token used for API requests
6. Refresh token used to generate new access tokens

### File Access Control
- **Public Files**: Accessible to file owner
- **Private Files**: Require special private access token
- **Password Protected**: Additional password layer for sensitive files

### Storage Quota Management
- Default 15GB storage limit per user
- Real-time storage usage tracking
- Upload restrictions when quota exceeded

## 📊 Database Schema

### User Model
- Personal information (name, email, image)
- Authentication data (password, login status)
- Storage management (quota, usage tracking)
- Role and status management
- OTP verification system

### File Model
- File metadata (name, type, size, URL)
- Privacy controls (public/private, password)
- User relationship and ownership
- Favorites and organization features

### Folder Model
- Folder organization and hierarchy
- Privacy and password protection
- User ownership and access control

## 🚀 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm start               # Start production server

# Database
npm run pm              # Run Prisma migrations
npm run pd              # Push database schema
npm run pg              # Generate Prisma client

# Code Quality
npm run lint:check      # Check for linting errors
npm run lint:fix        # Fix linting errors
npm run prettier:check  # Check code formatting
npm run prettier:fix    # Fix code formatting
```



## 📝 Error Handling

Comprehensive error handling system with:
- **Global Error Handler**: Centralized error processing
- **Custom Error Classes**: Structured error responses
- **Zod Validation Errors**: Detailed input validation feedback
- **HTTP Status Codes**: Proper status code management


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.



