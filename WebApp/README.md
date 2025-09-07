# Finora - Personal Finance Management App

<div align="center">
  <img src="financeApp-Frontend/public/finora.png" alt="Finora Logo" width="200"/>
  <h1>Finora</h1>
  <p><strong>Your AI-Powered Financial Command Center</strong></p>
  <p>Take control of your finances with intelligent insights, automated tracking, and comprehensive financial management tools.</p>
  <p><strong>Created by Shubham Kakde - Software Developer</strong></p>
</div>

## 📋 Table of Contents

- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Features in Detail](#-features-in-detail)
- [Contributing](#-contributing)
- [License](#-license)

## 🚀 Features

### Core Financial Management
- **📊 Dashboard Overview** - Real-time financial insights and key metrics
- **💰 Transaction Tracking** - Manual entry and automated statement parsing
- **📈 Investment Portfolio** - Live market data and performance tracking
- **🎯 Budget Management** - Category-based budgeting with alerts
- **🎯 Goal Setting** - Financial goal tracking with progress visualization
- **🔄 Udhaari (Borrowings & Lendings)** - Track money borrowed from and lent to others
- **📅 Subscription Tracker** - Monitor recurring expenses and upcoming payments
- **🤖 AI Financial Advisor** - Personalized financial recommendations
- **📄 Smart PDF Parser** - Automatic transaction extraction from bank statements

### Advanced Analytics
- **📊 Spending Insights** - AI-powered spending analysis and trends
- **📈 Investment Analytics** - Portfolio performance and diversification metrics
- **💡 Smart Recommendations** - Personalized financial advice
- **📱 Real-time Updates** - Live market data and portfolio tracking

### User Experience
- **🌙 Dark/Light Theme** - Modern UI with theme switching
- **📱 Responsive Design** - Works seamlessly on all devices
- **🎨 Beautiful UI** - Glassmorphism design with smooth animations
- **🔒 Secure Authentication** - JWT-based user authentication
- **⚡ Fast Performance** - Optimized for speed and efficiency

## 🛠 Technology Stack

### Backend
- **Java 17** - Primary programming language
- **Spring Boot 3.2.0** - Framework for building REST APIs
- **Spring Security** - Authentication and authorization
- **Spring Data JPA** - Database access layer
- **MySQL** - Primary database
- **JWT** - JSON Web Tokens for authentication
- **Apache PDFBox** - PDF processing for statement parsing
- **Apache POI** - Excel file processing
- **Yahoo Finance API** - Real-time stock data

### Frontend
- **React 18** - Modern JavaScript library
- **Material-UI (MUI)** - Component library with theming
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Framer Motion** - Animation library
- **React Hot Toast** - Notification system
- **Recharts** - Data visualization
- **React Dropzone** - File upload handling

### DevOps & Tools
- **Maven** - Build automation
- **Docker** - Containerization
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🏗 Architecture

```
finora-app/
├── financeApp-Backend/          # Spring Boot Backend
│   ├── src/main/java/com/financeapp/
│   │   ├── controller/          # REST API Controllers
│   │   ├── service/            # Business Logic Layer
│   │   ├── repository/         # Data Access Layer
│   │   ├── model/             # JPA Entities
│   │   ├── security/          # Authentication & Security
│   │   ├── dto/               # Data Transfer Objects
│   │   └── config/            # Configuration Classes
│   └── src/main/resources/     # Application Properties
└── financeApp-Frontend/         # React Frontend
    ├── public/                 # Static Assets
    ├── src/
    │   ├── components/         # React Components
    │   ├── contexts/          # React Context Providers
    │   ├── services/          # API Service Layer
    │   ├── theme/            # Material-UI Theme
    │   └── utils/            # Utility Functions
    └── build/                 # Production Build
```

## 🚀 Getting Started

### Prerequisites

- **Java 17** or higher
- **Node.js 16** or higher
- **MySQL 8.0** or higher
- **Maven 3.6** or higher
- **Git**

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/finora.git
   cd finora
   ```

2. **Database Setup**
   ```sql
   CREATE DATABASE finoredb;
   -- Tables will be created automatically by Hibernate
   ```

3. **Configure Database Connection**
   Edit `financeApp-Backend/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:mysql://localhost:3306/finoredb
       username: your_username
       password: your_password
   ```

4. **Run Backend**
   ```bash
   cd financeApp-Backend
   mvn clean install
   mvn spring-boot:run
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd financeApp-Frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

### Docker Setup (Optional)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📚 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signin` | User login |
| POST | `/api/auth/signup` | User registration |

### Transaction Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/transactions` | Get user transactions |
| POST | `/api/transactions` | Create new transaction |
| PUT | `/api/transactions/{id}` | Update transaction |
| DELETE | `/api/transactions/{id}` | Delete transaction |
| GET | `/api/transactions/summary` | Get financial summary |
| GET | `/api/transactions/monthly` | Get monthly transactions |

### Investment Tracking

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/investments` | Get user investments |
| POST | `/api/investments` | Add new investment |
| GET | `/api/investments/portfolio/summary` | Get portfolio summary |
| POST | `/api/investments/upload-statement` | Upload investment statement |

### Udhaari (Borrowings & Lendings)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/udhaari` | Get all Udhaari entries |
| POST | `/api/udhaari` | Create new Udhaari entry |
| PUT | `/api/udhaari/{id}` | Update Udhaari entry |
| DELETE | `/api/udhaari/{id}` | Delete Udhaari entry |
| GET | `/api/udhaari/summary` | Get Udhaari summary |

### Budget Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budget/get` | Get user budget |
| POST | `/api/budget/create` | Create budget |
| GET | `/api/budget/analysis` | Get budget analysis |

### Goals

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/goals` | Get user goals |
| POST | `/api/goals` | Create new goal |
| PUT | `/api/goals/{id}` | Update goal |
| DELETE | `/api/goals/{id}` | Delete goal |

### Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions` | Get user subscriptions |
| POST | `/api/subscriptions` | Add new subscription |
| GET | `/api/subscriptions/upcoming` | Get upcoming payments |

### AI Advisor

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/advisor/advice` | Get financial advice |
| GET | `/api/advisor/recommendations` | Get personalized recommendations |

## 🗄 Database Schema

### Core Tables

#### Users
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(120) NOT NULL,
    monthly_budget DECIMAL(15,2) DEFAULT 0.00,
    daily_budget DECIMAL(15,2) DEFAULT 0.00,
    reward_points DECIMAL(15,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Transactions
```sql
CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    type ENUM('INCOME', 'EXPENSE') NOT NULL,
    category VARCHAR(50) NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Udhaari
```sql
CREATE TABLE udhaari (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    person_name VARCHAR(100) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description VARCHAR(255) NOT NULL,
    type ENUM('BORROWED', 'LENT') NOT NULL,
    transaction_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Investments
```sql
CREATE TABLE investments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(10) NOT NULL,
    quantity DECIMAL(15,4) NOT NULL,
    purchase_price DECIMAL(15,2) NOT NULL,
    purchase_date DATE NOT NULL,
    current_price DECIMAL(15,2),
    user_id BIGINT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🎯 Features in Detail

### 1. Dashboard Overview
The dashboard provides a comprehensive view of your financial health with:
- **Net Worth Calculation** - Total assets minus liabilities including Udhaari
- **Cash Balance** - Current liquid funds
- **Monthly Income/Expenses** - Income and spending trends
- **Investment Performance** - Portfolio gains/losses
- **Savings Rate** - Percentage of income saved
- **Smart Insights** - AI-generated financial insights

### 2. Transaction Management
- **Manual Entry** - Add transactions manually with categories
- **Statement Upload** - Automatic parsing of PDF bank statements
- **Category Classification** - Smart categorization of expenses
- **Search & Filter** - Find transactions by date, category, or amount
- **Export Options** - Download transaction data as PDF

### 3. Investment Tracking
- **Real-time Prices** - Live market data from Yahoo Finance
- **Portfolio Analytics** - Performance metrics and diversification
- **Statement Upload** - Parse investment statements automatically
- **Gain/Loss Tracking** - Monitor investment performance
- **Asset Allocation** - Visual breakdown of portfolio composition

### 4. Udhaari (Borrowings & Lendings)
- **Two-Column Layout** - Separate views for borrowed and lent amounts
- **Person Tracking** - Track amounts with specific individuals
- **Net Balance Calculation** - Automatic calculation of net owed/receivable
- **Date Tracking** - Record transaction dates
- **Summary Dashboard** - Overview of total borrowed/lent amounts

### 5. Budget Management
- **Category Budgets** - Set spending limits by category
- **Budget Alerts** - Notifications when approaching limits
- **Spending Analysis** - Compare actual vs budgeted spending
- **Budget vs Actual Reports** - Detailed budget performance

### 6. Goal Setting
- **Financial Goals** - Set savings targets with deadlines
- **Progress Tracking** - Visual progress indicators
- **Goal Categories** - Organize goals by type
- **Milestone Alerts** - Notifications for goal progress

### 7. Subscription Tracker
- **Recurring Expenses** - Track monthly subscriptions
- **Upcoming Payments** - Calendar view of upcoming charges
- **Cost Analysis** - Total subscription spending
- **Cancellation Reminders** - Track unused subscriptions

### 8. AI Financial Advisor
- **Personalized Insights** - AI-generated financial recommendations
- **Spending Analysis** - Identify spending patterns and opportunities
- **Investment Suggestions** - Portfolio optimization recommendations
- **Budget Optimization** - Smart budget allocation suggestions

### 9. Smart PDF Parser
- **Bank Statement Processing** - Extract transactions from PDF statements
- **Multiple Formats** - Support for various bank statement formats
- **Automatic Categorization** - Smart classification of transactions
- **Duplicate Detection** - Prevent duplicate transaction entries

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Encryption** - Bcrypt password hashing
- **Role-based Access** - User-specific data isolation
- **API Security** - CORS configuration and request validation
- **Session Management** - Secure session handling

## 📱 User Interface

### Design Philosophy
- **Glassmorphism Design** - Modern frosted glass aesthetic
- **Dark/Light Themes** - User preference-based theming
- **Responsive Layout** - Mobile-first responsive design
- **Smooth Animations** - Framer Motion powered transitions
- **Intuitive Navigation** - Clean, organized menu structure

### Key UI Components
- **Material-UI Components** - Consistent design system
- **Custom Theme** - Brand-consistent color palette
- **Interactive Charts** - Recharts-powered data visualization
- **Toast Notifications** - Real-time feedback system
- **Loading States** - Smooth loading experiences

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow Java/Spring Boot best practices for backend
- Use React hooks and functional components for frontend
- Maintain consistent code formatting with Prettier
- Write comprehensive tests for new features
- Update documentation for API changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spring Boot** - For the robust backend framework
- **React** - For the powerful frontend library
- **Material-UI** - For the beautiful component library
- **Yahoo Finance API** - For real-time market data
- **Apache PDFBox** - For PDF processing capabilities

## 📞 Support

For support, email support@finora.com or join our Discord community.

---

<div align="center">
  <p><strong>Made with ❤️ for better financial management</strong></p>
  <p>Transform your financial future with Finora</p>
</div>