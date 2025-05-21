import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getCities } from '../../../utils/api';
import { deleteEntity } from '../../../utils/formHelpers';

export default function CitiesAdminPage() {
  const router = useRouter();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCities = async () => {
      try {
        console.log("Начинаем загрузку городов...");
        const data = await getCities();
        console.log("Получены города:", data);
        setCities(data || []);
        setLoading(false);
      } catch (err) {
        console.error("Ошибка получения городов:", err);
        setError('Ошибка при загрузке населенных пунктов');
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  const handleCreateNew = () => {
    router.push('/admin/cities/create');
  };

  const handleEdit = (id) => {
    router.push(`/admin/cities/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот населенный пункт?')) {
      try {
      const result = await deleteEntity('cities', id);
      if (result.success) {
        setCities(cities.filter(city => city.id !== id));
      } else {
          alert(result.error || 'Не удалось удалить город');
        }
      } catch (error) {
        console.error("Ошибка при удалении города:", error);
        alert("Не удалось удалить город. Проверьте консоль для деталей.");
      }
    }
  };

  return (
    <>
      <Head>
        <title>Управление населенными пунктами | Football Stat</title>
      </Head>
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Управление населенными пунктами</h1>
          <button 
            onClick={handleCreateNew}
            className="btn btn-primary"
          >
            Добавить населенный пункт
          </button>
        </div>
        
        {error && (
          <div className="alert alert-error mb-6">
            <span>{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Страна</th>
                  <th>Население</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {cities.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      Населенные пункты не найдены
                    </td>
                  </tr>
                ) : (
                  cities.map(city => (
                    <tr key={city.id}>
                      <td>
                        <div className="font-bold">{city.name}</div>
                      </td>
                      <td>{city.country || '-'}</td>
                      <td>{city.population ? city.population.toLocaleString() : '-'}</td>
                      <td>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEdit(city.id)}
                            className="btn btn-sm btn-outline"
                          >
                            Редактировать
                          </button>
                          <button 
                            onClick={() => handleDelete(city.id)}
                            className="btn btn-sm btn-outline btn-error"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
} 