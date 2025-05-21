import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const ApiStatus = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await api.get('/');
      if (response.data.message === "Бэкенд Football stats работает!") {
        setStatus('connected');
        setError(null);
      } else {
        setStatus('error');
        setError('Неожиданный ответ от сервера');
      }
    } catch (error) {
      console.error('Ошибка при проверке API:', error);
      setStatus('error');
      setError(error.message || 'Ошибка подключения к API');
    }
  };

  if (status === 'checking') {
    return <div className="api-status checking">Проверка подключения к серверу...</div>;
  }

  if (status === 'error') {
    return (
      <div className="api-status error">
        <p>Ошибка подключения к серверу</p>
        <p className="error-details">{error}</p>
        <button onClick={checkApiStatus}>Повторить проверку</button>
      </div>
    );
  }

  return <div className="api-status connected">Подключение к серверу установлено</div>;
};

export default ApiStatus; 