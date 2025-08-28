# FinanceApp - Personal Finance Manager

A comprehensive personal finance application built with React and Spring Boot, featuring AI-powered financial advice, interactive dashboards, goal tracking, and reward systems.

## Features

### 🎯 Core Features
- **User Authentication**: Secure JWT-based authentication system
- **Interactive Dashboard**: Real-time financial overview with animated charts
- **Transaction Management**: Add, edit, delete, and categorize transactions
- **Goal Tracking**: Set financial goals with AI-powered progress insights
- **AI Financial Advisor**: Personalized financial advice based on spending patterns
- **Reward System**: Earn points for good financial habits
- **PDF Reports**: Export transactions and financial summaries
- **Responsive Design**: Works seamlessly on desktop and mobile

### 🤖 AI Features
- Personalized spending advice
- Goal achievement recommendations
- Financial health scoring
- Budget optimization suggestions
- Smart categorization insights

### 🎨 UI/UX Features
- Modern Material-UI design
- Smooth animations with Framer Motion
- Interactive charts and visualizations
- Glass morphism effects
- Responsive layout
- Dark/Light theme support

## Tech Stack

### Backend
- **Spring Boot 3.2.0** - Main framework
- **Spring Security** - Authentication & authorization
- **Spring Data JPA** - Database operations
- **JWT** - Token-based authentication
- **H2 Database** - In-memory database (development)
- **MySQL** - Production database support
- **iText PDF** - PDF generation
- **Maven** - Dependency management

### Frontend
- **React 18** - UI framework
- **Material-UI (MUI)** - Component library
- **Framer Motion** - Animations
- **Recharts** - Data visualization
- **Axios** - HTTP client
- **React Router** - Navigation
- **Day.js** - Date manipulation

## Project Structure

```
FinanceApp/
├── financeApp-Backend/          # Spring Boot backend
│   ├── src/main/java/com/financeapp/
│   │   ├── controller/          # REST controllers
│   │   ├── model/              # Entity models
│   │   ├── repository/         # Data repositories
│   │   ├── service/            # Business logic
│   │   ├── security/           # Security configuration
│   │   └── dto/                # Data transfer objects
│   └── src/main/resources/
│       └── application.yml     # Configuration
├── financeApp-Frontend/         # React frontend
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── context/            # React context
│   │   └── App.js              # Main app component
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Java 17 or higher
- Node.js 16 or higher
- Maven 3.6 or higher
- MySQL 8.0 or higher

### Database Setup

1. **Create MySQL Database:**
```sql
CREATE DATABASE financeDb;
```

2. **Configure MySQL User (if needed):**
```sql
CREATE USER 'D3_87069_Shubham'@'localhost' IDENTIFIED BY 'root';
GRANT ALL PRIVILEGES ON financeDb.* TO 'D3_87069_Shubham'@'localhost';
FLUSH PRIVILEGES;
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd financeApp-Backend
```

2. Make sure MySQL is running and the database `financeDb` exists

3. Install dependencies and run:
```bash
mvn clean install
mvn spring-boot:run
```

The backend will start on `http://localhost:8080` and automatically create the required tables.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd financeApp-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will start on `http://localhost:3000`

## Configuration

### Backend Configuration (application.yml)

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/financeDb?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    driver-class-name: com.mysql.cj.jdbc.Driver
    username: D3_87069_Shubham
    password: root
  
  jpa:
    database-platform: org.hibernate.dialect.MySQL8Dialect
    hibernate:
      ddl-auto: update
    show-sql: true

jwt:
  secret: mySecretKey123456789012345678901234567890
  expiration: 86400000 # 24 hours
```

### Environment Variables

For production, set these environment variables:
- `OPENAI_API_KEY`: Your OpenAI API key for AI features
- `DATABASE_URL`: Production database URL
- `JWT_SECRET`: Secure JWT secret key

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction
- `GET /api/transactions/summary` - Financial summary

### Goals
- `GET /api/goals` - Get user goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/{id}` - Update goal
- `PUT /api/goals/{id}/progress` - Update goal progress

### AI Advisor
- `GET /api/advisor/advice` - Get personalized advice
- `GET /api/advisor/goal/{id}/advice` - Get goal-specific advice

### Reports
- `GET /api/user/export/transactions` - Export transactions PDF
- `GET /api/user/export/summary` - Export financial summary PDF

## Features in Detail

### 🎯 Transaction Management
- Add income and expense transactions
- Categorize transactions (Food, Transportation, etc.)
- Edit and delete existing transactions
- Search and filter transactions
- Real-time balance updates

### 📊 Interactive Dashboard
- Financial health score
- Income vs expense charts
- Category-wise spending breakdown
- Recent transactions overview
- Active goals progress

### 🎯 Goal Tracking
- Set financial goals with target amounts and dates
- Track progress with visual indicators
- AI-powered achievement recommendations
- Goal completion rewards

### 🤖 AI Financial Advisor
- Spending pattern analysis
- Budget optimization suggestions
- Goal achievement strategies
- Financial health scoring
- Personalized recommendations

### 🏆 Reward System
- Earn points for staying within budget
- Bonus points for goal completion
- Tiered membership levels (Bronze, Silver, Gold, Diamond)
- Point redemption system

### 📈 Reports & Analytics
- Comprehensive financial reports
- Interactive charts and graphs
- PDF export functionality
- Date range filtering
- Category-wise analysis

## Development

### Running Tests
```bash
# Backend tests
cd financeApp-Backend
mvn test

# Frontend tests
cd financeApp-Frontend
npm test
```

### Building for Production
```bash
# Backend
cd financeApp-Backend
mvn clean package

# Frontend
cd financeApp-Frontend
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Transactions
![Transactions](screenshots/transactions.png)

### Goals
![Goals](screenshots/goals.png)

### Reports
![Reports](screenshots/reports.png)

## Support

For support, email support@financeapp.com or create an issue in the repository.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Bank account integration
- [ ] Investment tracking
- [ ] Bill reminders
- [ ] Multi-currency support
- [ ] Social features (family accounts)
- [ ] Advanced AI insights
- [ ] Cryptocurrency tracking

---

Built with ❤️ using React and Spring Boot