import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getPlayer, updatePlayer, getCities, getTeams, getLeagues, getPlayerLeagueStatuses, createPlayerLeagueStatus, updatePlayerLeagueStatus, deletePlayerLeagueStatus } from '../../../utils/api';

const TABS = [
  { key: 'main', label: 'Основная информация' },
  { key: 'leagues', label: 'Информация по лигам' }
];

export default function EditPlayerPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    patronymic: '',
    date_of_birth: '',
    position: '',
    height: '',
    weight: '',
    team_id: '',
    city_id: '',
    jersey_number: '',
    is_active: true,
    photo_url: '',
    description: '',
    phone: ''
  });
  const [cities, setCities] = useState([]);
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [leagueStatuses, setLeagueStatuses] = useState({}); // { leagueId: { id, is_foreign, is_self } }
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('main');

  // Позиции игроков
  const positions = [
    { value: 'Вратарь', label: 'Вратарь' },
    { value: 'Защитник', label: 'Защитник' },
    { value: 'Полузащитник', label: 'Полузащитник' },
    { value: 'Нападающий', label: 'Нападающий' }
  ];

  useEffect(() => {
    if (!id) return;
    getPlayer(id).then(data => {
      setForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        patronymic: data.patronymic || '',
        date_of_birth: data.date_of_birth ? data.date_of_birth.slice(0, 10) : '',
        position: data.position || '',
        height: data.height || '',
        weight: data.weight || '',
        team_id: data.team_id || '',
        city_id: data.city_id || '',
        jersey_number: data.jersey_number || '',
        is_active: data.is_active !== undefined ? data.is_active : true,
        photo_url: data.photo_url || '',
        description: data.description || '',
        phone: data.phone || ''
      });
      setLoaded(true);
    });
    getCities().then(setCities);
    getTeams().then(setTeams);
    getLeagues().then(setLeagues);
    if (id) {
      getPlayerLeagueStatuses(id).then(statuses => {
        const map = {};
        statuses.forEach(s => { map[s.league_id] = { id: s.id, is_foreign: s.is_foreign, is_self: s.is_self }; });
        setLeagueStatuses(map);
      });
    }
  }, [id]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  function handleLeagueStatusChange(leagueId, field) {
    setLeagueStatuses(prev => ({
      ...prev,
      [leagueId]: {
        ...prev[leagueId],
        [field]: !prev[leagueId]?.[field]
      }
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        first_name: form.first_name,
        last_name: form.last_name,
        patronymic: form.patronymic || null,
        date_of_birth: form.date_of_birth || null,
        position: form.position || null,
        height: form.height ? parseInt(form.height, 10) : null,
        weight: form.weight ? parseInt(form.weight, 10) : null,
        team_id: form.team_id || null,
        city_id: form.city_id || null,
        jersey_number: form.jersey_number ? parseInt(form.jersey_number, 10) : null,
        is_active: form.is_active,
        photo_url: form.photo_url || null,
        description: form.description || null,
        phone: form.phone || null
      };
      await updatePlayer(id, payload);
      
      // Подготавливаем промисы для операций со статусами лиг
      const statusPromises = [];
      
      // Обработка каждой лиги
      for (const league of leagues) {
        const status = leagueStatuses[league.id] || {};
        
        if (status.id) {
          // обновить или удалить существующий статус
          if (status.is_foreign || status.is_self) {
            statusPromises.push(
              updatePlayerLeagueStatus(status.id, { 
                is_foreign: !!status.is_foreign, 
                is_self: !!status.is_self 
              })
            );
          } else {
            statusPromises.push(deletePlayerLeagueStatus(status.id));
          }
        } else if (status.is_foreign || status.is_self) {
          // создать новый статус
          statusPromises.push(
            createPlayerLeagueStatus(id, { 
              league_id: league.id, 
              is_foreign: !!status.is_foreign, 
              is_self: !!status.is_self 
            })
          );
        }
      }
      
      // Выполняем все промисы, если они есть
      if (statusPromises.length > 0) {
        await Promise.all(statusPromises);
      }
      
      router.push('/admin/players');
    } catch (error) {
      console.error('Ошибка при обновлении игрока:', error);
      alert(`Ошибка при обновлении игрока: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) return <div className="p-8">Загрузка...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Редактировать игрока</h1>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={() => router.push('/admin/players')}
        >
          Вернуться к списку игроков
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {/* Tabs */}
        <div className="mb-4 flex space-x-2">
          {TABS.map(tab => (
            <button type="button" key={tab.key} className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setActiveTab(tab.key)}>{tab.label}</button>
          ))}
        </div>
        {/* Tab content */}
        {activeTab === 'main' && (
          <div className="space-y-4">
            <input name="last_name" value={form.last_name} onChange={handleChange} className="input w-full" placeholder="Фамилия*" required />
            <input name="first_name" value={form.first_name} onChange={handleChange} className="input w-full" placeholder="Имя*" required />
            <input name="patronymic" value={form.patronymic} onChange={handleChange} className="input w-full" placeholder="Отчество" />
            
            <div className="grid grid-cols-2 gap-4">
              <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} className="input w-full" placeholder="Дата рождения" />
              <input name="phone" value={form.phone} onChange={handleChange} className="input w-full" placeholder="Номер телефона" />
            </div>

            <select name="city_id" value={form.city_id} onChange={handleChange} className="input w-full">
              <option value="">Город</option>
              {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
            </select>

            <select name="team_id" value={form.team_id} onChange={handleChange} className="input w-full">
              <option value="">Команда</option>
              {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>

            <select name="position" value={form.position} onChange={handleChange} className="input w-full">
              <option value="">Позиция</option>
              {positions.map(pos => <option key={pos.value} value={pos.value}>{pos.label}</option>)}
            </select>

            <input name="jersey_number" value={form.jersey_number} onChange={handleChange} className="input w-full" placeholder="Номер на футболке" type="number" min="1" max="99" />

            <div className="grid grid-cols-2 gap-4">
              <input name="height" value={form.height} onChange={handleChange} className="input w-full" placeholder="Рост (см)" type="number" min="140" max="230" />
              <input name="weight" value={form.weight} onChange={handleChange} className="input w-full" placeholder="Вес (кг)" type="number" min="40" max="150" />
            </div>

            <input name="photo_url" value={form.photo_url} onChange={handleChange} className="input w-full" placeholder="URL фотографии" />
            <textarea name="description" value={form.description} onChange={handleChange} className="textarea w-full" placeholder="Описание/биография" />
            <label className="flex items-center gap-2">
              <input name="is_active" type="checkbox" checked={form.is_active} onChange={handleChange} /> Активен
            </label>
          </div>
        )}
        {activeTab === 'leagues' && (
          <div className="space-y-2">
            <div className="font-semibold mb-2">Статусы по лигам:</div>
            {leagues.length === 0 ? (
              <div className="text-gray-500">Нет лиг</div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {leagues.map(league => (
                  <div key={league.id} className="flex items-center gap-4">
                    <span className="w-72">{league.name}</span>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={!!leagueStatuses[league.id]?.is_foreign} onChange={() => handleLeagueStatusChange(league.id, 'is_foreign')} /> Легионер
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="checkbox" checked={!!leagueStatuses[league.id]?.is_self} onChange={() => handleLeagueStatusChange(league.id, 'is_self')} /> Сам
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Сохранение...' : 'Сохранить'}</button>
      </form>
    </div>
  );
} 