# Finora - Personal Finance Tracker

A comprehensive personal finance application with Android, Web, and Backend components.

## Project Structure

```
FinanceApp/
├── financeApp-Backend/          # Spring Boot backend
├── financeApp-Frontend/         # React web frontend
└── financeAppFrontendAndroid/   # Android app (Kotlin/Jetpack Compose)
```

## Features

### 🎯 Core Features
- User Authentication (JWT-based)
- Interactive Dashboard
- Transaction Management
- Goal Tracking
- Investment Portfolio Tracking
- Budget Planning
- Subscription Management
- User Profile

### 🤖 AI Features
- Personalized financial advice
- Goal achievement recommendations
- Financial health scoring

### 🎨 UI/UX Features
- Modern Material Design
- Responsive layout
- Dark/Light theme support

## Android App (financeAppFrontendAndroid)

The Android app is built with:
- Kotlin
- Jetpack Compose
- Hilt for dependency injection
- Retrofit for networking
- MVVM architecture

### Android App Features
- User Authentication (Login/Register)
- Dashboard with financial overview
- Transaction management
- Goal tracking
- Investment portfolio tracking
- Budget planning
- Subscription management
- User profile

### Setup Instructions for Android App

1. Open the `financeAppFrontendAndroid` folder in Android Studio
2. Sync the project with Gradle files
3. Run the app on an emulator or physical device

The app is configured to connect to the backend server running on `http://10.0.2.2:8080/api/` (Android emulator's localhost).

## Backend (financeApp-Backend)

Built with Spring Boot 3.2.0 featuring:
- Spring Security (JWT authentication)
- Spring Data JPA
- MySQL database
- RESTful API

## Web Frontend (financeApp-Frontend)

Built with React 18 and Material-UI featuring:
- Responsive design
- Interactive charts
- Animations with Framer Motion

## Development

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- Android Studio (for Android app)
- MySQL 8.0 or higher

### Running the Full Application

1. Start the MySQL database
2. Configure the backend database connection in `application.yml`
3. Run the Spring Boot backend: `mvn spring-boot:run`
4. Run the React frontend: `npm start`
5. Run the Android app from Android Studio

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a pull request

## License

This project is licensed under the MIT License.