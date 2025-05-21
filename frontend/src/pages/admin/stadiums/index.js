import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getStadiums, deleteStadium } from '../../../utils/api';

export default function StadiumsAdminPage() {
  const router = useRouter();
  const [stadiums, setStadiums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStadiums().then(data => {
      setStadiums(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Удалить стадион?')) {
      await deleteStadium(id);
      setStadiums(stadiums.filter(s => s.id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Стадионы</h1>
      <button className="btn btn-primary mb-4" onClick={() => router.push('/admin/stadiums/create')}>Добавить стадион</button>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <table className="table w-full">
          <thead>
            <tr>
              <th>Название</th>
              <th>Город</th>
              <th>Вместимость</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {stadiums.map(stadium => (
              <tr key={stadium.id}>
                <td>{stadium.name}</td>
                <td>{stadium.city?.name || '-'}</td>
                <td>{stadium.capacity || '-'}</td>
                <td>
                  <button className="btn btn-sm btn-outline mr-2" onClick={() => router.push(`/admin/stadiums/edit/${stadium.id}`)}>Редактировать</button>
                  <button className="btn btn-sm btn-error" onClick={() => handleDelete(stadium.id)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 