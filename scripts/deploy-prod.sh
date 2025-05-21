#!/bin/bash

# Скрипт для настройки локального тестирования продакшн окружения

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}========== Внимание: Настройка ПРОДАКШН окружения ==========${NC}"
echo -e "${YELLOW}Вы собираетесь настроить локальное тестирование продакшн окружения.${NC}"
echo -e "${YELLOW}Это НЕ деплой на NAS, а только локальное тестирование продакшн настроек.${NC}"

# Запрашиваем подтверждение
echo -e "${RED}Вы уверены, что хотите продолжить? (y/n)${NC}"
read CONFIRM

if [[ $CONFIRM != "y" && $CONFIRM != "Y" ]]; then
    echo -e "${BLUE}Операция отменена.${NC}"
    exit 0
fi

# Проверяем, существует ли файл .env.production
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}Файл .env.production не найден. Создаем из шаблона...${NC}"
    
    # Создаем .env.production из шаблона
    cat > .env.production << EOL
# Окружение
ENVIRONMENT=production
DEBUG=False

# База данных
DATABASE_URL=postgresql://admin:PRODUCTION_PASSWORD@db:5432/football_prod
POSTGRES_USER=admin
POSTGRES_PASSWORD=PRODUCTION_PASSWORD
POSTGRES_DB=football_prod

# Приложение
SECRET_KEY=PRODUCTION_SECRET_KEY
NEXT_PUBLIC_API_URL=http://localhost:8088

# Логирование
LOG_LEVEL=INFO
EOL
    
    echo -e "${GREEN}Файл .env.production создан.${NC}"
    echo -e "${RED}ВАЖНО: Отредактируйте его перед использованием!${NC}"
    echo -e "${YELLOW}Замените заполнители на реальные значения.${NC}"
    exit 1
fi

# Копируем .env.production в .env
echo -e "${BLUE}Копирование .env.production в .env...${NC}"
cp .env.production .env

# Запускаем контейнеры в продакшн режиме
echo -e "${BLUE}Запуск контейнеров в продакшн режиме...${NC}"
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

echo -e "${RED}==========================================${NC}"
echo -e "${RED}Продакшн окружение запущено локально!${NC}"
echo -e "${RED}Backend API: http://localhost:8088${NC}"
echo -e "${RED}Frontend: http://localhost:3000${NC}"
echo -e "${RED}==========================================${NC}"
echo -e "${YELLOW}Для остановки используйте:${NC}"
echo -e "${YELLOW}docker-compose -f docker-compose.yml -f docker-compose.prod.yml down${NC}" 