FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Создаем оптимизированную сборку
RUN npm run build

EXPOSE 3000

# Запуск Next.js в production режиме
CMD ["npm", "start"] 