# Auth Server

A modern Express.js authentication server with TypeScript, Prisma ORM, and PostgreSQL.

## Features

- Express.js with TypeScript
- PostgreSQL database with Prisma ORM
- JWT authentication
- Password hashing with bcrypt
- Input validation
- Protected routes
- Modern folder structure

## Authentication Flow

1. **Register**: Create a new user with hashed password
2. **Login**: Verify credentials and return JWT
3. **Profile**: Access protected route with JWT
4. **Logout**: Client-side token removal (no server-side token storage)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the database connection string and JWT secret

4. Run database migrations:

```bash
npm run prisma:migrate
```

5. Generate Prisma client:

```bash
npm run prisma:generate
```

6. Start the development server:

```bash
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/profile` - Get user profile (protected)

## License

MIT
