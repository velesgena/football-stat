#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========== Настройка NAS для деплоя Football-Stat ==========${NC}"

# Запрашиваем данные NAS
echo -e "${YELLOW}Введите IP-адрес вашего NAS:${NC}"
read NAS_HOST

echo -e "${YELLOW}Введите SSH-порт вашего NAS (по умолчанию 22):${NC}"
read NAS_PORT
NAS_PORT=${NAS_PORT:-22}

echo -e "${YELLOW}Введите имя пользователя SSH для NAS:${NC}"
read NAS_USERNAME

# Проверка существования SSH ключей
SSH_KEY_PATH="$HOME/.ssh/id_rsa"
if [ ! -f "$SSH_KEY_PATH" ]; then
    echo -e "${YELLOW}SSH ключ не найден. Хотите создать новый? (y/n)${NC}"
    read CREATE_KEY
    if [[ $CREATE_KEY == "y" || $CREATE_KEY == "Y" ]]; then
        echo -e "${GREEN}Создание нового SSH ключа...${NC}"
        ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N ""
    else
        echo -e "${YELLOW}Введите путь к существующему SSH ключу:${NC}"
        read CUSTOM_KEY_PATH
        SSH_KEY_PATH=${CUSTOM_KEY_PATH:-$SSH_KEY_PATH}
    fi
fi

# Добавляем NAS в известные хосты
echo -e "${GREEN}Добавление NAS в known_hosts...${NC}"
ssh-keyscan -p $NAS_PORT -H "$NAS_HOST" >> ~/.ssh/known_hosts 2>/dev/null

# Проверка возможности подключения к NAS
echo -e "${GREEN}Проверка подключения к NAS...${NC}"
if ! ssh -p $NAS_PORT -o BatchMode=yes -o ConnectTimeout=5 ${NAS_USERNAME}@${NAS_HOST} echo "Connection successful" &>/dev/null; then
    echo -e "${YELLOW}Не удалось подключиться к NAS с использованием ключа.${NC}"
    echo -e "${YELLOW}Хотите добавить публичный ключ на NAS? (y/n)${NC}"
    read COPY_KEY
    if [[ $COPY_KEY == "y" || $COPY_KEY == "Y" ]]; then
        echo -e "${YELLOW}Потребуется ввести пароль пользователя NAS.${NC}"
        
        # Отображаем публичный ключ
        echo -e "${GREEN}Ваш публичный ключ:${NC}"
        cat "${SSH_KEY_PATH}.pub"
        
        echo -e "${YELLOW}Теперь будет запрошен пароль для добавления ключа на NAS.${NC}"
        ssh-copy-id -p $NAS_PORT -i "${SSH_KEY_PATH}.pub" "${NAS_USERNAME}@${NAS_HOST}"
        if [ $? -ne 0 ]; then
            echo -e "${RED}Не удалось скопировать ключ на NAS.${NC}"
            echo -e "${YELLOW}Вы можете добавить ключ вручную. Ваш публичный ключ:${NC}"
            cat "${SSH_KEY_PATH}.pub"
            echo -e "\n${YELLOW}На NAS выполните:${NC}"
            echo -e "mkdir -p ~/.ssh"
            echo -e "echo 'ВАША_СТРОКА_ПУБЛИЧНОГО_КЛЮЧА' >> ~/.ssh/authorized_keys"
            echo -e "chmod 700 ~/.ssh"
            echo -e "chmod 600 ~/.ssh/authorized_keys"
        else
            echo -e "${GREEN}Ключ успешно добавлен на NAS.${NC}"
        fi
    else
        echo -e "${YELLOW}Пропуск добавления ключа. Вам потребуется добавить ключ вручную.${NC}"
    fi
else
    echo -e "${GREEN}Соединение с NAS успешно установлено с использованием ключа.${NC}"
fi

# Создание директории проекта на NAS
echo -e "${YELLOW}Хотите создать директорию проекта на NAS? (y/n)${NC}"
read CREATE_DIR
if [[ $CREATE_DIR == "y" || $CREATE_DIR == "Y" ]]; then
    echo -e "${GREEN}Создание директории проекта на NAS...${NC}"
    ssh -p $NAS_PORT ${NAS_USERNAME}@${NAS_HOST} "mkdir -p /volume1/docker/football-stat"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Не удалось создать директорию на NAS.${NC}"
    else
        echo -e "${GREEN}Директория успешно создана на NAS.${NC}"
    fi
fi

