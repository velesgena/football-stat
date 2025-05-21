#!/usr/bin/env python3
import os
import sys
import psycopg2
from alembic.config import Config
from alembic.script import ScriptDirectory
from alembic.runtime.migration import MigrationContext
from sqlalchemy import create_engine, text

# Получаем URL базы данных из переменной окружения или используем значение по умолчанию
database_url = os.getenv("DATABASE_URL", "postgresql://admin:pam@192.168.1.124:5433/football")

def get_revision_ids():
    """Получаем ID всех миграций из директории миграций"""
    alembic_cfg = Config("alembic.ini")
    script = ScriptDirectory.from_config(alembic_cfg)
    revisions = []
    
    for revision in script.walk_revisions():
        revisions.append(revision.revision)
    
    # Сортируем в порядке применения (от старых к новым)
    revisions.reverse()
    return revisions

def mark_migrations_as_complete():
    """Отмечаем все миграции как выполненные в базе данных"""
    try:
        # Подключаемся к базе данных
        engine = create_engine(database_url)
        conn = engine.connect()
        
        # Проверяем наличие таблицы alembic_version
        check_table = text("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'alembic_version'
        );
        """)
        
        table_exists = conn.execute(check_table).scalar()
        
        # Если таблицы нет, создаем ее
        if not table_exists:
            print("Создание таблицы alembic_version...")
            create_table = text("""
            CREATE TABLE alembic_version (
                version_num VARCHAR(32) NOT NULL, 
                CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num)
            );
            """)
            conn.execute(create_table)
            conn.commit()
        
        # Получаем список всех миграций
        revisions = get_revision_ids()
        
        if not revisions:
            print("Миграций не найдено.")
            return
        
        # Берем последнюю миграцию (самую новую)
        latest_revision = revisions[-1]
        
        # Обновляем/вставляем запись в alembic_version
        print(f"Отмечаем последнюю миграцию ({latest_revision}) как выполненную...")
        
        # Сначала проверяем, есть ли уже запись
        check_version = text("SELECT count(*) FROM alembic_version;")
        count = conn.execute(check_version).scalar()
        
        if count > 0:
            # Обновляем существующую запись
            update_version = text("UPDATE alembic_version SET version_num = :version;")
            conn.execute(update_version, {"version": latest_revision})
        else:
            # Вставляем новую запись
            insert_version = text("INSERT INTO alembic_version (version_num) VALUES (:version);")
            conn.execute(insert_version, {"version": latest_revision})
        
        conn.commit()
        conn.close()
        
        print(f"Все миграции до {latest_revision} отмечены как выполненные.")
        
    except Exception as e:
        print(f"Ошибка при маркировке миграций: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = mark_migrations_as_complete()
    if not success:
        sys.exit(1)
    print("Операция завершена успешно!") 