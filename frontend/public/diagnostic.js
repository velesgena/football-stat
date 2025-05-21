/**
 * Инструмент диагностики API для Football Stats
 * 
 * Для использования скопируйте весь этот файл и вставьте его в консоль браузера.
 */

console.log('%c 🔍 Football Stats API Diagnostic Tool 🔍', 'background: #122; color: #0ff; font-size: 16px; padding: 5px 10px; border-radius: 5px;');

// Проверка доступности API через Next.js proxy
async function checkProxiedAPI() {
  console.group('1. Проверка API через Next.js прокси (/api/)');
  
  try {
    const response = await fetch('/api/');
    const status = response.status;
    console.log(`Статус ответа: ${status}`);
    
    let data;
    try {
      data = await response.json();
      console.log('Ответ:', data);
    } catch (e) {
      const text = await response.text();
      console.log('Ответ (текст):', text);
    }
    
    if (response.ok) {
      console.log('%c ✓ API через Next.js прокси доступен', 'color: green; font-weight: bold');
    } else {
      console.log('%c ✗ API через Next.js прокси вернул ошибку', 'color: red; font-weight: bold');
    }
  } catch (error) {
    console.error('Ошибка запроса:', error);
    console.log('%c ✗ Ошибка при обращении к API через Next.js прокси', 'color: red; font-weight: bold');
  }
  
  console.groupEnd();
}

// Проверка прямого доступа к API
async function checkDirectAPI() {
  console.group('2. Проверка прямого доступа к API');
  
  try {
    const response = await fetch('http://192.168.1.124:8088');
    const status = response.status;
    console.log(`Статус ответа: ${status}`);
    
    let data;
    try {
      data = await response.json();
      console.log('Ответ:', data);
    } catch (e) {
      const text = await response.text();
      console.log('Ответ (текст):', text);
    }
    
    if (response.ok) {
      console.log('%c ✓ Прямой доступ к API работает', 'color: green; font-weight: bold');
    } else {
      console.log('%c ✗ Прямой доступ к API вернул ошибку', 'color: red; font-weight: bold');
    }
  } catch (error) {
    console.error('Ошибка запроса:', error);
    console.log('%c ✗ Прямой доступ к API недоступен', 'color: red; font-weight: bold');
  }
  
  console.groupEnd();
}

// Проверка настроек Axios
function checkAxiosConfig() {
  console.group('3. Проверка настроек Axios');
  
  try {
    // Импортировать конфигурацию нельзя, но можно проверить глобальные настройки
    const hasAxios = typeof axios !== 'undefined';
    
    if (!hasAxios) {
      console.log('%c ✗ Axios не найден в глобальной области видимости', 'color: red');
      console.log('Рекомендация: Проверьте импорт axios в проекте');
    } else {
      console.log('%c ✓ Axios доступен', 'color: green');
      
      // Проверяем дефолтные настройки
      console.log('Axios defaults:', {
        baseURL: axios.defaults.baseURL,
        timeout: axios.defaults.timeout,
        headers: axios.defaults.headers
      });
    }
  } catch (e) {
    console.error('Ошибка при проверке Axios:', e);
  }
  
  console.groupEnd();
}

// Проверка эндпоинта /cities/
async function checkCitiesEndpoint() {
  console.group('4. Проверка эндпоинта /cities/');
  
  // Проверка через прокси
  console.log('Запрос через Next.js прокси:');
  try {
    const response = await fetch('/api/cities/');
    const status = response.status;
    console.log(`Статус ответа: ${status}`);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log('Количество городов:', data.length);
        console.log('Пример данных:', data.slice(0, 2));
        console.log('%c ✓ API /cities/ через прокси работает', 'color: green; font-weight: bold');
      } catch (e) {
        console.error('Ошибка парсинга JSON:', e);
        const text = await response.text();
        console.log('Ответ (текст):', text);
        console.log('%c ✗ Некорректный JSON в ответе', 'color: red; font-weight: bold');
      }
    } else {
      console.log('%c ✗ API /cities/ через прокси вернул ошибку', 'color: red; font-weight: bold');
      try {
        const errorText = await response.text();
        console.log('Текст ошибки:', errorText);
      } catch (e) {
        console.error('Не удалось получить текст ошибки:', e);
      }
    }
  } catch (error) {
    console.error('Ошибка запроса:', error);
    console.log('%c ✗ Ошибка при обращении к /cities/ через прокси', 'color: red; font-weight: bold');
  }
  
  // Проверка прямого доступа
  console.log('\nПрямой запрос к API:');
  try {
    const response = await fetch('http://192.168.1.124:8088/cities/');
    const status = response.status;
    console.log(`Статус ответа: ${status}`);
    
    if (response.ok) {
      try {
        const data = await response.json();
        console.log('Количество городов:', data.length);
        console.log('Пример данных:', data.slice(0, 2));
        console.log('%c ✓ Прямой доступ к /cities/ работает', 'color: green; font-weight: bold');
      } catch (e) {
        console.error('Ошибка парсинга JSON:', e);
        const text = await response.text();
        console.log('Ответ (текст):', text);
        console.log('%c ✗ Некорректный JSON в ответе', 'color: red; font-weight: bold');
      }
    } else {
      console.log('%c ✗ Прямой доступ к /cities/ вернул ошибку', 'color: red; font-weight: bold');
      try {
        const errorText = await response.text();
        console.log('Текст ошибки:', errorText);
      } catch (e) {
        console.error('Не удалось получить текст ошибки:', e);
      }
    }
  } catch (error) {
    console.error('Ошибка запроса:', error);
    console.log('%c ✗ Ошибка при прямом обращении к /cities/', 'color: red; font-weight: bold');
  }
  
  console.groupEnd();
}

