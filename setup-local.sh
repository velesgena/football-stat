#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========== Настройка локальной разработки без Docker ==========${NC}"

# Проверка наличия команд
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Команда $1 не найдена.${NC}"
        echo -e "${YELLOW}Пожалуйста, установите $2 и попробуйте снова.${NC}"
        return 1
    fi
    return 0
}

# Проверка наличия PostgreSQL
if ! check_command psql "PostgreSQL"; then
    echo -e "${YELLOW}Инструкции по установке PostgreSQL:${NC}"
    echo -e "- macOS: brew install postgresql"
    echo -e "- Linux: sudo apt install postgresql postgresql-contrib"
    echo -e "- Windows: https://www.postgresql.org/download/windows/"
    exit 1
fi

# Проверка наличия Python
if ! check_command python3 "Python 3"; then
    echo -e "${YELLOW}Инструкции по установке Python 3:${NC}"
    echo -e "- macOS: brew install python"
    echo -e "- Linux: sudo apt install python3 python3-pip"
    echo -e "- Windows: https://www.python.org/downloads/"
    exit 1
fi

# Проверка наличия Node.js
if ! check_command node "Node.js"; then
    echo -e "${YELLOW}Инструкции по установке Node.js:${NC}"
    echo -e "- macOS: brew install node"
    echo -e "- Linux: sudo apt install nodejs npm"
    echo -e "- Windows: https://nodejs.org/en/download/"
    exit 1
fi

# Проверка наличия npm
if ! check_command npm "npm"; then
    echo -e "${YELLOW}Установите npm отдельно или переустановите Node.js.${NC}"
    exit 1
fi

# Создание необходимых директорий
echo -e "${GREEN}Проверка и создание необходимых директорий...${NC}"
mkdir -p logs

# Проверка наличия виртуального окружения Python
if [ ! -d ".venv" ]; then
    echo -e "${YELLOW}Создание виртуального окружения Python...${NC}"
    python3 -m venv .venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}Ошибка при создании виртуального окружения.${NC}"
        echo -e "${YELLOW}Попробуйте установить venv:${NC}"
        echo -e "- macOS/Linux: pip3 install virtualenv"
        echo -e "- Windows: pip install virtualenv"
        exit 1
    fi
    echo -e "${GREEN}Виртуальное окружение создано.${NC}"
else
    echo -e "${GREEN}Виртуальное окружение уже существует.${NC}"
fi

# Активация виртуального окружения и установка зависимостей backend
echo -e "${GREEN}Активация виртуального окружения и установка зависимостей backend...${NC}"

if [[ "$OSTYPE" == "win"* ]]; then
    # Windows
    echo -e "${YELLOW}Для Windows выполните эти команды вручную:${NC}"
    echo -e ".venv\\Scripts\\activate"
    echo -e "cd backend && pip install -r requirements.txt"
else
    # Linux/macOS
    source .venv/bin/activate
    if [ -f "backend/requirements.txt" ]; then
        (cd backend && pip install -r requirements.txt)
        if [ $? -ne 0 ]; then
            echo -e "${RED}Ошибка при установке зависимостей backend.${NC}"
            exit 1
        fi
    else
        echo -e "${YELLOW}Файл backend/requirements.txt не найден.${NC}"
        echo -e "${YELLOW}Устанавливаем базовые зависимости...${NC}"
        pip install fastapi uvicorn sqlalchemy alembic psycopg2-binary pydantic
    fi
fi

# Установка зависимостей frontend
echo -e "${GREEN}Установка зависимостей frontend...${NC}"
if [ -f "frontend/package.json" ]; then
    (cd frontend && npm install)
    if [ $? -ne 0 ]; then
        echo -e "${RED}Ошибка при установке зависимостей frontend.${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}Файл frontend/package.json не найден.${NC}"
fi

# Проверка наличия .env-файла
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Файл .env не найден. Создание файла с настройками для локальной разработки...${NC}"
    cat > .env << EOL
# Окружение
ENVIRONMENT=development
DEBUG=True

# База данных
DATABASE_URL=postgresql://localhost/football
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=football

# Приложение
SECRET_KEY=dev_secret_key
NEXT_PUBLIC_API_URL=http://localhost:8088

# Логирование
LOG_LEVEL=DEBUG
EOL
    echo -e "${GREEN}Файл .env создан с настройками по умолчанию для локальной разработки.${NC}"
    echo -e "${YELLOW}⚠️ ВНИМАНИЕ: Проверьте и измените настройки в файле .env, особенно данные для подключения к базе данных.${NC}"
else
    echo -e "${GREEN}Файл .env уже существует.${NC}"
fi

