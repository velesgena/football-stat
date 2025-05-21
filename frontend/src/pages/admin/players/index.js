import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPlayers, deletePlayer, getCities, getTeams } from '../../../utils/api';
import Link from 'next/link';
import { FaTrash, FaInfoCircle } from 'react-icons/fa';

export default function AdminPlayersPage() {
  const router = useRouter();
  const [players, setPlayers] = useState([]);
  const [cities, setCities] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    team: '',
    is_foreign: '',
    search: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [citiesData, teamsData] = await Promise.all([
        getCities(),
        getTeams()
      ]);
      setCities(citiesData);
      setTeams(teamsData);
      await loadPlayers();
      setLoading(false);
    }
    fetchData();
    // eslint-disable-next-line
  }, []);

  async function loadPlayers() {
    setLoading(true);
    const params = {};
    if (filters.city) params.city_id = filters.city;
    if (filters.team) params.team_id = filters.team;
    if (filters.is_foreign) params.is_foreign = filters.is_foreign;
    if (filters.search) params.search = filters.search;
    const data = await getPlayers(params);
    setPlayers(data);
    setLoading(false);
  }

  function handleFilterChange(e) {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  }

  function handleApplyFilters() {
    loadPlayers();
  }

  async function handleDelete(id) {
    if (confirm('Удалить игрока?')) {
      await deletePlayer(id);
      loadPlayers();
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Игроки (админка)</h1>
      {/* Фильтры */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <select name="city" value={filters.city} onChange={handleFilterChange} className="input">
          <option value="">Город</option>
          {cities.map(city => (
            <option key={city.id} value={city.id}>{city.name}</option>
          ))}
        </select>
        <select name="team" value={filters.team} onChange={handleFilterChange} className="input">
          <option value="">Команда</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        <select name="is_foreign" value={filters.is_foreign} onChange={handleFilterChange} className="input">
          <option value="">Статус</option>
          <option value="true">Легионер</option>
          <option value="false">Местный</option>
        </select>
        <input
          type="text"
          name="search"
          placeholder="Поиск по ФИО"
          value={filters.search}
          onChange={handleFilterChange}
          className="input"
        />
        <button className="btn btn-primary" onClick={handleApplyFilters}>Применить</button>
        <Link href="/admin/players/create" className="btn btn-success">Добавить игрока</Link>
      </div>
      {/* Таблица */}
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr>
              <th>ФИО</th>
              <th>Телефон</th>
              <th>Дата рождения</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4}>Загрузка...</td></tr>
            ) : players.length === 0 ? (
              <tr><td colSpan={4}>Нет игроков</td></tr>
            ) : players.map(player => (
              <tr key={player.id} className="cursor-pointer hover:bg-gray-100" onClick={() => router.push(`/admin/players/edit?id=${player.id}`)}>
                <td>{player.last_name} {player.first_name}{player.patronymic ? ` ${player.patronymic}` : ''}</td>
                <td>{player.phone || ''}</td>
                <td>{player.date_of_birth ? new Date(player.date_of_birth).toLocaleDateString() : ''}</td>
                <td className="flex gap-2 items-center" onClick={e => e.stopPropagation()}>
                  <a href={`/players/${player.id}`} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-ghost" title="Информация"><FaInfoCircle /></a>
                  <button className="btn btn-xs btn-ghost text-red-600" title="Удалить" onClick={() => handleDelete(player.id)}><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 