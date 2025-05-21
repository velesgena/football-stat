import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getTeams } from '../../../utils/api';
import { deleteEntity } from '../../../utils/formHelpers';
import { FaTrash, FaInfoCircle } from 'react-icons/fa';

export default function TeamsAdminPage() {
  const router = useRouter();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const data = await getTeams();
        setTeams(data);
        setLoading(false);
      } catch (err) {
        setError('Ошибка при загрузке команд');
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleCreateNew = () => {
    router.push('/admin/teams/create');
  };

  const handleEdit = (id) => {
    router.push(`/admin/teams/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту команду?')) {
      const result = await deleteEntity('teams', id);
      
      if (result.success) {
        setTeams(teams.filter(team => team.id !== id));
      } else {
        alert(result.error);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Управление командами | Football Stat</title>
      </Head>
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Управление командами</h1>
          <button 
            onClick={handleCreateNew}
            className="btn btn-primary"
          >
            Добавить команду
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
                  <th>Город</th>
                  <th>Год основания</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {teams.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      Команды не найдены
                    </td>
                  </tr>
                ) : (
                  teams.map(team => (
                    <tr key={team.id} className="cursor-pointer hover:bg-gray-100" onClick={() => handleEdit(team.id)}>
                      <td>
                        <div className="flex items-center space-x-3">
                          {team.logo_url && (
                            <div className="avatar">
                              <div className="mask mask-squircle w-12 h-12">
                                <img src={team.logo_url} alt={team.name} />
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="font-bold">{team.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>{team.city ? `${team.city.name}${team.city.country ? ', ' + team.city.country : ''}` : '-'}</td>
                      <td>{team.founded_year || '-'}</td>
                      <td className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
                        <a href={`/teams/${team.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-ghost" title="Информация"><FaInfoCircle /></a>
                        <button onClick={() => handleDelete(team.id)} className="btn btn-xs btn-ghost text-red-600" title="Удалить"><FaTrash /></button>
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