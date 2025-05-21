#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========== Настройка локального фронтенда ==========${NC}"

# Проверка наличия Node.js и npm
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js не установлен. Пожалуйста, установите Node.js и попробуйте снова.${NC}"
    echo -e "${YELLOW}Инструкции по установке Node.js:${NC}"
    echo -e "- macOS: brew install node"
    echo -e "- Linux: sudo apt install nodejs npm"
    echo -e "- Windows: https://nodejs.org/en/download/"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm не установлен. Пожалуйста, установите npm и попробуйте снова.${NC}"
    exit 1
fi

# Переходим в директорию фронтенда
cd frontend

# Создаем .env.local файл для фронтенда
echo -e "${GREEN}Создание .env.local файла для фронтенда...${NC}"
cat > .env.local << EOL
NEXT_PUBLIC_API_URL=http://localhost:8088
NEXT_PUBLIC_WS_URL=ws://localhost:8088/ws
EOL
echo -e "${GREEN}Файл .env.local создан с настройками для локальной разработки.${NC}"

# Проверка и исправление версии Next.js в package.json
echo -e "${GREEN}Проверка и обновление версии Next.js...${NC}"
NEXT_VERSION=$(grep '"next":' package.json | cut -d'"' -f4)
if [[ "$NEXT_VERSION" == *"15."* ]]; then
    echo -e "${YELLOW}Обнаружена несовместимая версия Next.js (${NEXT_VERSION}). Заменяем на стабильную версию...${NC}"
    # Используем sed для замены версии Next.js
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS требует флаг -i ''
        sed -i '' 's/"next": "[^"]*"/"next": "13.5.6"/g' package.json
    else
        # Linux не требует дополнительных аргументов
        sed -i 's/"next": "[^"]*"/"next": "13.5.6"/g' package.json
    fi
    echo -e "${GREEN}Версия Next.js изменена на 13.5.6.${NC}"
fi

# Удаляем node_modules и package-lock.json для чистой установки
echo -e "${YELLOW}Хотите выполнить чистую установку зависимостей? (удалить node_modules и package-lock.json) (y/n)${NC}"
read CLEAN_INSTALL
if [[ $CLEAN_INSTALL == "y" || $CLEAN_INSTALL == "Y" ]]; then
    echo -e "${GREEN}Удаление node_modules и package-lock.json...${NC}"
    rm -rf node_modules package-lock.json
    echo -e "${GREEN}Установка зависимостей...${NC}"
    npm install
else
    echo -e "${GREEN}Установка зависимостей...${NC}"
    npm install
fi

# Запуск фронтенда в режиме разработки
echo -e "${YELLOW}Хотите запустить фронтенд сейчас? (y/n)${NC}"
read START_FRONTEND
if [[ $START_FRONTEND == "y" || $START_FRONTEND == "Y" ]]; then
    echo -e "${GREEN}Запуск фронтенда...${NC}"
    npm run dev
else
    echo -e "${YELLOW}Для запуска фронтенда позже выполните:${NC}"
    echo -e "cd frontend && npm run dev"
fi 