# Создание базы данных
echo -e "${YELLOW}Хотите создать базу данных? (y/n)${NC}"
read CREATE_DB
if [[ $CREATE_DB == "y" || $CREATE_DB == "Y" ]]; then
    echo -e "${YELLOW}Введите имя пользователя PostgreSQL (по умолчанию: postgres):${NC}"
    read PG_USER
    PG_USER=${PG_USER:-postgres}
    
    echo -e "${YELLOW}Введите пароль для пользователя PostgreSQL:${NC}"
    read -s PG_PASSWORD
    
    # Создание базы данных
    echo -e "${GREEN}Создание базы данных...${NC}"
    PGPASSWORD=$PG_PASSWORD psql -U $PG_USER -c "CREATE DATABASE football;" 2>/dev/null
    if [ $? -ne 0 ]; then
        echo -e "${RED}Ошибка при создании базы данных.${NC}"
        echo -e "${YELLOW}Возможно база данных уже существует или неверные учетные данные.${NC}"
    else
        echo -e "${GREEN}База данных успешно создана.${NC}"
    fi
    
    # Инициализация базы данных
    echo -e "${GREEN}Инициализация базы данных...${NC}"
    if [ -f "create_tables.sql" ]; then
        PGPASSWORD=$PG_PASSWORD psql -U $PG_USER -d football -f create_tables.sql
        if [ $? -ne 0 ]; then
            echo -e "${RED}Ошибка при инициализации базы данных.${NC}"
        else
            echo -e "${GREEN}База данных успешно инициализирована.${NC}"
        fi
    else
        echo -e "${YELLOW}Файл create_tables.sql не найден.${NC}"
        echo -e "${YELLOW}Попытка выполнить миграции через Alembic...${NC}"
        if [ -d "backend/alembic" ]; then
            (cd backend && python -m alembic upgrade head)
            if [ $? -ne 0 ]; then
                echo -e "${RED}Ошибка при выполнении миграций.${NC}"
            else
                echo -e "${GREEN}Миграции успешно выполнены.${NC}"
            fi
        else
            echo -e "${YELLOW}Директория миграций не найдена.${NC}"
        fi
    fi
fi

# Обновление .env файла с учетными данными БД
if [[ $CREATE_DB == "y" || $CREATE_DB == "Y" ]]; then
    echo -e "${GREEN}Обновление данных для подключения к базе данных в .env...${NC}"
    sed -i.bak "s/DATABASE_URL=.*/DATABASE_URL=postgresql:\/\/$PG_USER:$PG_PASSWORD@localhost\/football/" .env
    sed -i.bak "s/POSTGRES_USER=.*/POSTGRES_USER=$PG_USER/" .env
    sed -i.bak "s/POSTGRES_PASSWORD=.*/POSTGRES_PASSWORD=$PG_PASSWORD/" .env
    rm -f .env.bak
    echo -e "${GREEN}Данные для подключения обновлены.${NC}"
fi

# Информация по запуску проекта
echo -e "\n${BLUE}========== Запуск проекта ==========${NC}"
echo -e "${YELLOW}Для запуска backend:${NC}"
echo -e "1. Активируйте виртуальное окружение:"
echo -e "   - Linux/macOS: source .venv/bin/activate"
echo -e "   - Windows: .venv\\Scripts\\activate"
echo -e "2. Перейдите в директорию backend:"
echo -e "   cd backend"
echo -e "3. Запустите сервер:"
echo -e "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8088"

echo -e "\n${YELLOW}Для запуска frontend:${NC}"
echo -e "1. Откройте новый терминал"
echo -e "2. Перейдите в директорию frontend:"
echo -e "   cd frontend"
echo -e "3. Запустите сервер разработки:"
echo -e "   npm run dev"

echo -e "\n${GREEN}После запуска, сервисы будут доступны по адресам:${NC}"
echo -e "Frontend: http://localhost:3000"
echo -e "Backend API: http://localhost:8088"
echo -e "API документация: http://localhost:8088/docs"

# Создаем скрипты для быстрого запуска
echo -e "\n${GREEN}Создание скриптов для быстрого запуска...${NC}"

# Скрипт для запуска backend
cat > start-backend.sh << EOL
#!/bin/bash
source .venv/bin/activate
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8088
EOL
chmod +x start-backend.sh

# Скрипт для запуска frontend
cat > start-frontend.sh << EOL
#!/bin/bash
cd frontend
npm run dev
EOL
chmod +x start-frontend.sh

# Для Windows
cat > start-backend.bat << EOL
@echo off
call .venv\Scripts\activate
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8088
EOL

cat > start-frontend.bat << EOL
@echo off
cd frontend
npm run dev
EOL

echo -e "${GREEN}Скрипты для быстрого запуска созданы:${NC}"
echo -e "- ./start-backend.sh - запуск backend сервера"
echo -e "- ./start-frontend.sh - запуск frontend сервера"
echo -e "\n${BLUE}========== Настройка локальной разработки завершена ==========${NC}" 