FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json (если есть)
COPY package*.json ./

# Чистая установка зависимостей
RUN npm ci

# Копируем исходный код
COPY . .

# Создаем оптимизированную сборку
RUN npm run build

EXPOSE 3000

# Запуск Next.js в production режиме
CMD ["npm", "start"] 