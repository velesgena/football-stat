# Бэкенд Football Stats

## Установка

### Локальное окружение

1. Создайте виртуальное окружение:
```bash
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
.venv\Scripts\activate     # Windows
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Для разработки
```

3. Запустите сервер:
```bash
uvicorn app.main:app --reload
```

### Docker

```bash
docker-compose up -d api
```

## Тестирование

### Локальное тестирование

```bash
# Запуск всех тестов
pytest

# Запуск с покрытием кода
pytest --cov=app

# Запуск с отчётом о покрытии
pytest --cov=app --cov-report=html
```

### Тестирование в Docker

```bash
# Запуск тестового контейнера
docker-compose --profile testing up test

# Запуск с созданием тестовой БД
docker-compose --profile testing up -d db
docker-compose exec db psql -U admin -c "CREATE DATABASE football_test;"
docker-compose --profile testing up test
```

## API Документация

После запуска сервера документация API доступна по адресам:
- Swagger UI: http://localhost:8088/docs
- ReDoc: http://localhost:8088/redoc

## Разработка

### Линтинг и форматирование

```bash
# Проверка стиля кода
flake8 app

# Форматирование кода
black app

# Сортировка импортов
isort app
```

## Структура проекта

```
app/
├── main.py           # Главный файл приложения
├── database.py       # Настройка базы данных
├── models/           # SQLAlchemy модели
├── schemas/          # Pydantic схемы данных
├── crud/             # Операции с базой данных
└── routers/          # FastAPI роутеры
```

## Миграции базы данных

Этот проект использует Alembic для миграций базы данных. Миграции помогают отслеживать изменения схемы базы данных и применять их контролируемым образом.

### Настройка

1. Убедитесь, что Alembic установлен:
   ```
   pip install -r requirements.txt
   ```

2. Система миграций уже настроена с:
   - `alembic.ini` - Основной конфигурационный файл
   - `migrations/` - Директория с миграционными скриптами
   - `migrations/env.py` - Конфигурация окружения
   - `migrations/versions/` - Директория, где хранятся миграционные скрипты

### Использование миграций

Мы создали простой вспомогательный скрипт (`migrator.py`), чтобы упростить работу с миграциями:

#### Автоматическая генерация и применение миграций

```bash
# Генерация миграций на основе изменений моделей и их применение
python migrator.py migrate --auto -m "Описание изменений"
```

#### Создание пустой миграции

```bash
# Создание нового пустого файла миграции
python migrator.py create -m "Описание новой миграции"
```

#### Применение ожидающих миграций

```bash
# Применение всех ожидающих миграций
python migrator.py migrate
```

### Настройка Docker

При запуске в Docker, миграции могут быть применены автоматически во время запуска контейнера. Это настроено в Dockerfile. 