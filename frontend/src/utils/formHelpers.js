import api from './api';

// Отправка формы для создания новой записи
export const createEntity = async (entityType, data) => {
  try {
    // Преобразуем числовые строки в числа
    const processedData = {};
    for (const [key, value] of Object.entries(data)) {
      // Если ключ содержит "id" или "year" и значение не пустое, преобразуем в число
      if ((key.includes('id') || key.includes('year')) && value !== '') {
        processedData[key] = Number(value);
      } else if (value === '') {
        // Пустые строки оставляем null для опциональных полей
        processedData[key] = null;
      } else {
        processedData[key] = value;
      }
    }

    const response = await api.post(`/${entityType}/`, processedData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Произошла ошибка при создании записи'
    };
  }
};

// Отправка формы для обновления существующей записи
export const updateEntity = async (entityType, id, data) => {
  try {
    const response = await api.put(`/${entityType}/${id}`, data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Произошла ошибка при обновлении записи'
    };
  }
};

// Удаление записи
export const deleteEntity = async (entityType, id) => {
  try {
    await api.delete(`/${entityType}/${id}`);
    return {
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || 'Произошла ошибка при удалении записи'
    };
  }
};

// Форматирование даты для полей формы
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// Преобразование строки в number или undefined
export const parseNumberOrUndefined = (value) => {
  if (value === '' || value === null) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
}; 