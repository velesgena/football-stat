#!/bin/bash

# Цвета для вывода
BLUE='\033[0;34m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Настройки для NAS
NAS_IP="192.168.1.124"
NAS_USER="nasadmin"
NAS_PROJECT_DIR="/volume1/docker/football-stat"
DOCKER_PATH="/usr/local/bin/docker"

# Проверка соединения с NAS
echo -e "${BLUE}Проверка соединения с Synology NAS (${NAS_IP})...${NC}"
if ping -c 1 $NAS_IP &> /dev/null; then
    echo -e "${GREEN}Соединение с NAS установлено${NC}"
else
    echo -e "${RED}Не удалось подключиться к NAS. Проверьте, что NAS включен и доступен.${NC}"
    exit 1
fi

# Получение root-прав для всей сессии
echo -e "${BLUE}Получение root-прав на NAS...${NC}"
ssh $NAS_USER@$NAS_IP "sudo -s true" &> /dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Root-права получены${NC}"
else
    echo -e "${RED}Не удалось получить root-права на NAS.${NC}"
    exit 1
fi

# Проверка наличия docker и docker-compose на NAS
echo -e "${BLUE}Проверка наличия Docker на NAS...${NC}"
if ssh $NAS_USER@$NAS_IP "sudo [ -f ${DOCKER_PATH} ]" &> /dev/null; then
    echo -e "${GREEN}Docker установлен на NAS${NC}"
else
    echo -e "${RED}Docker не установлен на NAS или находится не по пути ${DOCKER_PATH}. Пожалуйста, установите Docker из центра пакетов DSM.${NC}"
    exit 1
fi

# Создание директории для проекта на NAS с root-правами
echo -e "${BLUE}Создание директории для проекта на NAS...${NC}"
ssh $NAS_USER@$NAS_IP "sudo mkdir -p $NAS_PROJECT_DIR && sudo chown $NAS_USER:$NAS_USER $NAS_PROJECT_DIR"

# Копирование файлов проекта на NAS
echo -e "${BLUE}Копирование файлов проекта на NAS...${NC}"
# Исключаем node_modules, .venv и другие ненужные каталоги
rsync -av --exclude='node_modules' --exclude='.venv' --exclude='.git' \
      --exclude='frontend/.next' --exclude='__pycache__' \
      ./ $NAS_USER@$NAS_IP:$NAS_PROJECT_DIR/

# Запуск Docker Compose на NAS с root-правами
echo -e "${BLUE}Запуск проекта на NAS через Docker Compose...${NC}"
ssh $NAS_USER@$NAS_IP "cd $NAS_PROJECT_DIR && sudo $DOCKER_PATH compose up -d --build"

# Проверка статуса запущенных контейнеров
echo -e "${BLUE}Проверка статуса контейнеров...${NC}"
ssh $NAS_USER@$NAS_IP "cd $NAS_PROJECT_DIR && sudo $DOCKER_PATH compose ps"

echo -e "${GREEN}Деплой завершен! Проект доступен по адресам:${NC}"
echo -e "${GREEN}- Фронтенд: http://${NAS_IP}:3000${NC}"
echo -e "${GREEN}- API: http://${NAS_IP}:8088${NC}"
echo -e "${YELLOW}Для остановки проекта выполните:${NC}"
echo -e "${YELLOW}ssh ${NAS_USER}@${NAS_IP} \"cd ${NAS_PROJECT_DIR} && sudo $DOCKER_PATH compose down\"${NC}" 