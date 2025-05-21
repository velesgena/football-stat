FROM python:3.10-slim

WORKDIR /app

# Установка зависимостей
COPY requirements.txt requirements-dev.txt ./

# Разделение на зависимости для разработки и продакшена
ARG ENVIRONMENT=production
RUN pip install --no-cache-dir -r requirements.txt && \
    if [ "$ENVIRONMENT" = "development" ]; then \
        pip install --no-cache-dir -r requirements-dev.txt; \
    fi

# Добавление непривилегированного пользователя для безопасности
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Копирование кода приложения
COPY . .

# Установка правильных прав доступа для директорий приложения
RUN chown -R appuser:appuser /app

# Переключение на непривилегированного пользователя
USER appuser

EXPOSE 8088

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8088"]