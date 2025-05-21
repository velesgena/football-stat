import useSWR from 'swr';
import api from '../utils/api';
import { logDetailedError, tryDirectApiCall, retryRequest } from '../utils/errorHandler';

const fetcher = async (url, params = {}) => {
  const makeRequest = async () => {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      console.error(`Ошибка в fetcher для ${url}:`, error);
      logDetailedError(error, `useFetch (${url})`);
      
      // Сохраняем информацию об ошибке
      const enhancedError = new Error(error.message || 'Неизвестная ошибка');
      enhancedError.status = error.response?.status;
      enhancedError.info = error.response?.data;
      enhancedError.serverMessage = error.serverMessage || 'Ошибка сервера';
      enhancedError.url = url;
      enhancedError.params = params;
      
      // Если это 500 ошибка или нет ответа вообще, пробуем прямой запрос
      if (error.response?.status === 500 || !error.response) {
        try {
          console.log('useFetch: пробуем прямой запрос при сбое API');
          const result = await tryDirectApiCall(url, {
            method: 'GET',
            params
          });
          
          return result;
        } catch (directError) {
          console.error('Ошибка при прямом запросе в useFetch:', directError);
          enhancedError.directRequestFailed = true;
          enhancedError.directError = directError.message;
        }
      }
      
      throw enhancedError;
    }
  };
  
  // Используем функцию повторных попыток
  return retryRequest(makeRequest, 2, 1000);
};

export default function useFetch(url, params = {}, options = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    url ? [url, JSON.stringify(params)] : null,
    () => fetcher(url, params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000, // не повторять одинаковые запросы в течение 5 секунд
      ...options,
      
      // Настраиваем повторные попытки при ошибке
      onErrorRetry: (error, key, config, revalidate, { retryCount }) => {
        // Не повторяем для 404
        if (error.status === 404) return;
        
        // Не повторяем для определенных типов ошибок
        if (error.status === 403 || error.status === 401) return;
        
        // Ограничиваем количество попыток
        if (retryCount >= 3) return;
        
        // Увеличиваем задержку с каждой попыткой
        const delay = Math.min(1000 * (2 ** retryCount), 5000);
        console.log(`useFetch: повторная попытка через ${delay}мс (попытка ${retryCount + 1}/3)`);
        
        setTimeout(() => revalidate({ retryCount }), delay);
      }
    }
  );

  // Форматируем дополнительную информацию об ошибке для отладки
  const errorInfo = error ? {
    message: error.message,
    status: error.status,
    url: error.url,
    directRequestFailed: error.directRequestFailed,
    serverMessage: error.serverMessage,
    directError: error.directError
  } : null;

  return {
    data,
    isLoading,
    isError: !!error,
    error, // Полный объект ошибки
    errorInfo, // Сокращенная информация об ошибке
    mutate,
  };
} 