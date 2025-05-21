#!/usr/bin/env python
import os
import sys
import argparse
import subprocess

def run_command(command):
    """Запуск команды оболочки и вывод результата"""
    print(f"Выполняется: {command}")
    process = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    for line in iter(process.stdout.readline, b''):
        sys.stdout.write(line.decode('utf-8'))
    process.stdout.close()
    return process.wait()

def migrate(args):
    """Запуск миграций"""
    if args.auto:
        # Автоматическая генерация миграций на основе изменений моделей
        message = f"\"{args.message}\"" if args.message else ""
        cmd = f"alembic revision --autogenerate -m {message}"
        if run_command(cmd) != 0:
            print("Ошибка при генерации миграции")
            return
    
    # Применение миграций
    cmd = "alembic upgrade head"
    run_command(cmd)

def create_migration(args):
    """Создание нового файла миграции"""
    message = f"--message={args.message}" if args.message else ""
    cmd = f"alembic revision {message}"
    run_command(cmd)

def main():
    parser = argparse.ArgumentParser(description="Инструмент для миграции базы данных")
    subparsers = parser.add_subparsers(dest="command", help="Команды")
    
    # команда migrate
    migrate_parser = subparsers.add_parser("migrate", help="Запуск миграций")
    migrate_parser.add_argument("--auto", action="store_true", help="Автоматически генерировать миграции перед применением")
    migrate_parser.add_argument("--message", "-m", help="Сообщение для миграции")
    
    # команда create
    create_parser = subparsers.add_parser("create", help="Создать новую миграцию")
    create_parser.add_argument("--message", "-m", required=True, help="Сообщение для миграции")
    
    args = parser.parse_args()
    
    if args.command == "migrate":
        migrate(args)
    elif args.command == "create":
        create_migration(args)
    else:
        parser.print_help()

if __name__ == "__main__":
    main() 