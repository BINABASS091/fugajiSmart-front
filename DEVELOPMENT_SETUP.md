# Development Setup Guide

This guide will help you set up the development environment for the Farm Management System.

## Prerequisites

- Python 3.8+
- PostgreSQL 13+
- Node.js 16+ (for frontend)
- npm or yarn (for frontend dependencies)

## Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cohort-kuku/backend
   ```

2. **Set up Python virtual environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up PostgreSQL**
   - Install PostgreSQL if not already installed
   - Run the database setup script:
     ```bash
     chmod +x setup_postgres.sh
     ./setup_postgres.sh
     ```

5. **Set up environment variables**
   Create a `.env` file in the `backend` directory with the following content:
   ```env
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   # NOTE: URL-encode special characters in passwords, e.g. '@' => '%40'
   DATABASE_URL=postgres://kuku:123%40kuku@localhost:5432/cohortkuku
   ALLOWED_HOSTS=localhost,127.0.0.1
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
   ```

6. **Run database migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

8. **Run the development server**
   ```bash
   python manage.py runserver
   ```
   The API will be available at `http://localhost:8000/api/`

## Frontend Setup (Vite)

1. **Install dependencies (project root)**
   ```bash
   npm install
   # or
   yarn install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   The frontend will be available at `http://127.0.0.1:5173`

## API Documentation

API documentation is available at `http://localhost:8000/api/docs/` when the backend server is running.

## Running Tests

To run the backend tests:
```bash
python manage.py test
```

## Project Structure

- `backend/` - Django backend application
  - `accounts/` - User authentication and profiles
  - `farms/` - Farm and batch management
  - `inventory/` - Inventory tracking
  - `subscriptions/` - Subscription management
  - `config/` - Project configuration

- `src/` - React frontend application
  - `components/` - Reusable UI components
  - `pages/` - Page components
  - `services/` - API service functions
  - `utils/` - Utility functions

## Troubleshooting

- If you get a database connection error, ensure PostgreSQL is running and the credentials in `.env` are correct.
- If you encounter Python package conflicts, try recreating the virtual environment.
- For frontend issues, try clearing the browser cache or running `npm install` again.
