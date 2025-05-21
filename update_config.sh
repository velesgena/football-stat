#!/bin/bash

# Определяем пути
PROJECT_DIR=$(pwd)
FRONTEND_DIR="$PROJECT_DIR/frontend"
CONFIG_FILE="$FRONTEND_DIR/next.config.js"

# Цвета для вывода
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========== Обновление конфигурации Next.js ==========${NC}"

# Проверка наличия файла конфигурации
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo -e "${RED}Файл конфигурации не найден: $CONFIG_FILE${NC}"
    exit 1
fi

# Порт API для замены
API_PORT=$1
if [[ -z "$API_PORT" ]]; then
    API_PORT="8088"  # По умолчанию используем порт 8088
fi

echo -e "${YELLOW}Обновление порта API на http://localhost:$API_PORT${NC}"

# Обновление файла конфигурации
# Используем sed для замены порта в файле
if [[ "$(uname)" == "Darwin" ]]; then  # macOS
    sed -i '' "s|http://localhost:[0-9]\+/|http://localhost:$API_PORT/|g" "$CONFIG_FILE"
else  # Linux и другие Unix-подобные системы
    sed -i "s|http://localhost:[0-9]\+/|http://localhost:$API_PORT/|g" "$CONFIG_FILE"
fi

echo -e "${GREEN}Конфигурация обновлена. Текущий API URL: http://localhost:$API_PORT/${NC}"
echo -e "${YELLOW}Перезапустите фронтенд, чтобы изменения вступили в силу.${NC}" 