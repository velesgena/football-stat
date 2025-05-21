import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getTournaments, deleteTournament } from '../../../utils/api';

const EditIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.414 1.414-4.243a4 4 0 01.828-1.414l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const statusLabels = {
  active: 'Активный',
  completed: 'Завершен',
  planned: 'Запланирован'
};

const statusColors = {
  active: 'text-green-600',
  completed: 'text-gray-600',
  planned: 'text-blue-600'
};

export default function AdminTournamentsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    getTournaments()
      .then(data => {
        // Sort tournaments by status (active first) and then by season (desc)
        const sorted = data.sort((a, b) => {
          // First by status priority
          const statusPriority = { active: 0, planned: 1, completed: 2 };
          const statusDiff = statusPriority[a.status] - statusPriority[b.status];
          if (statusDiff !== 0) return statusDiff;
          
          // Then by season in reverse order (newest first)
          return b.season.localeCompare(a.season);
        });
        setTournaments(sorted);
      })
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id) {
    if (!confirm('Удалить турнир?')) return;
    setDeletingId(id);
    try {
      await deleteTournament(id);
      setTournaments(tournaments => tournaments.filter(t => t.id !== id));
    } catch (e) {
      alert('Ошибка удаления');
    }
    setDeletingId(null);
  }

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Турниры</h1>
      <button className="btn btn-primary mb-4" onClick={() => router.push('/admin/tournaments/create')}>Добавить турнир</button>
      <table className="table-auto w-full">
        <thead>
          <tr>
            <th>Название</th>
            <th>Формат</th>
            <th>Сезон</th>
            <th>Статус</th>
            <th>Команд</th>
            <th>Туров</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.map(tournament => {
            const numTeams = tournament.teams ? tournament.teams.length : 0;
            const numRounds = tournament.rounds_count || 1;
            const numTours = numTeams > 1 ? (numTeams - 1) * numRounds : 0;
            return (
              <tr
                key={tournament.id}
                className="cursor-pointer hover:bg-gray-100"
                onClick={e => {
                  if (e.target.closest('.icon-btn')) return;
                  router.push(`/admin/tournaments/edit/${tournament.id}`);
                }}
              >
                <td>{tournament.name}</td>
                <td>{tournament.format || '-'}</td>
                <td>{tournament.season}</td>
                <td>
                  <span className={statusColors[tournament.status]}>
                    {statusLabels[tournament.status]}
                  </span>
                </td>
                <td>{numTeams}</td>
                <td>{numTours}</td>
                <td className="flex space-x-2">
                  <button
                    className="icon-btn btn btn-ghost btn-xs"
                    title="Редактировать"
                    onClick={e => { e.stopPropagation(); router.push(`/admin/tournaments/edit/${tournament.id}`); }}
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="icon-btn btn btn-ghost btn-xs"
                    title="Информация"
                    onClick={e => { e.stopPropagation(); router.push(`/tournaments/${tournament.id}`); }}
                  >
                    <InfoIcon />
                  </button>
                  <button
                    className="icon-btn btn btn-ghost btn-xs text-error"
                    title="Удалить"
                    onClick={e => { e.stopPropagation(); handleDelete(tournament.id); }}
                    disabled={deletingId === tournament.id}
                  >
                    <DeleteIcon />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 