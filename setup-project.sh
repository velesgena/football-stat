#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========== Настройка проекта Football-Stat ==========${NC}"

# Функция проверки наличия команды
check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}Команда $1 не найдена.${NC}"
        echo -e "${YELLOW}Пожалуйста, установите $2 и попробуйте снова.${NC}"
        return 1
    fi
    return 0
}

# Проверка наличия Docker
if ! check_command docker "Docker"; then
    echo -e "${YELLOW}Инструкции по установке Docker:${NC}"
    echo -e "- macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo -e "- Linux: https://docs.docker.com/engine/install/"
    echo -e "- Windows: https://docs.docker.com/desktop/install/windows-install/"
    exit 1
fi

# Проверка наличия Docker Compose
if ! check_command docker-compose "Docker Compose" && ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}Инструкции по установке Docker Compose:${NC}"
    echo -e "https://docs.docker.com/compose/install/"
    exit 1
fi

# Проверка и создание необходимых директорий
echo -e "${GREEN}Проверка и создание необходимых директорий...${NC}"
mkdir -p logs

# Проверка наличия .env-файла
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Файл .env не найден. Создание файла с настройками по умолчанию...${NC}"
    cat > .env << EOL
# Окружение
ENVIRONMENT=development
DEBUG=True

# База данных
DATABASE_URL=postgresql://admin:admin@db:5432/football
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=football

# Приложение
SECRET_KEY=dev_secret_key_replace_in_production
NEXT_PUBLIC_API_URL=http://localhost:8088

# Логирование
LOG_LEVEL=DEBUG
EOL
    echo -e "${GREEN}Файл .env создан с настройками по умолчанию.${NC}"
else
    echo -e "${GREEN}Файл .env уже существует.${NC}"
fi

# Проверка подключения к Docker
echo -e "${GREEN}Проверка подключения к Docker...${NC}"
if ! docker info &> /dev/null; then
    echo -e "${RED}Не удалось подключиться к Docker. Проверьте, запущен ли Docker.${NC}"
    exit 1
fi

# Спрашиваем пользователя, хочет ли он собрать и запустить проект
echo -e "${YELLOW}Хотите собрать и запустить проект сейчас? (y/n)${NC}"
read BUILD_AND_RUN

if [[ $BUILD_AND_RUN == "y" || $BUILD_AND_RUN == "Y" ]]; then
    echo -e "${GREEN}Сборка и запуск проекта...${NC}"
    
    # Остановка и удаление существующих контейнеров
    echo -e "${YELLOW}Остановка существующих контейнеров, если они запущены...${NC}"
    docker-compose down 2>/dev/null

    # Сборка и запуск контейнеров
    echo -e "${GREEN}Сборка и запуск контейнеров...${NC}"
    docker-compose up --build -d
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Ошибка при запуске контейнеров.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}Контейнеры успешно запущены.${NC}"
    
    # Ожидание запуска базы данных
    echo -e "${YELLOW}Ожидание запуска базы данных (20 секунд)...${NC}"
    sleep 20
    
    # Проверка создания таблиц
    echo -e "${GREEN}Проверка и создание таблиц базы данных...${NC}"
    if [ -f "create_tables.sql" ]; then
        docker-compose exec db psql -U admin -d football -f /app/create_tables.sql
        if [ $? -ne 0 ]; then
            echo -e "${RED}Ошибка при создании таблиц.${NC}"
        else
            echo -e "${GREEN}Таблицы успешно созданы.${NC}"
        fi
    else
        echo -e "${YELLOW}Файл create_tables.sql не найден. Пропуск создания таблиц.${NC}"
    fi
    
    echo -e "${GREEN}Проект запущен и доступен по адресу:${NC}"
    echo -e "Frontend: http://localhost:3000"
    echo -e "Backend API: http://localhost:8088"
else
    echo -e "${YELLOW}Вы можете запустить проект позже с помощью команды:${NC}"
    echo -e "docker-compose up --build -d"
fi

# Информация о полезных командах
echo -e "\n${BLUE}========== Полезные команды ==========${NC}"
echo -e "${YELLOW}Запуск проекта:${NC} docker-compose up -d"
echo -e "${YELLOW}Остановка проекта:${NC} docker-compose down"
echo -e "${YELLOW}Просмотр логов:${NC} docker-compose logs -f"
echo -e "${YELLOW}Перезапуск backend:${NC} docker-compose restart backend"
echo -e "${YELLOW}Перезапуск frontend:${NC} docker-compose restart frontend"
echo -e "${YELLOW}Подключение к базе данных:${NC} docker-compose exec db psql -U admin -d football"

echo -e "\n${GREEN}Для настройки деплоя на NAS, выполните скрипт:${NC}"
echo -e "/Volumes/docker/scripts/setup-github-secrets.sh"

echo -e "\n${GREEN}Для работы с Git-репозиторием, выполните скрипт:${NC}"
echo -e "./init-repo.sh"

echo -e "\n${BLUE}========== Настройка завершена ==========${NC}" 