#!/usr/bin/env python3
import sys
import psycopg2

# Использование указанной строки подключения
DB_URL = "postgresql://admin:pam@192.168.1.124:5433/football"

def check_database():
    """Проверка подключения к базе данных и анализ существующих таблиц"""
    try:
        # Извлечение параметров подключения из строки
        conn_parts = DB_URL.replace("postgresql://", "").split("/")
        credentials = conn_parts[0].split("@")
        user_pass = credentials[0].split(":")
        host_port = credentials[1].split(":")
        
        user = user_pass[0]
        password = user_pass[1]
        host = host_port[0]
        port = int(host_port[1])
        dbname = conn_parts[1]
        
        print(f"Подключение к базе данных {dbname} на {host}:{port} как пользователь {user}")
        
        # Подключение к базе данных
        conn = psycopg2.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            dbname=dbname
        )
        
        cursor = conn.cursor()
        
        # Проверка существующих таблиц
        cursor.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_schema = 'public'
        """)
        
        existing_tables = [table[0] for table in cursor.fetchall()]
        
        if existing_tables:
            print("Существующие таблицы:")
            for table in existing_tables:
                print(f"  - {table}")
        else:
            print("В базе данных нет таблиц")
        
        # Проверка существующих enum типов
        cursor.execute("""
            SELECT t.typname
            FROM pg_type t
            JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
            WHERE t.typtype = 'e' AND n.nspname = 'public'
        """)
        
        existing_enums = [enum[0] for enum in cursor.fetchall()]
        
        if existing_enums:
            print("\nСуществующие enum типы:")
            for enum in existing_enums:
                print(f"  - {enum}")
        else:
            print("\nВ базе данных нет enum типов")
        
        cursor.close()
        conn.close()
        
        return {
            "tables": existing_tables,
            "enums": existing_enums,
            "conn_params": {
                "host": host,
                "port": port,
                "user": user,
                "password": password,
                "dbname": dbname
            }
        }
    except Exception as e:
        print(f"Ошибка при подключении к базе данных: {e}")
        return None

if __name__ == "__main__":
    result = check_database()
    if not result:
        sys.exit(1)
    
    # Здесь будет код для создания недостающих таблиц 