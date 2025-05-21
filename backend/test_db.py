#!/usr/bin/env python
import psycopg2

# Параметры подключения
HOST = "192.168.1.124"
PORT = 5432
USER = "admin"
PASSWORD = "pam"
DB_NAME = "football"

def test_database():
    """Проверка подключения к базе данных и наличия таблиц"""
    try:
        # Подключение к базе данных
        print(f"Подключение к базе данных {DB_NAME} на {HOST}:{PORT}...")
        conn = psycopg2.connect(
            host=HOST,
            user=USER,
            password=PASSWORD,
            port=PORT,
            dbname=DB_NAME
        )
        cursor = conn.cursor()
        
        # Получение списка таблиц
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        tables = cursor.fetchall()
        
        print("Найденные таблицы:")
        for table in tables:
            print(f"- {table[0]}")
            
            # Получение структуры таблицы
            cursor.execute(f"""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = '{table[0]}'
            """)
            columns = cursor.fetchall()
            
            print("  Колонки:")
            for column in columns:
                print(f"  - {column[0]} ({column[1]})")
        
        cursor.close()
        conn.close()
        print("Проверка базы данных завершена успешно!")
        return True
    except Exception as e:
        print(f"Ошибка при проверке базы данных: {e}")
        return False

if __name__ == "__main__":
    test_database() 