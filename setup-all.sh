#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========== Мастер настройки проекта Football-Stat ==========${NC}"
echo -e "${YELLOW}Этот скрипт проведет вас через полный процесс настройки проекта.${NC}"

# Делаем скрипты исполняемыми, если они еще не исполняемые
chmod +x init-repo.sh setup-project.sh setup-nas.sh setup-local.sh setup-frontend-local.sh

# Выбор типа настройки
echo -e "\n${BLUE}Выберите тип настройки:${NC}"
echo -e "1. ${YELLOW}Полная контейнеризация (Docker для всех компонентов)${NC}"
echo -e "2. ${YELLOW}Гибридный подход (Docker для бэкенда и БД, локальный фронтенд)${NC}"
echo -e "3. ${YELLOW}Полностью локальная настройка (без Docker)${NC}"
read -p "Выберите вариант (1/2/3): " SETUP_TYPE

case $SETUP_TYPE in
  1)
    # Полная контейнеризация
    echo -e "\n${BLUE}Выбрана полная контейнеризация.${NC}"
    
    # Шаг 1: Настройка локального проекта с Docker
    echo -e "\n${BLUE}Шаг 1: Настройка локального проекта${NC}"
    echo -e "${YELLOW}Хотите настроить локальный проект с Docker? (y/n)${NC}"
    read SETUP_LOCAL
    if [[ $SETUP_LOCAL == "y" || $SETUP_LOCAL == "Y" ]]; then
        ./setup-project.sh
        if [ $? -ne 0 ]; then
            echo -e "${RED}Произошла ошибка при настройке локального проекта.${NC}"
            echo -e "${YELLOW}Хотите продолжить настройку? (y/n)${NC}"
            read CONTINUE
            if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
                echo -e "${RED}Настройка прервана.${NC}"
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}Пропуск настройки локального проекта.${NC}"
    fi
    ;;
    
  2)
    # Гибридный подход
    echo -e "\n${BLUE}Выбран гибридный подход.${NC}"
    
    # Запуск бэкенда и БД в Docker
    echo -e "\n${BLUE}Настройка бэкенда с Docker${NC}"
    echo -e "${YELLOW}Хотите настроить и запустить бэкенд и БД в Docker? (y/n)${NC}"
    read SETUP_BACKEND
    if [[ $SETUP_BACKEND == "y" || $SETUP_BACKEND == "Y" ]]; then
        docker-compose down && docker-compose up --build -d db redis api
        if [ $? -ne 0 ]; then
            echo -e "${RED}Произошла ошибка при запуске бэкенда в Docker.${NC}"
            echo -e "${YELLOW}Хотите продолжить настройку? (y/n)${NC}"
            read CONTINUE
            if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
                echo -e "${RED}Настройка прервана.${NC}"
                exit 1
            fi
        else
            echo -e "${GREEN}Бэкенд и база данных успешно запущены в Docker.${NC}"
        fi
    else
        echo -e "${YELLOW}Пропуск настройки бэкенда в Docker.${NC}"
    fi
    
    # Настройка фронтенда локально
    echo -e "\n${BLUE}Настройка фронтенда локально${NC}"
    echo -e "${YELLOW}Хотите настроить фронтенд локально? (y/n)${NC}"
    read SETUP_FRONTEND
    if [[ $SETUP_FRONTEND == "y" || $SETUP_FRONTEND == "Y" ]]; then
        ./setup-frontend-local.sh
        if [ $? -ne 0 ]; then
            echo -e "${RED}Произошла ошибка при настройке фронтенда.${NC}"
            echo -e "${YELLOW}Хотите продолжить настройку? (y/n)${NC}"
            read CONTINUE
            if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
                echo -e "${RED}Настройка прервана.${NC}"
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}Пропуск настройки фронтенда.${NC}"
    fi
    ;;
    
  3)
    # Полностью локальная настройка
    echo -e "\n${BLUE}Выбрана полностью локальная настройка.${NC}"
    
    # Шаг 1: Настройка локального проекта без Docker
    echo -e "\n${BLUE}Шаг 1: Настройка локального проекта без Docker${NC}"
    echo -e "${YELLOW}Хотите настроить локальный проект без Docker? (y/n)${NC}"
    read SETUP_LOCAL_NO_DOCKER
    if [[ $SETUP_LOCAL_NO_DOCKER == "y" || $SETUP_LOCAL_NO_DOCKER == "Y" ]]; then
        ./setup-local.sh
        if [ $? -ne 0 ]; then
            echo -e "${RED}Произошла ошибка при настройке локального проекта.${NC}"
            echo -e "${YELLOW}Хотите продолжить настройку? (y/n)${NC}"
            read CONTINUE
            if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
                echo -e "${RED}Настройка прервана.${NC}"
                exit 1
            fi
        fi
    else
        echo -e "${YELLOW}Пропуск настройки локального проекта.${NC}"
    fi
    ;;
    
  *)
    echo -e "${RED}Некорректный выбор.${NC}"
    exit 1
    ;;
