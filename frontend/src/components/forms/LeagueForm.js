import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/api';

export default function LeagueForm({ initialData, onSuccess }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    country: initialData?.country || '',
    level: initialData?.level || '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when field is being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Название лиги обязательно';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Страна обязательна';
    }
    
    if (formData.level && (isNaN(formData.level) || parseInt(formData.level) < 1)) {
      newErrors.level = 'Уровень должен быть положительным числом';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsLoading(true);
    
    try {
      const payload = {
        ...formData,
        level: formData.level ? parseInt(formData.level) : null,
      };
      
      let response;
      if (initialData?.id) {
        // Update existing league
        response = await api.put(`/leagues/${initialData.id}`, payload);
      } else {
        // Create new league
        response = await api.post('/leagues/', payload);
      }
      
      if (onSuccess) {
        onSuccess(response.data);
      } else {
        router.push('/infrastructure');
      }
    } catch (error) {
      console.error('Ошибка при сохранении лиги:', error);
      setErrors({
        submit: 'Произошла ошибка при сохранении. Пожалуйста, попробуйте еще раз.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Название лиги *
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
          Страна *
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
        <label htmlFor="level" className="block text-sm font-medium text-gray-700">
          Уровень
        </label>
        <input
          type="number"
          id="level"
          name="level"
          value={formData.level}
          onChange={handleChange}
          min="1"
          className={`mt-1 block w-full rounded-md border ${
            errors.level ? 'border-red-500' : 'border-gray-300'
          } shadow-sm p-2`}
        />
        {errors.level && (
          <p className="mt-1 text-sm text-red-600">{errors.level}</p>
        )}
      </div>
      
      {errors.submit && (
        <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}
      
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
          {isLoading ? 'Сохранение...' : initialData?.id ? 'Обновить' : 'Создать'}
        </button>
      </div>
    </form>
  );
} 