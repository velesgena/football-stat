import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { createPlayer, getCities, getTeams, getLeagues, createPlayerLeagueStatus } from '../../../utils/api';

const TABS = [
  { key: 'main', label: 'Основная информация' },
  { key: 'leagues', label: 'Информация по лигам' }
];

export default function CreatePlayerPage() {
  const router = useRouter();
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
  const [leagueStatuses, setLeagueStatuses] = useState({}); // { leagueId: { is_foreign, is_self } }
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('main');

  // Позиции игроков
  const positions = [
    { value: 'Вратарь', label: 'Вратарь' },
    { value: 'Защитник', label: 'Защитник' },
    { value: 'Полузащитник', label: 'Полузащитник' },
    { value: 'Нападающий', label: 'Нападающий' }
  ];

  useEffect(() => {
    getCities().then(setCities);
    getTeams().then(setTeams);
    getLeagues().then(setLeagues);
  }, []);

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
      const player = await createPlayer(payload);
      
      // Сохраняем статусы по лигам только если есть что сохранять
      const leagueStatusEntries = Object.entries(leagueStatuses)
        .filter(([_, status]) => status.is_foreign || status.is_self);
      
      if (leagueStatusEntries.length > 0) {
        const promises = leagueStatusEntries.map(([leagueId, status]) =>
          createPlayerLeagueStatus(player.id, { 
            league_id: leagueId, 
            is_foreign: !!status.is_foreign, 
            is_self: !!status.is_self 
          })
        );
        
        await Promise.all(promises);
      }
      
      router.push('/admin/players');
    } catch (error) {
      console.error('Ошибка при создании игрока:', error);
      alert(`Ошибка при создании игрока: ${error.message || 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Добавить игрока</h1>
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
            <input name="first_name" value={form.first_name} onChange={handleChange} className="input w-full" placeholder="Имя*" required />
            <input name="last_name" value={form.last_name} onChange={handleChange} className="input w-full" placeholder="Фамилия*" required />
            <input name="patronymic" value={form.patronymic} onChange={handleChange} className="input w-full" placeholder="Отчество" />
            <input name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} className="input w-full" placeholder="Дата рождения" />
            <select name="position" value={form.position} onChange={handleChange} className="input w-full">
              <option value="">Позиция</option>
              {positions.map(pos => <option key={pos.value} value={pos.value}>{pos.label}</option>)}
            </select>
            <select name="city_id" value={form.city_id} onChange={handleChange} className="input w-full">
              <option value="">Город</option>
              {cities.map(city => <option key={city.id} value={city.id}>{city.name}</option>)}
            </select>
            <input name="height" value={form.height} onChange={handleChange} className="input w-full" placeholder="Рост (см)" type="number" min="140" max="230" />
            <input name="weight" value={form.weight} onChange={handleChange} className="input w-full" placeholder="Вес (кг)" type="number" min="40" max="150" />
            <select name="team_id" value={form.team_id} onChange={handleChange} className="input w-full">
              <option value="">Команда</option>
              {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <input name="jersey_number" value={form.jersey_number} onChange={handleChange} className="input w-full" placeholder="Номер на футболке" type="number" min="1" max="99" />
            <input name="phone" value={form.phone} onChange={handleChange} className="input w-full" placeholder="Номер телефона" />
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