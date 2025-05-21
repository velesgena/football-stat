@echo off
echo ========== Обновление конфигурации Next.js ==========

set PROJECT_DIR=%cd%
set FRONTEND_DIR=%PROJECT_DIR%\frontend
set CONFIG_FILE=%FRONTEND_DIR%\next.config.js

if not exist "%CONFIG_FILE%" (
    echo Файл конфигурации не найден: %CONFIG_FILE%
    exit /b 1
)

:: Порт API для замены
set API_PORT=%1
if "%API_PORT%"=="" (
    set API_PORT=8088
)

echo Обновление порта API на http://localhost:%API_PORT%

:: Создание временного файла с новой конфигурацией
powershell -Command "(Get-Content '%CONFIG_FILE%') -replace 'http://localhost:[0-9]+/', 'http://localhost:%API_PORT%/' | Set-Content '%CONFIG_FILE%.tmp'"
move /y "%CONFIG_FILE%.tmp" "%CONFIG_FILE%" > nul

echo Конфигурация обновлена. Текущий API URL: http://localhost:%API_PORT%/
echo Перезапустите фронтенд, чтобы изменения вступили в силу. 