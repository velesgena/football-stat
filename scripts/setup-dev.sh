#!/bin/bash

# Скрипт для настройки окружения разработки

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========== Настройка окружения разработки ==========${NC}"

# Проверяем, существует ли файл .env.development
if [ ! -f ".env.development" ]; then
    echo -e "${YELLOW}Файл .env.development не найден. Создаем из шаблона...${NC}"
    
    # Создаем .env.development из шаблона
    cat > .env.development << EOL
# Окружение
ENVIRONMENT=development
DEBUG=True

# База данных
DATABASE_URL=postgresql://admin:securepassword@db:5432/football
POSTGRES_USER=admin
POSTGRES_PASSWORD=securepassword
POSTGRES_DB=football

# Приложение
SECRET_KEY=dev_secret_key_12345
NEXT_PUBLIC_API_URL=http://localhost:8088

# Логирование
LOG_LEVEL=DEBUG
EOL
    
    echo -e "${GREEN}Файл .env.development создан.${NC}"
    echo -e "${YELLOW}Отредактируйте его при необходимости.${NC}"
fi

# Копируем .env.development в .env
echo -e "${BLUE}Копирование .env.development в .env...${NC}"
cp .env.development .env

# Запускаем контейнеры в режиме разработки
echo -e "${BLUE}Запуск контейнеров в режиме разработки...${NC}"
docker-compose down
docker-compose up -d

echo -e "${GREEN}==========================================${NC}"
echo -e "${GREEN}Среда разработки успешно настроена!${NC}"
echo -e "${GREEN}Backend API: http://localhost:8088${NC}"
echo -e "${GREEN}Frontend: http://localhost:3000${NC}"
echo -e "${GREEN}==========================================${NC}" 