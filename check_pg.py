import psycopg2
from psycopg2 import OperationalError

def check_postgres():
    try:
        # Try to connect to PostgreSQL
        conn = psycopg2.connect(
            dbname='postgres',  # Connect to default database first
            user='postgres',
            password='',
            host='localhost',
            port='5432'
        )
        print("✅ Successfully connected to PostgreSQL!")
        conn.close()
        return True
    except OperationalError as e:
        print("❌ Could not connect to PostgreSQL. Error:", e)
        print("\nPlease make sure PostgreSQL is installed and running.")
        print("You may need to start it with: sudo systemctl start postgresql")
        return False

if __name__ == "__main__":
    check_postgres()
