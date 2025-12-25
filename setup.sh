#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Starting Kuku Farm Management System Setup...${NC}"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is required but not installed. Please install Python 3.8 or higher.${NC}"
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}❌ pip3 is required but not installed. Please install pip3.${NC}"
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL is not installed. Installing...${NC}"
    # For Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    # For CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y postgresql postgresql-server
        sudo postgresql-setup initdb
        sudo systemctl start postgresql
        sudo systemctl enable postgresql
    else
        echo -e "${RED}❌ Package manager not supported. Please install PostgreSQL manually.${NC}"
        exit 1
    fi
fi

# Check if Redis is installed
if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis is not installed. Installing...${NC}"
    # For Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        sudo apt-get install -y redis-server
        sudo systemctl start redis
        sudo systemctl enable redis
    # For CentOS/RHEL
    elif command -v yum &> /dev/null; then
        sudo yum install -y redis
        sudo systemctl start redis
        sudo systemctl enable redis
    else
        echo -e "${YELLOW}⚠️  Could not install Redis. Please install it manually.${NC}"
    fi
fi

# Create virtual environment
echo -e "${GREEN}✅ Setting up Python virtual environment...${NC}"
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo -e "${GREEN}✅ Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r backend/requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${GREEN}✅ Creating .env file...${NC}"
    cat > .env <<EOL
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database Settings
DB_NAME=cohortkuku
DB_USER=kuku
DB_PASSWORD=123@kuku
DB_HOST=localhost
DB_PORT=5432

# Redis Settings
REDIS_URL=redis://localhost:6379/0

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256

# Email Settings
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-email-password

# Frontend URL
FRONTEND_URL=http://localhost:3000
EOL
    echo -e "${YELLOW}⚠️  Please update the .env file with your actual settings.${NC}"
fi

# Create database and user
echo -e "${GREEN}✅ Setting up PostgreSQL database...${NC}"
sudo -u postgres psql -c "CREATE DATABASE cohortkuku;" 2>/dev/null || echo -e "${YELLOW}⚠️  Database 'cohortkuku' already exists or cannot be created.${NC}"
sudo -u postgres psql -c "CREATE USER kuku WITH PASSWORD '123@kuku';" 2>/dev/null || echo -e "${YELLOW}⚠️  User 'kuku' already exists or cannot be created.${NC}"
sudo -u postgres psql -c "ALTER ROLE kuku SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE kuku SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE kuku SET timezone TO 'UTC';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE cohortkuku TO kuku;"

# Run migrations
echo -e "${GREEN}✅ Running database migrations...${NC}" 
cd backend
python manage.py migrate

# Create superuser
echo -e "${GREEN}✅ Creating superuser...${NC}" 
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@example.com', 'admin123')" | python manage.py shell || echo -e "${YELLOW}⚠️  Superuser already exists or could not be created.${NC}"

# Collect static files
echo -e "${GREEN}✅ Collecting static files...${NC}" 
python manage.py collectstatic --noinput

echo -e "\n${GREEN}🎉 Setup completed successfully!${NC}"
echo -e "\nTo start the development server, run:"
echo -e "  cd /home/kilimanjaro/Desktop/cohort-kuku/backend"
echo -e "  source ../venv/bin/activate"
echo -e "  python manage.py runserver"
echo -e "\nAccess the admin interface at: http://localhost:8000/admin/"
echo -e "API documentation: http://localhost:8000/api/docs/swagger/"

# Make the script executable
chmod +x setup.sh