# Проверка Docker на NAS
echo -e "${GREEN}Проверка наличия Docker на NAS...${NC}"
if ! ssh -p $NAS_PORT ${NAS_USERNAME}@${NAS_HOST} "command -v docker &> /dev/null"; then
    echo -e "${RED}Docker не найден на NAS.${NC}"
    echo -e "${YELLOW}Для установки Docker на NAS:${NC}"
    echo -e "1. Откройте Центр пакетов в DSM"
    echo -e "2. Найдите и установите пакет Docker"
    echo -e "3. После установки Docker перезапустите этот скрипт"
else
    echo -e "${GREEN}Docker найден на NAS.${NC}"
fi

# Проверка Docker Compose на NAS
echo -e "${GREEN}Проверка наличия Docker Compose на NAS...${NC}"
if ! ssh -p $NAS_PORT ${NAS_USERNAME}@${NAS_HOST} "command -v docker-compose &> /dev/null && ! command -v docker && docker compose version &> /dev/null"; then
    echo -e "${YELLOW}Docker Compose не найден на NAS.${NC}"
    echo -e "${YELLOW}Хотите установить Docker Compose на NAS? (y/n)${NC}"
    read INSTALL_COMPOSE
    if [[ $INSTALL_COMPOSE == "y" || $INSTALL_COMPOSE == "Y" ]]; then
        echo -e "${GREEN}Установка Docker Compose на NAS...${NC}"
        ssh -p $NAS_PORT ${NAS_USERNAME}@${NAS_HOST} "sudo curl -L \"https://github.com/docker/compose/releases/download/v2.24.6/docker-compose-$(uname -s)-$(uname -m)\" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose"
        if [ $? -ne 0 ]; then
            echo -e "${RED}Не удалось установить Docker Compose.${NC}"
            echo -e "${YELLOW}Вы можете установить Docker Compose вручную, следуя инструкциям:${NC}"
            echo -e "https://docs.docker.com/compose/install/linux/"
        else
            echo -e "${GREEN}Docker Compose успешно установлен на NAS.${NC}"
        fi
    fi
else
    echo -e "${GREEN}Docker Compose найден на NAS.${NC}"
fi

# Копируем шаблон .env.production
echo -e "${YELLOW}Хотите создать файл .env.production? (y/n)${NC}"
read CREATE_ENV
if [[ $CREATE_ENV == "y" || $CREATE_ENV == "Y" ]]; then
    cat > .env.production << EOL
# Окружение
ENVIRONMENT=production
DEBUG=False

# База данных
DATABASE_URL=postgresql://admin:admin_prod_password@db:5432/football_prod
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin_prod_password
POSTGRES_DB=football_prod

# Приложение
SECRET_KEY=production_secret_key_change_me
NEXT_PUBLIC_API_URL=http://${NAS_HOST}:8088

# Логирование
LOG_LEVEL=INFO
EOL
    echo -e "${GREEN}Файл .env.production создан.${NC}"
    echo -e "${YELLOW}Пожалуйста, отредактируйте файл и замените плейсхолдеры актуальными значениями.${NC}"
    
    echo -e "${YELLOW}Хотите скопировать .env.production на NAS? (y/n)${NC}"
    read COPY_ENV
    if [[ $COPY_ENV == "y" || $COPY_ENV == "Y" ]]; then
        echo -e "${GREEN}Копирование .env.production на NAS...${NC}"
        scp -P $NAS_PORT .env.production ${NAS_USERNAME}@${NAS_HOST}:/volume1/docker/football-stat/
        if [ $? -ne 0 ]; then
            echo -e "${RED}Не удалось скопировать файл на NAS.${NC}"
        else
            echo -e "${GREEN}Файл .env.production успешно скопирован на NAS.${NC}"
        fi
    fi
fi

# Инструкция по настройке GitHub Secrets
echo -e "\n${BLUE}========== Настройка GitHub Secrets ==========${NC}"
echo -e "${YELLOW}Для настройки CI/CD деплоя, вам необходимо добавить следующие секреты в GitHub:${NC}"
echo -e "${GREEN}1. NAS_HOST:${NC} ${NAS_HOST}"
echo -e "${GREEN}2. NAS_USERNAME:${NC} ${NAS_USERNAME}"
echo -e "${GREEN}3. NAS_SSH_PRIVATE_KEY:${NC} (содержимое файла ${SSH_KEY_PATH})"
echo -e "\n${YELLOW}Для автоматического создания GitHub Secrets, выполните скрипт:${NC}"
echo -e "/Volumes/docker/scripts/setup-github-secrets.sh"

echo -e "\n${BLUE}========== Настройка NAS завершена ==========${NC}"
echo -e "${GREEN}Ваш NAS готов к деплою проекта Football-Stat!${NC}" 