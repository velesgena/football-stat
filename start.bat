@echo off
echo ========== Запуск проекта Football-Stat ==========

set PROJECT_DIR=%cd%
set BACKEND_DIR=%PROJECT_DIR%\backend
set FRONTEND_DIR=%PROJECT_DIR%\frontend

:: Проверяем наличие виртуального окружения
if exist "%PROJECT_DIR%\.venv\Scripts\activate.bat" (
    echo Активация виртуального окружения...
    call "%PROJECT_DIR%\.venv\Scripts\activate.bat"
) else (
    echo Виртуальное окружение не найдено. Создайте его с помощью команды:
    echo python -m venv .venv
    exit /b 1
)

:: Запуск бэкенда в новом окне
echo Запуск бэкенда на порту 8088...
start cmd /k "cd %BACKEND_DIR% && python -m uvicorn app.main:app --reload --port 8088"

:: Небольшая пауза для запуска бэкенда
timeout /t 3 /nobreak > nul

:: Запуск фронтенда в новом окне
echo Запуск фронтенда...
start cmd /k "cd %FRONTEND_DIR% && npm run dev"

echo.
echo Приложение запущено!
echo Бэкенд: http://192.168.1.124:8088
echo Фронтенд: http://192.168.1.124:3000
echo.
echo Для остановки закройте окна командной строки или нажмите Ctrl+C 