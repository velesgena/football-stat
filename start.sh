#!/bin/bash

# Определяем пути
PROJECT_DIR=$(pwd)
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

# Цвета для вывода
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========== Запуск проекта Football-Stat ==========${NC}"

# Проверка наличия активированного виртуального окружения
if [[ -z "$VIRTUAL_ENV" ]]; then
    echo -e "${YELLOW}Виртуальное окружение не активировано.${NC}"
    
    # Проверка наличия venv
    if [[ -d "$PROJECT_DIR/.venv" ]]; then
        echo -e "${GREEN}Активация виртуального окружения...${NC}"
        source "$PROJECT_DIR/.venv/bin/activate"
    else
        echo -e "${RED}Виртуальное окружение не найдено. Создайте его с помощью команды:${NC}"
        echo -e "${YELLOW}python -m venv .venv && source .venv/bin/activate${NC}"
        exit 1
    fi
fi

# Запуск бэкенда в фоновом режиме
echo -e "${BLUE}Запуск бэкенда на порту 8088...${NC}"
cd "$BACKEND_DIR" && python -m uvicorn app.main:app --host 0.0.0.0 --reload --port 8088 --log-level=debug &
BACKEND_PID=$!

# Небольшая пауза для запуска бэкенда
sleep 2

# Запуск фронтенда
echo -e "${BLUE}Запуск фронтенда...${NC}"
cd "$FRONTEND_DIR" && npm run dev &
FRONTEND_PID=$!

# Функция для корректного завершения процессов при выходе
cleanup() {
    echo -e "${YELLOW}Завершение работы приложения...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo -e "${GREEN}Приложение остановлено.${NC}"
    exit 0
}

# Обработка прерываний
trap cleanup SIGINT SIGTERM

# Определяем IP-адрес для вывода внешнего доступа
if [[ "$OSTYPE" == "darwin"* ]]; then
    IP=$(ipconfig getifaddr en0)
    if [[ -z "$IP" ]]; then
        IP=$(ipconfig getifaddr en1)
    fi
    if [[ -z "$IP" ]]; then
        IP=$(ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
    fi
else
    IP=$(hostname -I | awk '{print $1}')
fi
if [[ -z "$IP" ]]; then
    IP="localhost"
fi

echo -e "${GREEN}Приложение запущено!${NC}"
echo -e "${GREEN}Бэкенд: http://192.168.1.124:8088${NC}"
echo -e "${GREEN}Фронтенд: http://192.168.1.124:3000${NC}"
echo -e "${GREEN}Внешний доступ: http://$IP:3000${NC}"
echo -e "${YELLOW}Для остановки нажмите Ctrl+C${NC}"

# Держим скрипт запущенным, чтобы можно было завершить его через Ctrl+C
wait 