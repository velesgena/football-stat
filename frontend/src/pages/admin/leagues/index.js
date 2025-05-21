import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getLeagues, deleteLeague } from '../../../utils/api';

export default function LeaguesAdminPage() {
  const router = useRouter();
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeagues().then(data => {
      setLeagues(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Удалить лигу?')) {
      await deleteLeague(id);
      setLeagues(leagues.filter(l => l.id !== id));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Лиги</h1>
      <button className="btn btn-primary mb-4" onClick={() => router.push('/admin/leagues/create')}>Добавить лигу</button>
      {loading ? (
        <div>Загрузка...</div>
      ) : (
        <table className="table w-full">
          <thead>
            <tr>
              <th>Название</th>
              <th>Страна</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {leagues.map(league => (
              <tr key={league.id}>
                <td>{league.name}</td>
                <td>{league.country}</td>
                <td>
                  <button className="btn btn-sm btn-outline mr-2" onClick={() => router.push(`/admin/leagues/edit/${league.id}`)}>Редактировать</button>
                  <button className="btn btn-sm btn-error" onClick={() => handleDelete(league.id)}>Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 