// Применение исправлений
async function applyFixes() {
  console.group('5. Применение исправлений');
  
  // Исправление 1: Проверка и обновление Next.js rewrites
  console.log('Проверка Next.js rewrite правил...');
  const nextConfig = window?.next?.config?.publicRuntimeConfig;
  
  if (nextConfig) {
    console.log('Next.js конфигурация найдена:', nextConfig);
  } else {
    console.log('Next.js конфигурация не доступна в браузере');
  }
  
  // Исправление 2: Патч стандартного обработчика ошибок Axios
  try {
    if (typeof axios !== 'undefined') {
      console.log('Патчим обработчик ошибок Axios...');
      
      // Оригинальный метод
      const originalUse = axios.interceptors.response.use;
      
      // Заменяем на наш с лучшей обработкой 500 ошибок
      axios.interceptors.response.use(
        (response) => response,
        (error) => {
          console.log('Обработка ошибки через патч:', error.message);
          
          // Для 500 ошибок делаем повторную попытку
          if (error.response && error.response.status === 500) {
            console.log('Автоматическая повторная попытка для 500 ошибки...');
            
            // Получаем исходную конфигурацию запроса
            const config = error.config;
            
            // Если не помечен как повторный, пробуем еще раз
            if (!config || !config._retry) {
              if (config) {
                config._retry = true;
                console.log('Повторная попытка запроса после 500 ошибки');
                
                // Делаем задержку для повторного запроса
                return new Promise((resolve) => {
                  setTimeout(() => resolve(axios(config)), 1000);
                });
              }
            }
          }
          
          return Promise.reject(error);
        }
      );
      
      console.log('%c ✓ Обработчик ошибок Axios успешно обновлен', 'color: green; font-weight: bold');
    } else {
      console.log('%c ✗ Axios не доступен, нельзя применить патч', 'color: red');
    }
  } catch (e) {
    console.error('Ошибка при патче Axios:', e);
  }
  
  console.groupEnd();
}

// Запуск всех проверок
async function runAllTests() {
  console.log('%c Запуск всех проверок...', 'background: #122; color: #0ff; padding: 3px 8px;');
  
  await checkProxiedAPI();
  await checkDirectAPI();
  checkAxiosConfig();
  await checkCitiesEndpoint();
  
  console.log('\n%c 🔧 Запуск исправлений...', 'background: #122; color: #0ff; padding: 3px 8px;');
  await applyFixes();
  
  console.log('\n%c Диагностика завершена. ✓', 'background: #122; color: #0ff; font-size: 16px; padding: 5px 10px; border-radius: 5px;');
}

// Функции, которые пользователь может вызывать из консоли
window.footballStats = {
  checkAPI: checkProxiedAPI,
  checkDirectAPI: checkDirectAPI,
  checkAxios: checkAxiosConfig,
  checkCities: checkCitiesEndpoint,
  applyFixes: applyFixes,
  diagnose: runAllTests
};

// Запускаем диагностику
runAllTests();

console.log('\n%c Вы можете использовать следующие команды для диагностики: ', 'background: #333; color: #fff; padding: 5px;');
console.log('%c footballStats.checkAPI() %c - проверить API через Next.js прокси', 'background: #222; color: #9f9; padding: 3px 6px; border-radius: 3px;', 'color: #888');
console.log('%c footballStats.checkDirectAPI() %c - проверить прямой доступ к API', 'background: #222; color: #9f9; padding: 3px 6px; border-radius: 3px;', 'color: #888');
console.log('%c footballStats.checkCities() %c - проверить эндпоинт /cities/', 'background: #222; color: #9f9; padding: 3px 6px; border-radius: 3px;', 'color: #888');
console.log('%c footballStats.applyFixes() %c - применить исправления', 'background: #222; color: #9f9; padding: 3px 6px; border-radius: 3px;', 'color: #888');
console.log('%c footballStats.diagnose() %c - запустить все проверки', 'background: #222; color: #9f9; padding: 3px 6px; border-radius: 3px;', 'color: #888');


