/**
 * API Diagnostic Tool
 * 
 * Этот скрипт помогает диагностировать проблемы с API-запросами в консоли браузера.
 * Скопируйте его полностью и вставьте в консоль браузера на странице, где возникают ошибки.
 */

// Функция для тестирования API напрямую через fetch
async function testAPI(endpoint) {
  const apiURL = endpoint.startsWith('/') 
    ? `http://192.168.1.124:8088${endpoint}` 
    : `http://192.168.1.124:8088/${endpoint}`;
  
  console.log(`Тестирование прямого запроса к API: ${apiURL}`);
  
  try {
    const response = await fetch(apiURL);
    const status = response.status;
    console.log(`Статус ответа: ${status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("Данные ответа:", data);
      return { success: true, status, data };
    } else {
      const text = await response.text();
      console.error(`Ошибка API: ${status}`, text);
      return { success: false, status, error: text };
    }
  } catch (error) {
    console.error("Ошибка соединения:", error);
    return { success: false, error: error.toString() };
  }
}

// Функция для тестирования API через Next.js прокси
async function testProxiedAPI(endpoint) {
  const apiURL = endpoint.startsWith('/') 
    ? `/api${endpoint}` 
    : `/api/${endpoint}`;
  
  console.log(`Тестирование запроса через Next.js прокси: ${apiURL}`);
  
  try {
    const response = await fetch(apiURL);
    const status = response.status;
    console.log(`Статус ответа: ${status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log("Данные ответа:", data);
      return { success: true, status, data };
    } else {
      const text = await response.text();
      console.error(`Ошибка API: ${status}`, text);
      return { success: false, status, error: text };
    }
  } catch (error) {
    console.error("Ошибка соединения:", error);
    return { success: false, error: error.toString() };
  }
}

// Запуск диагностики
async function runAPIDiagnostic() {
  console.log("%cЗапуск диагностики API", "color: blue; font-size: 16px; font-weight: bold");
  
  // Тестирование основных эндпоинтов прямыми запросами
  console.log("%cТестирование прямых запросов к API", "color: blue; font-weight: bold");
  await testAPI("/");
  await testAPI("/cities/");
  
  // Тестирование через прокси
  console.log("%cТестирование запросов через Next.js прокси", "color: blue; font-weight: bold");
  await testProxiedAPI("/");
  await testProxiedAPI("/cities/");
  
  console.log("%cДиагностика завершена", "color: green; font-size: 16px; font-weight: bold");
}

// Запустить диагностику
runAPIDiagnostic();

// Инструкции по использованию
console.log("%cИнструкции:", "color: purple; font-weight: bold");
console.log("1. Для тестирования конкретного эндпоинта API напрямую: await testAPI('/your-endpoint/')");
console.log("2. Для тестирования через Next.js прокси: await testProxiedAPI('/your-endpoint/')");
console.log("3. Для запуска полной диагностики снова: await runAPIDiagnostic()"); 