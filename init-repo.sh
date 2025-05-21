#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========== Инициализация Git-репозитория ==========${NC}"

# Проверка наличия Git
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git не установлен. Пожалуйста, установите Git и попробуйте снова.${NC}"
    exit 1
fi

# Проверка, не инициализирован ли уже Git
if [ -d ".git" ]; then
    echo -e "${YELLOW}Git-репозиторий уже инициализирован.${NC}"
    
    # Проверка наличия удаленного репозитория
    REMOTE_URL=$(git remote get-url origin 2>/dev/null)
    if [ $? -eq 0 ]; then
        echo -e "${YELLOW}Удаленный репозиторий уже настроен: ${REMOTE_URL}${NC}"
        echo -e "${YELLOW}Хотите перенастроить удаленный репозиторий? (y/n)${NC}"
        read RECONFIGURE_REMOTE
        if [[ $RECONFIGURE_REMOTE != "y" && $RECONFIGURE_REMOTE != "Y" ]]; then
            echo -e "${GREEN}Репозиторий оставлен без изменений.${NC}"
            exit 0
        fi
    fi
else
    # Инициализация Git-репозитория
    echo -e "${GREEN}Инициализация Git-репозитория...${NC}"
    git init
    if [ $? -ne 0 ]; then
        echo -e "${RED}Ошибка инициализации Git-репозитория.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Git-репозиторий успешно инициализирован.${NC}"
fi

# Запрос GitHub аккаунта
echo -e "${YELLOW}Введите ваш логин на GitHub:${NC}"
read GITHUB_USERNAME

# Настройка удаленного репозитория
echo -e "${GREEN}Настройка удаленного репозитория...${NC}"
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/${GITHUB_USERNAME}/football-stat.git"
if [ $? -ne 0 ]; then
    echo -e "${RED}Ошибка при настройке удаленного репозитория.${NC}"
    exit 1
fi
echo -e "${GREEN}Удаленный репозиторий успешно настроен.${NC}"

# Проверка наличия файлов для коммита
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Нет изменений для коммита.${NC}"
else
    # Подготовка и коммит изменений
    echo -e "${GREEN}Подготовка файлов для коммита...${NC}"
    git add .
    if [ $? -ne 0 ]; then
        echo -e "${RED}Ошибка при добавлении файлов в индекс.${NC}"
        exit 1
    fi
    
    echo -e "${YELLOW}Введите сообщение коммита (нажмите Enter для использования стандартного сообщения):${NC}"
    read COMMIT_MESSAGE
    if [ -z "$COMMIT_MESSAGE" ]; then
        COMMIT_MESSAGE="Настройка CI/CD для деплоя на NAS"
    fi
    
    git commit -m "$COMMIT_MESSAGE"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Ошибка при создании коммита.${NC}"
        exit 1
    fi
    echo -e "${GREEN}Коммит успешно создан.${NC}"
fi

# Запрос имени ветки
echo -e "${YELLOW}Введите имя ветки для push (нажмите Enter для использования 'main'):${NC}"
read BRANCH_NAME
if [ -z "$BRANCH_NAME" ]; then
    BRANCH_NAME="main"
fi

# Отправка изменений на GitHub
echo -e "${YELLOW}Хотите отправить изменения на GitHub сейчас? (y/n)${NC}"
read PUSH_NOW
if [[ $PUSH_NOW == "y" || $PUSH_NOW == "Y" ]]; then
    echo -e "${GREEN}Отправка изменений на GitHub...${NC}"
    git push -u origin "$BRANCH_NAME"
    if [ $? -ne 0 ]; then
        echo -e "${RED}Ошибка при отправке изменений на GitHub.${NC}"
        echo -e "${YELLOW}Возможные причины:${NC}"
        echo -e "1. Репозиторий на GitHub не существует. Создайте его сначала."
        echo -e "2. У вас нет прав на запись в репозиторий."
        echo -e "3. Вы не авторизованы на GitHub. Запустите 'git config --global user.name \"Ваше имя\"' и 'git config --global user.email \"ваш@email.com\"'."
        exit 1
    fi
    echo -e "${GREEN}Изменения успешно отправлены на GitHub.${NC}"
else
    echo -e "${YELLOW}Для отправки изменений на GitHub позже выполните:${NC}"
    echo -e "git push -u origin $BRANCH_NAME"
fi

# Проверка настройки GitHub Actions
if [ -d ".github/workflows" ]; then
    echo -e "${GREEN}Папка .github/workflows найдена. GitHub Actions уже настроены.${NC}"
else
    echo -e "${YELLOW}Папка .github/workflows не найдена. Хотите создать базовый workflow для GitHub Actions? (y/n)${NC}"
    read CREATE_WORKFLOW
    if [[ $CREATE_WORKFLOW == "y" || $CREATE_WORKFLOW == "Y" ]]; then
        mkdir -p .github/workflows
        cat > .github/workflows/deploy-to-nas.yml << EOL
name: Deploy to NAS

on:
  push:
    branches: [ "$BRANCH_NAME" ]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to NAS
        uses: appleboy/ssh-action@master
        with:
          host: \${{ secrets.NAS_HOST }}
          username: \${{ secrets.NAS_USERNAME }}
          key: \${{ secrets.NAS_SSH_PRIVATE_KEY }}
          script: |
            cd /volume1/docker/football-stat
            git pull
            docker-compose up -d --build
EOL
        echo -e "${GREEN}Создан базовый workflow в .github/workflows/deploy-to-nas.yml${NC}"
        echo -e "${YELLOW}Не забудьте настроить секреты в GitHub с помощью скрипта setup-github-secrets.sh${NC}"
    fi
fi

echo -e "\n${GREEN}Готово! Ваш проект настроен для работы с GitHub.${NC}"
echo -e "${YELLOW}Не забудьте настроить секреты для GitHub Actions с помощью скрипта:${NC}"
echo -e "/Volumes/docker/scripts/setup-github-secrets.sh"