esac

# Шаг 2: Настройка Git-репозитория
echo -e "\n${BLUE}Шаг 2: Настройка Git-репозитория${NC}"
echo -e "${YELLOW}Хотите настроить Git-репозиторий? (y/n)${NC}"
read SETUP_GIT
if [[ $SETUP_GIT == "y" || $SETUP_GIT == "Y" ]]; then
    ./init-repo.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}Произошла ошибка при настройке Git-репозитория.${NC}"
        echo -e "${YELLOW}Хотите продолжить настройку? (y/n)${NC}"
        read CONTINUE
        if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
            echo -e "${RED}Настройка прервана.${NC}"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}Пропуск настройки Git-репозитория.${NC}"
fi

# Шаг 3: Настройка NAS
echo -e "\n${BLUE}Шаг 3: Настройка NAS для деплоя${NC}"
echo -e "${YELLOW}Хотите настроить NAS для деплоя? (y/n)${NC}"
read SETUP_NAS
if [[ $SETUP_NAS == "y" || $SETUP_NAS == "Y" ]]; then
    ./setup-nas.sh
    if [ $? -ne 0 ]; then
        echo -e "${RED}Произошла ошибка при настройке NAS.${NC}"
        echo -e "${YELLOW}Хотите продолжить настройку? (y/n)${NC}"
        read CONTINUE
        if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
            echo -e "${RED}Настройка прервана.${NC}"
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}Пропуск настройки NAS.${NC}"
fi

# Шаг 4: Настройка GitHub Secrets
echo -e "\n${BLUE}Шаг 4: Настройка GitHub Secrets${NC}"
echo -e "${YELLOW}Хотите настроить GitHub Secrets для CI/CD? (y/n)${NC}"
read SETUP_SECRETS
if [[ $SETUP_SECRETS == "y" || $SETUP_SECRETS == "Y" ]]; then
    if [ -f "/Volumes/docker/scripts/setup-github-secrets.sh" ]; then
        /Volumes/docker/scripts/setup-github-secrets.sh
        if [ $? -ne 0 ]; then
            echo -e "${RED}Произошла ошибка при настройке GitHub Secrets.${NC}"
            echo -e "${YELLOW}Продолжаем настройку.${NC}"
        fi
    else
        echo -e "${RED}Скрипт setup-github-secrets.sh не найден.${NC}"
        echo -e "${YELLOW}Пожалуйста, выполните настройку GitHub Secrets вручную согласно инструкции в DEPLOYMENT.md.${NC}"
    fi
else
    echo -e "${YELLOW}Пропуск настройки GitHub Secrets.${NC}"
fi

# Заключение
echo -e "\n${BLUE}========== Настройка завершена ==========${NC}"
echo -e "${GREEN}Настройка проекта Football-Stat завершена!${NC}"

# Вывод информации в зависимости от выбранного типа настройки
case $SETUP_TYPE in
  1)
    echo -e "\n${BLUE}Проект настроен с полной контейнеризацией.${NC}"
    echo -e "${YELLOW}Для запуска всех сервисов выполните:${NC}"
    echo -e "docker-compose up -d"
    ;;
  2)
    echo -e "\n${BLUE}Проект настроен с гибридным подходом.${NC}"
    echo -e "${YELLOW}Бэкенд и БД запущены в Docker. Для управления контейнерами:${NC}"
    echo -e "docker-compose up -d db redis api  # Запуск"
    echo -e "docker-compose down               # Остановка"
    echo -e "\n${YELLOW}Для запуска фронтенда локально:${NC}"
    echo -e "cd frontend && npm run dev"
    ;;
  3)
    echo -e "\n${BLUE}Проект настроен для полностью локальной разработки.${NC}"
    echo -e "${YELLOW}Для запуска бэкенда:${NC}"
    echo -e "./start-backend.sh"
    echo -e "\n${YELLOW}Для запуска фронтенда:${NC}"
    echo -e "./start-frontend.sh"
    ;;
esac

# Инструкции по следующим действиям
echo -e "\n${BLUE}Следующие шаги:${NC}"
echo -e "1. ${YELLOW}Изучите документацию в файле DEPLOYMENT.md${NC}"
echo -e "2. ${YELLOW}При необходимости отредактируйте файлы конфигурации${NC}"
echo -e "3. ${YELLOW}Отправьте изменения в GitHub: git push -u origin main${NC}"
echo -e "\n${GREEN}Удачной разработки!${NC}" 