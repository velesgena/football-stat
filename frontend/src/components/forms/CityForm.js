import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api, { createCity, updateCity } from '../../utils/api';

export default function CityForm({ initialData, onSuccess }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    country: initialData?.country || '',
    population: initialData?.population || '',
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [apiReachable, setApiReachable] = useState(false);

  // Проверка доступности API при монтировании компонента
  useEffect(() => {
    const checkApiReachability = async () => {
      try {
        // Проверяем корневой эндпоинт бэкенда
        const response = await fetch('/api');
        const isOk = response.ok;
        const status = response.status;
        setApiReachable(isOk);
        
        const statusText = isOk ? 'доступен' : 'недоступен';
        setDebugInfo(`API ${statusText} (статус: ${status}). ` +
                     `URL: ${api.defaults.baseURL}`);
        
        console.log('API проверка:', {
          baseURL: api.defaults.baseURL,
          доступен: isOk,
          статус: status,
          headers: api.defaults.headers
        });
      } catch (error) {
        console.error('Не удалось проверить API:', error);
        setApiReachable(false);
        setDebugInfo(`Ошибка при проверке API: ${error.message}`);
      }
    };
    
    checkApiReachability();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Дополнительная валидация для поля population
    if (name === 'population') {
      // Разрешаем только числа или пустую строку
      if (value === '' || /^\d+$/.test(value)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
    
    // Сбрасываем ошибку формы при любом изменении
    if (formError) {
      setFormError('');
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название обязательно';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Страна обязательна';
    }
    
    if (formData.population) {
      const populationValue = parseInt(formData.population);
      if (isNaN(populationValue) || populationValue < 0) {
        newErrors.population = 'Население должно быть положительным числом';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Прямой запрос на бэкенд в обход прокси Next.js
  const handleSubmitDirect = async () => {
    try {
      console.log('Прямой запрос к бэкенду (обход прокси)');
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || `http://${hostname}:8088`;
      const payload = {
        name: formData.name.trim(),
        country: formData.country.trim(), 
        population: formData.population ? parseInt(formData.population) : null,
      };
      
      console.log('Отправляем данные напрямую:', payload);
      
      const response = await fetch(`${baseUrl}/cities/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });
      
      const responseText = await response.text();
      console.log('Ответ сервера (текст):', responseText);
      
      let jsonData;
      try {
        jsonData = JSON.parse(responseText);
        console.log('Ответ сервера (JSON):', jsonData);
      } catch (parseError) {
        console.error('Ошибка парсинга JSON:', parseError);
        throw new Error(`Некорректный формат ответа: ${responseText}`);
      }
      
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}: ${JSON.stringify(jsonData || {})}`);
      }
      
      console.log('Город успешно создан через прямой запрос:', jsonData);
      
      // Переадресация
      if (onSuccess) {
        onSuccess(jsonData);
      } else {
        console.log('Переход на /infrastructure');
        router.push('/infrastructure');
      }
      return true;
    } catch (error) {
      console.error('Ошибка при прямом запросе:', error);
      setFormError(`Ошибка при прямом запросе: ${error.message}`);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    setFormError('');
    
    try {
      const payload = {
        name: formData.name.trim(),
        country: formData.country.trim(),
        population: formData.population ? parseInt(formData.population) : null,
      };
      
      console.log('Отправляемые данные:', payload);
      console.log('API доступен:', apiReachable);
      
      // Пробуем стандартный метод с улучшенной обработкой ошибок
      try {
        let result;
        if (initialData?.id) {
          console.log('Обновление существующего города');
          result = await updateCity(initialData.id, payload);
          console.log('Город обновлен:', result);
        } else {
          console.log('Создание нового города через API');
          result = await createCity(payload);
          console.log('Город создан:', result);
        }
        
        if (onSuccess) {
          onSuccess(result);
        } else {
          console.log('Перенаправление на /infrastructure');
          router.push('/infrastructure');
        }
      } catch (apiError) {
        console.error('Ошибка API:', apiError);

        // Выводим подробное сообщение об ошибке
        let errorMessage;
        
        if (apiError.serverMessage) {
          errorMessage = `Ошибка сервера: ${apiError.serverMessage}`;
        } else if (apiError.response && apiError.response.status === 500) {
          errorMessage = 'Внутренняя ошибка сервера. Пожалуйста, попробуйте позже или обратитесь к администратору.';
          
          // Добавляем информацию в консоль для отладки
          console.log('Подробная информация об ошибке 500:', {
            url: apiError.config?.url,
            данные: payload,
            заголовки: apiError.config?.headers,
            статус: apiError.response?.status,
            данныеОтвета: apiError.response?.data
          });
        } else {
          errorMessage = `Ошибка API: ${apiError.message}`;
        }
        
        setFormError(errorMessage);
        
        // Если ошибка 500, перепробуем через 2 секунды
        if (apiError.response && apiError.response.status === 500) {
          console.log('Ожидаем 2 секунды перед повторной попыткой...');
          setTimeout(async () => {
            console.log('Пробуем использовать прямой запрос...');
            try {
              const success = await handleSubmitDirect();
              if (success) {
                setFormError('');
              }
            } catch (directError) {
              console.error('Ошибка прямого запроса:', directError);
            }
          }, 2000);
        } else {
          // Для других ошибок пробуем сразу прямой запрос
        console.log('Пробуем использовать прямой запрос...');
        const success = await handleSubmitDirect();
        
        if (!success) {
          throw new Error('Не удалось создать город ни через API, ни через прямой запрос');
          }
        }
      }
    } catch (error) {
      console.error('Общая ошибка:', error);
      setFormError(`Не удалось сохранить данные: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {debugInfo && (
        <div className="p-2 bg-blue-100 border border-blue-300 text-blue-800 rounded text-sm">
          Отладка: {debugInfo}
        </div>
      )}
      
      {formError && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Ошибка!</strong> {formError}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Название*
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } shadow-sm p-2`}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700">
          Страна*
        </label>
        <input
          type="text"
          id="country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.country ? 'border-red-500' : 'border-gray-300'
          } shadow-sm p-2`}
        />
        {errors.country && (
          <p className="mt-1 text-sm text-red-600">{errors.country}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="population" className="block text-sm font-medium text-gray-700">
          Население
        </label>
        <input
          type="number"
          id="population"
          name="population"
          value={formData.population}
          onChange={handleChange}
          min="0"
          className={`mt-1 block w-full rounded-md border ${
            errors.population ? 'border-red-500' : 'border-gray-300'
          } shadow-sm p-2`}
        />
        {errors.population && (
          <p className="mt-1 text-sm text-red-600">{errors.population}</p>
        )}
      </div>
      
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => router.push('/infrastructure')}
          className="mr-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Отмена
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          {isLoading ? 'Сохранение...' : initialData?.id ? 'Обновить' : 'Сохранить'}
        </button>
      </div>
    </form>
  );
} 