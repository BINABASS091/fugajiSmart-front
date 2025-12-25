#!/bin/bash

# Exit on error
set -e

# PostgreSQL configuration
DB_NAME="cohortkuku"
DB_USER="kuku"
DB_PASSWORD="123@kuku"

# Start PostgreSQL if not running
if ! pg_isready -q; then
    echo "Starting PostgreSQL..."
    sudo service postgresql start
fi

# Create user and database
echo "Setting up PostgreSQL user and database..."
sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';" 2>/dev/null || true
sudo -u postgres psql -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || true
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null || true

# Verify the setup
echo "Verifying database connection..."
PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT 'PostgreSQL connection successful' AS message;"

echo "PostgreSQL setup complete!"
