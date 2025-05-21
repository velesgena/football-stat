/**
 * Утилиты для обработки ошибок API
 */

// Функция для форматирования текста ошибки
export const formatErrorMessage = (error) => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.message && error.message.includes('Network Error')) {
    return 'Ошибка сети. Пожалуйста, проверьте подключение к интернету.';
  }
  
  if (error.message) {
    return error.message;
  }
  
  if (error.error) {
    return error.error;
  }
  
  if (typeof error === 'object') {
    try {
      return JSON.stringify(error);
    } catch {
      return 'Произошла неизвестная ошибка';
    }
  }
  
  return 'Произошла неизвестная ошибка';
};

// Функция для детального логирования ошибок
export const logDetailedError = (error, context = '') => {
  console.group(`Детали ошибки ${context}:`);
  
  console.error('Объект ошибки:', error);
  
  // Логирование информации об ответе
  if (error.response) {
    console.error('Статус ответа:', error.response.status);
    console.error('Данные ответа:', error.response.data);
    console.error('Заголовки ответа:', error.response.headers);
  } 
  // Логирование информации о запросе при отсутствии ответа
  else if (error.request) {
    console.error('Запрос отправлен, но ответ не получен');
    console.error('Объект запроса:', error.request);
  }
  
  // Логирование конфигурации запроса
  if (error.config) {
    console.error('Конфигурация запроса:', {
      url: error.config.url,
      method: error.config.method,
      headers: error.config.headers,
      params: error.config.params,
      data: error.config.data
    });
  }
  
  console.groupEnd();
};

// Функция для прямого вызова API в обход основного клиента
export const tryDirectApiCall = async (url, options = {}) => {
  try {
    const { method = 'GET', data, params } = options;
    
    // Формируем URL с параметрами
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    // Используем текущий хост или localhost по умолчанию
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    const apiBaseUrl = `http://${hostname}:8088`;
    const fullUrl = `${apiBaseUrl}${url}${queryString}`;
    
    console.log(`Выполняем прямой API запрос: ${method} ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('Ответ от прямого API запроса:', responseData);
    return responseData;
  } catch (error) {
    console.error('Ошибка при прямом вызове API:', error);
    throw error;
  }
};

// Функция для повторных попыток выполнения запроса
export const retryRequest = async (requestFn, maxRetries = 2, baseDelay = 1500) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Проверяем, стоит ли делать повторную попытку
      const shouldRetry = (
        attempt < maxRetries &&
        (
          (error.response && error.response.status >= 500) ||
          error.message?.includes('Network Error') ||
          error.code === 'ECONNABORTED'
        )
      );
      
      if (!shouldRetry) {
        break;
      }
      
      // Экспоненциальная задержка перед следующей попыткой
      const delay = baseDelay * Math.pow(1.5, attempt);
      console.log(`Повторная попытка запроса... (попытка ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

// Функция для создания расширенного объекта ошибки
export const createEnhancedError = (error, url, params) => {
  const enhancedError = new Error(error.message || 'Неизвестная ошибка');
  enhancedError.status = error.response?.status;
  enhancedError.info = error.response?.data;
  enhancedError.serverMessage = error.serverMessage || 'Ошибка сервера';
  enhancedError.url = url;
  enhancedError.params = params;
  enhancedError.originalError = error;
  
  return enhancedError;
};

// Функция для определения, выполняется ли код в браузере
export function isBrowser() {
  return typeof window !== 'undefined';
}

// Безопасный парсинг JSON
export function safeParseJson(jsonString, fallback = {}) {
  if (!jsonString) return fallback;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error('Error parsing JSON:', e);
    return fallback;
  }
}

// Получение сообщения об ошибке с учетом всех возможных форматов
export function getErrorMessage(error) {
  if (!error) return 'Unknown error';
  
  // Проверяем наличие прямого запроса
  if (error.directRequest) {
    return `Ошибка прямого запроса к ${error.directUrl}: ${error.message}`;
  }
  
  // Проверяем ответ API
  if (error.response && error.response.data) {
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    if (error.response.data.detail) {
      return error.response.data.detail;
    }
    if (error.response.data.message) {
      return error.response.data.message;
    }
    return JSON.stringify(error.response.data);
  }
  
  // Проверяем сетевую ошибку
  if (error.message && error.message.includes('Network Error')) {
    return 'Ошибка сети. Проверьте подключение к интернету и доступность сервера.';
  }
  
  // Проверяем обычное сообщение об ошибке
  if (error.message) {
    return error.message;
  }
  
  // Запасной вариант
  return 'Произошла непредвиденная ошибка';
} 