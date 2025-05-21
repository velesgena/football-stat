import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '../../utils/api';
import { getCities } from '../../utils/api';

export default function StadiumForm({ initialData, onSuccess }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    city_id: initialData?.city_id || '',
    capacity: initialData?.capacity || '',
    address: initialData?.address || '',
    description: initialData?.description || '',
    photo_url: initialData?.photo_url || '',
  });
  const [errors, setErrors] = useState({});

  // Загрузка списка городов
  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await getCities();
        setCities(data);
      } catch (error) {
        console.error('Ошибка при загрузке списка городов:', error);
      }
    };
    
    loadCities();
  }, []);

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
      newErrors.name = 'Название стадиона обязательно';
    }
    
    if (!formData.city_id) {
      newErrors.city_id = 'Город обязателен';
    }
    
    if (formData.capacity && (isNaN(formData.capacity) || parseInt(formData.capacity) < 0)) {
      newErrors.capacity = 'Вместимость должна быть положительным числом';
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
        city_id: parseInt(formData.city_id),
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
      };
      
      let response;
      if (initialData?.id) {
        // Update existing stadium
        response = await api.put(`/stadiums/${initialData.id}`, payload);
      } else {
        // Create new stadium
        response = await api.post('/stadiums/', payload);
      }
      
      if (onSuccess) {
        onSuccess(response.data);
      } else {
        router.push('/infrastructure');
      }
    } catch (error) {
      console.error('Ошибка при сохранении стадиона:', error);
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
          Название стадиона *
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
        <label htmlFor="city_id" className="block text-sm font-medium text-gray-700">
          Город *
        </label>
        <select
          id="city_id"
          name="city_id"
          value={formData.city_id}
          onChange={handleChange}
          className={`mt-1 block w-full rounded-md border ${
            errors.city_id ? 'border-red-500' : 'border-gray-300'
          } shadow-sm p-2`}
        >
          <option value="">Выберите город</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.name}, {city.country}
            </option>
          ))}
        </select>
        {errors.city_id && (
          <p className="mt-1 text-sm text-red-600">{errors.city_id}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
          Вместимость
        </label>
        <input
          type="number"
          id="capacity"
          name="capacity"
          value={formData.capacity}
          onChange={handleChange}
          min="0"
          className={`mt-1 block w-full rounded-md border ${
            errors.capacity ? 'border-red-500' : 'border-gray-300'
          } shadow-sm p-2`}
        />
        {errors.capacity && (
          <p className="mt-1 text-sm text-red-600">{errors.capacity}</p>
        )}
      </div>
      
      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
          Адрес
        </label>
        <input
          type="text"
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Описание
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
        />
      </div>
      
      <div>
        <label htmlFor="photo_url" className="block text-sm font-medium text-gray-700">
          URL фотографии
        </label>
        <input
          type="text"
          id="photo_url"
          name="photo_url"
          value={formData.photo_url}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2"
        />
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