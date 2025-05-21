# Football Stats

Система футбольной статистики — аналог Flashscore с отслеживанием матчей, команд, игроков и турниров в режиме реального времени.

## 🛠️ Технологии

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Redis, WebSocket
- **Frontend**: Next.js, React, TailwindCSS
- **Инфраструктура**: Docker, Docker Compose, GitHub Actions
- **Тестирование**: Pytest, TestClient, Coverage

## 🚀 Особенности

- RESTful API для всех футбольных данных
- Реал-тайм обновление через WebSocket
- Кеширование с использованием Redis
- Полное документирование API через OpenAPI (Swagger и ReDoc)
- Контейнеризация и оркестрация через Docker Compose

## 📦 Установка и запуск

### Предварительные требования

- Docker и Docker Compose
- Git

### Установка

```bash
# Клонирование репозитория
git clone <url-репозитория>
cd football-stat

# Запуск с помощью Docker Compose
docker-compose up -d
```

### Доступные сервисы

После запуска, доступны следующие сервисы:

- **API**: http://localhost:8088
- **API Документация**: http://localhost:8088/docs или http://localhost:8088/redoc
- **Frontend**: http://localhost:3000

## 💻 Разработка

### Структура проекта

```
football-stat/
├── backend/           # Backend с FastAPI
│   ├── app/           # Код приложения
│   │   ├── crud/      # CRUD операции
│   │   ├── models/    # Модели базы данных
│   │   ├── routers/   # API роутеры
│   │   ├── schemas/   # Pydantic схемы
│   │   └── utils/     # Утилиты (Redis, WebSocket, логирование)
│   ├── tests/         # Автотесты
│   └── ...
├── frontend/          # Frontend с Next.js
├── scripts/           # Вспомогательные скрипты
└── docker-compose.yml # Docker Compose конфигурация
```

### Тестирование

```bash
# Запуск тестов
docker-compose --profile testing up test

# Создание тестовой БД
docker-compose exec db psql -U admin -c "CREATE DATABASE football_test;"
```

## 📱 API и WebSocket

### REST API

API доступно по адресу `http://localhost:8088` и включает следующие ресурсы:

- `/leagues/` - Управление лигами
- `/cities/` - Управление городами
- `/stadiums/` - Управление стадионами
- `/teams/` - Управление командами
- `/players/` - Управление игроками
- `/tournaments/` - Управление турнирами
- `/matches/` - Управление матчами
- `/match_stats/` - Статистика матчей

### WebSocket

WebSocket доступен для получения обновлений в реальном времени:

- `/ws/` - Базовый WebSocket эндпоинт
- `/ws/matches` - Обновления о матчах в реальном времени

## 📝 Документация

Полная документация API доступна через Swagger UI и ReDoc:

- **Swagger**: http://localhost:8088/docs
- **ReDoc**: http://localhost:8088/redoc

## 📄 Лицензия

Этот проект распространяется под лицензией MIT. 