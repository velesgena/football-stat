import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { getTournaments, getLeagues, getTeams, getPlayers, updateTournament, getPlayerLeagueStatuses } from '../../../../utils/api';

// Helper function to normalize tournament data
function normalizeTournamentData(tournament) {
  return {
    name: tournament.name || '',
    season: tournament.season || '',
    description: tournament.description || '',
    league_id: tournament.league_id || '',
    rounds_count: tournament.rounds_count || 1,
    format: tournament.format || '',
    max_players: tournament.max_players !== null && tournament.max_players !== undefined ? tournament.max_players : '',
    max_players_per_game: tournament.max_players_per_game !== null && tournament.max_players_per_game !== undefined ? tournament.max_players_per_game : '',
    max_foreign_players: tournament.max_foreign_players !== null && tournament.max_foreign_players !== undefined ? tournament.max_foreign_players : '',
    max_foreign_players_field: tournament.max_foreign_players_field !== null && tournament.max_foreign_players_field !== undefined ? tournament.max_foreign_players_field : '',
    tour_dates: tournament.tour_dates || {},
    status: tournament.status || 'planned'
  };
}

export default function EditTournamentPage() {
  const router = useRouter();
  const { id } = router.query;

  const TABS = [
    { key: 'info', label: 'Общая информация' },
    { key: 'teams', label: 'Список команд' },
    { key: 'players', label: 'Составы команд' },
    { key: 'tour_dates', label: 'Даты туров' }
  ];

  const [form, setForm] = useState({
    name: '',
    season: '',
    description: '',
    league_id: '',
    rounds_count: 1,
    format: '',
    max_players: '',
    max_players_per_game: '',
    max_foreign_players: '',
    max_foreign_players_field: '',
    tour_dates: {},
    status: 'planned'
  });
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]); // массив id выбранных команд
  const [teamPlayers, setTeamPlayers] = useState({}); // { teamId: [playerId, ...] }
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [focusTeamId, setFocusTeamId] = useState(null);
  const [activePlayersTeamId, setActivePlayersTeamId] = useState(null);
  const [selectedPlayersTeamId, setSelectedPlayersTeamId] = useState('');
  const [tabs, setTabs] = useState(TABS);
  // Move state to component level
  const [showOnlyChecked, setShowOnlyChecked] = useState(false);
  const [showDefaultTeamPlayers, setShowDefaultTeamPlayers] = useState(false);
  const [playerSearchTerm, setPlayerSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'last_name',
    direction: 'ascending'
  });
  const [tourDates, setTourDates] = useState({});

  function normalizeTeamPlayers(team) {
    if (team.players) return team.players;
    return (team.player_ids || []).map(pid => ({
      player_id: pid,
      number: null,
      position: null,
      is_foreign: false,
      is_self: false,
      registered: 'all',
      unregistered: 'all'
    }));
  }

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      setLoading(true);
      try {
        const [tournaments, leaguesData, teamsData, playersData] = await Promise.all([
          getTournaments(),
          getLeagues(),
          getTeams(),
          getPlayers()
        ]);
        
        // Запрашиваем статусы игроков по лигам для всех игроков
        const playersWithLeagueStatuses = await Promise.all(
          playersData.map(async (player) => {
            try {
              const statuses = await getPlayerLeagueStatuses(player.id);
              return {
                ...player,
                leagues_statuses: statuses || []
              };
            } catch (error) {
              console.error(`Ошибка при получении статусов игрока ${player.id}:`, error);
              return {
                ...player,
                leagues_statuses: []
              };
            }
          })
        );
        
        const tournament = tournaments.find(t => String(t.id) === String(id));
        if (tournament) {
          // Use the normalization function for consistent handling of values
          setForm(normalizeTournamentData(tournament));
          
          // Восстанавливаем выбранные команды и составы
          const teamIds = (tournament.teams || []).map(t => String(t.team_id));
          setSelectedTeams(teamIds);
          const teamPlayersObj = {};
          (tournament.teams || []).forEach(t => {
            teamPlayersObj[String(t.team_id)] = {};
            normalizeTeamPlayers(t).forEach(p => {
              teamPlayersObj[String(t.team_id)][String(p.player_id)] = {
                checked: true,
                number: p.number,
                position: p.position,
                is_foreign: p.is_foreign,
                is_self: p.is_self,
                registered: p.registered,
                unregistered: p.unregistered
              };
            });
          });
          setTeamPlayers(teamPlayersObj);
        }
        setLeagues(leaguesData || []);
        setTeams(teamsData || []);
        setPlayers(playersWithLeagueStatuses || []);
        setTourDates(tournament.tour_dates || {});
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleTeamCheckbox(teamId) {
    setSelectedTeams(prev => {
      if (prev.includes(teamId)) {
        // убираем команду и её игроков
        const filtered = prev.filter(id => id !== teamId);
        setTeamPlayers(tp => {
          const newTp = { ...tp };
          delete newTp[teamId];
          return newTp;
        });
        return filtered;
      } else {
        return [...prev, teamId];
      }
    });
  }

  const registrationOptions = (rounds) => [
    { value: 'all', label: 'Весь турнир' },
    ...(rounds >= 2 ? [{ value: 'from_2', label: 'с 2 кр' }] : []),
  ];
  const unregistrationOptions = (rounds) => [
    { value: 'all', label: 'Весь турнир' },
    ...(rounds >= 2 ? [{ value: 'after_1', label: 'После 1 кр' }] : []),
  ];

  function handlePlayerCheckbox(teamId, player) {
    setTeamPlayers(tp => {
      const current = tp[teamId] || {};
      if (current[player.id]?.checked) {
        // убираем игрока
        const { [player.id]: _, ...rest } = current;
        return { ...tp, [teamId]: rest };
      } else {
        // добавляем игрока с данными из настроек лиги
        // Проверяем, есть ли информация о статусе игрока в выбранной лиге
        const leagueStatus = player.leagues_statuses && Array.isArray(player.leagues_statuses) 
          ? player.leagues_statuses.find(ls => String(ls.league_id) === String(form.league_id)) 
          : {};
        
        return {
          ...tp,
          [teamId]: {
            ...current,
            [player.id]: {
              checked: true,
              number: player.jersey_number || '',
              position: player.position || '',
              is_foreign: typeof leagueStatus?.is_foreign === 'boolean' ? leagueStatus.is_foreign : false,
              is_self: typeof leagueStatus?.is_self === 'boolean' ? leagueStatus.is_self : false,
              registered: 'all',
              unregistered: 'all',
            }
          }
        };
      }
    });
  }

  function handlePlayerFieldChange(teamId, playerId, field, value) {
    setTeamPlayers(tp => ({
      ...tp,
      [teamId]: {
        ...tp[teamId],
        [playerId]: {
          ...tp[teamId]?.[playerId],
          [field]: value
        }
      }
    }));
  }

  function handleGoToPlayers(teamId) {
    setActiveTab('players');
    setActivePlayersTeamId(teamId);
    setSelectedPlayersTeamId(teamId);
  }

  function handleBackToTeams() {
    setActiveTab('teams');
    setActivePlayersTeamId(null);
    setSelectedPlayersTeamId('');
  }

  function handleTourDateChange(tourNumber, date) {
    setTourDates(prev => ({
      ...prev,
      [tourNumber]: date
    }));
    setForm(prev => ({
      ...prev,
      tour_dates: {
        ...prev.tour_dates,
        [tourNumber]: date
      }
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const teamsData = selectedTeams.map(teamId => ({
      team_id: teamId,
      players: Object.entries(teamPlayers[teamId] || {})
        .filter(([_, p]) => p.checked)
        .map(([playerId, p]) => ({
          player_id: Number(playerId),
          number: p.number ? Number(p.number) : null,
          is_foreign: !!p.is_foreign,
          is_self: !!p.is_self,
          registered: p.registered || 'all',
          unregistered: p.unregistered || 'all'
        }))
    }));
    
    // Convert string values to numbers for numeric fields
    const formData = {
      ...form,
      max_players: form.max_players ? Number(form.max_players) : null,
      max_players_per_game: form.max_players_per_game ? Number(form.max_players_per_game) : null,
      max_foreign_players: form.max_foreign_players ? Number(form.max_foreign_players) : null,
      max_foreign_players_field: form.max_foreign_players_field ? Number(form.max_foreign_players_field) : null,
      rounds_count: Number(form.rounds_count),
      teams: teamsData,
      tour_dates: tourDates
    };
    
    try {
      await updateTournament(id, formData);
      setSaving(false);
      router.push('/admin/tournaments');
    } catch (error) {
      console.error('Error updating tournament:', error);
      setSaving(false);
      alert('Ошибка при обновлении турнира');
    }
  }

  // Calculate number of tours
  const numTeams = selectedTeams.length;
  const numRounds = parseInt(form.rounds_count, 10) || 1;
  const numTours = numTeams > 1 ? (numTeams - 1) * numRounds : 0;

  // Update tabs state when dependencies change
  useEffect(() => {
    const updatedTabs = TABS.map(tab => ({
      ...tab,
      disabled: tab.key === 'tour_dates' ? numTours === 0 : false
    }));
    setTabs(updatedTabs);
  }, [numTours]);

  if (loading) return <div className="p-8">Загрузка...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Редактировать турнир</h1>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={() => router.push('/admin/tournaments')}
        >
          Вернуться к списку турниров
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 w-full">
        {/* Tabs */}
        <div className="mb-4 flex space-x-2">
          {TABS.map(tab => (
            <button 
              type="button" 
              key={tab.key} 
              className={`btn btn-sm ${activeTab === tab.key ? 'btn-primary' : 'btn-ghost'} ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`} 
              onClick={() => !tab.disabled && setActiveTab(tab.key)}
              disabled={tab.disabled}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Tab content */}
        {activeTab === 'info' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <input name="name" value={form.name} onChange={handleChange} className="input w-full" placeholder="Название*" required />
            <input name="season" value={form.season} onChange={handleChange} className="input w-full" placeholder="Сезон*" required />
            <select name="league_id" value={form.league_id} onChange={handleChange} className="input w-full" required>
              <option value="">Выберите лигу*</option>
              {leagues.map(league => (
                <option key={league.id} value={league.id}>{league.name}</option>
              ))}
            </select>
            <select name="format" value={form.format} onChange={handleChange} className="input w-full" required>
              <option value="">Выберите формат*</option>
              <option value="11x11">11х11</option>
              <option value="8x8">8х8</option>
              <option value="5x5">5х5</option>
            </select>
            <select name="status" value={form.status} onChange={handleChange} className="input w-full" required>
              <option value="planned">Запланирован</option>
              <option value="active">Активный</option>
              <option value="completed">Завершен</option>
            </select>
            <input name="rounds_count" type="number" min="1" value={form.rounds_count} onChange={handleChange} className="input w-full" placeholder="Количество кругов*" required />
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Количество человек в общей заявке</label>
                <input
                  name="max_players"
                  type="number"
                  min="1"
                  value={form.max_players || ''}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Количество человек на игру</label>
                <input
                  name="max_players_per_game"
                  type="number"
                  min="1"
                  value={form.max_players_per_game || ''}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Количество легионеров</label>
                <input
                  name="max_foreign_players"
                  type="number"
                  min="0"
                  value={form.max_foreign_players || ''}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Количество легионеров в поле</label>
                <input
                  name="max_foreign_players_field"
                  type="number"
                  min="0"
                  value={form.max_foreign_players_field || ''}
                  onChange={handleChange}
                  className="input w-full"
                />
              </div>
            </div>
            
            <div className="text-gray-600 mb-2">Будет туров: <b>{numTours}</b></div>
            <textarea name="description" value={form.description} onChange={handleChange} className="textarea w-full" placeholder="Описание" />
          </div>
        )}
        {activeTab === 'teams' && (
          <div className="max-w-4xl mx-auto">
            <div className="font-semibold mb-2">Выберите команды-участники:</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {teams.map(team => (
                <div key={team.id} className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 flex-1">
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(String(team.id))}
                      onChange={() => handleTeamCheckbox(String(team.id))}
                    />
                    <span>{team.name}</span>
                  </label>
                  {selectedTeams.includes(String(team.id)) && (
                    <button type="button" className="btn btn-xs btn-outline ml-2" style={{alignSelf: 'center'}} onClick={() => handleGoToPlayers(String(team.id))}>К составу</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'players' && (
          <div className="max-w-6xl mx-auto">
            <div className="mb-4">
              <label className="block font-semibold mb-1">Выберите команду для указания состава:</label>
              <select
                className="input w-full max-w-md"
                value={selectedPlayersTeamId}
                onChange={e => setSelectedPlayersTeamId(e.target.value)}
              >
                <option value="">-- Не выбрана --</option>
                {selectedTeams.map(teamId => {
                  const team = teams.find(t => String(t.id) === String(teamId));
                  return team ? <option key={team.id} value={team.id}>{team.name}</option> : null;
                })}
              </select>
            </div>
            {!selectedPlayersTeamId ? (
              <div className="text-gray-500">Сначала выберите команду для указания состава.</div>
            ) : (() => {
              // Early return if data is not loaded
              if (loading || !Array.isArray(players) || players.length === 0) {
                return <div className="text-gray-500">Загрузка данных игроков...</div>;
              }

              const teamId = selectedPlayersTeamId;
              const team = teams.find(t => String(t.id) === String(teamId));
              if (!team) return null;
              
              // Apply different filters based on selected options
              let filteredPlayers = players;

              // Filter by selected players if that toggle is on
              if (showOnlyChecked) {
                filteredPlayers = players.filter(player => teamPlayers[teamId]?.[player.id]?.checked);
              } 
              // Filter by default team players if that toggle is on
              else if (showDefaultTeamPlayers) {
                filteredPlayers = players.filter(player => String(player.team_id) === String(teamId));
              }
              
              // Apply search filter
              if (playerSearchTerm.trim() !== '') {
                const searchTermLower = playerSearchTerm.toLowerCase();
                filteredPlayers = filteredPlayers.filter(player => {
                  const fullName = `${player.last_name} ${player.first_name} ${player.patronymic || ''}`.toLowerCase();
                  return fullName.includes(searchTermLower);
                });
              }

              // Apply sorting
              const sortedPlayers = [...filteredPlayers].sort((a, b) => {
                const p1 = teamPlayers[teamId]?.[a.id] || {};
                const p2 = teamPlayers[teamId]?.[b.id] || {};
                
                if (sortConfig.key === 'last_name') {
                  const nameA = `${a.last_name} ${a.first_name}`.toLowerCase();
                  const nameB = `${b.last_name} ${b.first_name}`.toLowerCase();
                  if (sortConfig.direction === 'ascending') {
                    return nameA.localeCompare(nameB);
                  } else {
                    return nameB.localeCompare(nameA);
                  }
                } else if (sortConfig.key === 'position') {
                  const posA = p1.position || a.position || '';
                  const posB = p2.position || b.position || '';
                  if (sortConfig.direction === 'ascending') {
                    return posA.localeCompare(posB);
                  } else {
                    return posB.localeCompare(posA);
                  }
                } else if (sortConfig.key === 'is_foreign') {
                  const foreignA = p1.is_foreign || false;
                  const foreignB = p2.is_foreign || false;
                  if (sortConfig.direction === 'ascending') {
                    return foreignA === foreignB ? 0 : foreignA ? 1 : -1;
                  } else {
                    return foreignA === foreignB ? 0 : foreignA ? -1 : 1;
                  }
                } else if (sortConfig.key === 'is_self') {
                  const selfA = p1.is_self || false;
                  const selfB = p2.is_self || false;
                  if (sortConfig.direction === 'ascending') {
                    return selfA === selfB ? 0 : selfA ? 1 : -1;
                  } else {
                    return selfA === selfB ? 0 : selfA ? -1 : 1;
                  }
                }
                
                return 0;
              });
              
              return (
                <div id={`team-${teamId}`} className="mt-4 border p-2 rounded w-full">
                  <div className="font-semibold mb-1">Состав для команды: {team.name}</div>
                  
                  <div className="flex flex-col space-y-4 mb-4">
                    <div className="flex items-center space-x-6">
                      <label className="inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox"
                          className="sr-only"
                          checked={showOnlyChecked}
                          onChange={() => {
                            setShowOnlyChecked(!showOnlyChecked);
                            if (!showOnlyChecked) setShowDefaultTeamPlayers(false);
                          }}
                        />
                        <div className={`relative w-11 h-6 bg-gray-200 rounded-full peer ${showOnlyChecked ? 'bg-blue-600' : ''}`}>
                          <span className={`absolute h-5 w-5 rounded-full bg-white top-0.5 left-0.5 transition-all ${showOnlyChecked ? 'translate-x-5' : ''}`}></span>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700">Показать только выбранных игроков</span>
                      </label>

                      <label className="inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox"
                          className="sr-only"
                          checked={showDefaultTeamPlayers}
                          onChange={() => {
                            setShowDefaultTeamPlayers(!showDefaultTeamPlayers);
                            if (!showDefaultTeamPlayers) setShowOnlyChecked(false);
                          }}
                        />
                        <div className={`relative w-11 h-6 bg-gray-200 rounded-full peer ${showDefaultTeamPlayers ? 'bg-blue-600' : ''}`}>
                          <span className={`absolute h-5 w-5 rounded-full bg-white top-0.5 left-0.5 transition-all ${showDefaultTeamPlayers ? 'translate-x-5' : ''}`}></span>
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-700">Игроки по умолчанию</span>
                      </label>
                    </div>

                    <div className="w-full">
                      <input 
                        type="text" 
                        className="input w-full" 
                        placeholder="Поиск по ФИО игрока..." 
                        value={playerSearchTerm}
                        onChange={e => setPlayerSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {sortedPlayers.length === 0 ? (
                    <div className="text-gray-500">{showOnlyChecked ? "Нет выбранных игроков" : "Нет игроков"}</div>
                  ) : (
                    <table className="min-w-full border text-xs">
                      <thead>
                        <tr>
                          <th></th>
                          <th className="text-center w-16">Номер</th>
                          <th 
                            className="text-left w-64 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setSortConfig({
                                key: 'last_name',
                                direction: sortConfig.key === 'last_name' && sortConfig.direction === 'ascending' ? 'descending' : 'ascending'
                              });
                            }}
                          >
                            ФИО {sortConfig.key === 'last_name' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                          </th>
                          <th 
                            className="text-center w-28 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setSortConfig({
                                key: 'position',
                                direction: sortConfig.key === 'position' && sortConfig.direction === 'ascending' ? 'descending' : 'ascending'
                              });
                            }}
                          >
                            Позиция {sortConfig.key === 'position' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                          </th>
                          <th 
                            className="text-center w-20 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setSortConfig({
                                key: 'is_foreign',
                                direction: sortConfig.key === 'is_foreign' && sortConfig.direction === 'ascending' ? 'descending' : 'ascending'
                              });
                            }}
                          >
                            Легионер {sortConfig.key === 'is_foreign' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                          </th>
                          <th 
                            className="text-center w-20 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setSortConfig({
                                key: 'is_self',
                                direction: sortConfig.key === 'is_self' && sortConfig.direction === 'ascending' ? 'descending' : 'ascending'
                              });
                            }}
                          >
                            Сам {sortConfig.key === 'is_self' && (sortConfig.direction === 'ascending' ? '↑' : '↓')}
                          </th>
                          <th className="text-center w-28">Заявлен</th>
                          <th className="text-center w-28">Отзаявлен</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedPlayers.map(player => {
                          if (!player || typeof player !== 'object' || !player.id) return null;
                          const p = teamPlayers[teamId]?.[player.id] || {};
                          return (
                            <tr key={player.id}>
                              <td>
                                <input
                                  type="checkbox"
                                  checked={!!p.checked}
                                  onChange={() => handlePlayerCheckbox(teamId, player)}
                                />
                              </td>
                              <td className="text-center align-middle w-16">
                                <input type="number" className="input input-xs w-12 text-center" value={p.number || ''} onChange={e => handlePlayerFieldChange(teamId, player.id, 'number', e.target.value)} />
                              </td>
                              <td className="align-middle w-64">
                                {player.last_name} {player.first_name}{player.patronymic ? ` ${player.patronymic}` : ''}
                                {player.position === 'Вратарь' && <span className="ml-1 font-bold text-blue-600">В</span>}
                              </td>
                              <td className="text-center align-middle w-28">
                                <select 
                                  className="input input-xs text-center" 
                                  value={p.position || player.position || ''} 
                                  onChange={e => handlePlayerFieldChange(teamId, player.id, 'position', e.target.value)}
                                  disabled={!p.checked}
                                >
                                  <option value="">Выберите</option>
                                  <option value="Вратарь">Вратарь</option>
                                  <option value="Защитник">Защитник</option>
                                  <option value="Полузащитник">Полузащитник</option>
                                  <option value="Нападающий">Нападающий</option>
                                </select>
                              </td>
                              <td className="text-center align-middle w-20">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={p.checked && !!p.is_foreign}
                                    onChange={() => handlePlayerFieldChange(teamId, player.id, 'is_foreign', !p.is_foreign)}
                                    disabled={!p.checked}
                                  />
                                </div>
                              </td>
                              <td className="text-center align-middle w-20">
                                <div className="flex justify-center">
                                  <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary"
                                    checked={p.checked && !!p.is_self}
                                    onChange={() => handlePlayerFieldChange(teamId, player.id, 'is_self', !p.is_self)}
                                    disabled={!p.checked}
                                  />
                                </div>
                              </td>
                              <td className="text-center align-middle w-28">
                                <select className="input input-xs text-center" value={p.registered || 'all'} onChange={e => handlePlayerFieldChange(teamId, player.id, 'registered', e.target.value)}>
                                  <option value="all">Весь турнир</option>
                                  {numRounds >= 2 && <option value="from_2">с 2 кр</option>}
                                </select>
                              </td>
                              <td className="text-center align-middle w-28">
                                <select className="input input-xs text-center" value={p.unregistered || 'all'} onChange={e => handlePlayerFieldChange(teamId, player.id, 'unregistered', e.target.value)}>
                                  <option value="all">Весь турнир</option>
                                  {numRounds >= 2 && <option value="after_1">После 1 кр</option>}
                                </select>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                  
                  {(() => {
                    const selectedPlayers = Object.entries(teamPlayers[teamId] || {})
                      .filter(([_, p]) => p.checked)
                      .map(([id, p]) => {
                        const player = players.find(player => String(player.id) === String(id));
                        return player ? {
                          id,
                          ...p,
                          player
                        } : null;
                      })
                      .filter(Boolean);
                    
                    const total = selectedPlayers.length;
                    const foreign = selectedPlayers.filter(p => p.is_foreign).length;
                    const goalkeepers = selectedPlayers.filter(p => p.player?.position === 'Вратарь').length;
                    
                    // Players with is_self flag
                    const selfPlayers = selectedPlayers.filter(p => p.is_self);
                    
                    // Group self players by city
                    const selfCityCounts = {};
                    selfPlayers.forEach(p => {
                      if (p.player?.city) {
                        const cityName = p.player.city.name;
                        selfCityCounts[cityName] = (selfCityCounts[cityName] || 0) + 1;
                      }
                    });

                    return (
                      <div className="mt-2 text-sm text-gray-700">
                        <div><b>Итого:</b> выбрано игроков: {total}, из них легионеров: {foreign}, вратарей: {goalkeepers}</div>
                        
                        {Object.keys(selfCityCounts).length > 0 && (
                          <div>
                            <b>Приезжают сами (по городам):</b>
                            <ul className="list-disc list-inside ml-2">
                              {Object.entries(selfCityCounts).map(([city, count]) => (
                                <li key={city}>{city}: {count}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })()}
          </div>
        )}
        {activeTab === 'tour_dates' && (
          <div className="max-w-4xl mx-auto">
            <div className="font-semibold mb-4">Укажите плановые даты проведения туров:</div>
            <div className="space-y-2">
              {Array.from({ length: numTours }, (_, i) => i + 1).map(tourNumber => (
                <div key={tourNumber} className="flex items-center space-x-4">
                  <span className="w-24">Тур {tourNumber}:</span>
                  <input
                    type="date"
                    value={tourDates[tourNumber] || ''}
                    onChange={(e) => handleTourDateChange(tourNumber, e.target.value)}
                    className="input"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Сохранение...' : 'Сохранить'}</button>
      </form>
      <style jsx global>{`
      .switch {
        position: relative;
        display: inline-block;
        width: 32px;
        height: 18px;
        vertical-align: middle;
      }
      .switch input { display: none; }
      .slider {
        position: absolute;
        cursor: pointer;
        top: 0; left: 0; right: 0; bottom: 0;
        background: #fff;
        border: 1.5px solid #d1d5db;
        transition: .3s;
        border-radius: 18px;
        box-sizing: border-box;
      }
      .slider:before {
        position: absolute;
        content: "";
        height: 14px;
        width: 14px;
        left: 2px;
        top: 1px;
        background: #f3f4f6;
        transition: .3s;
        border-radius: 50%;
        box-shadow: 0 1px 4px #0001;
      }
      input:checked + .slider {
        background: #22c55e;
        border-color: #22c55e;
      }
      input:checked + .slider:before {
        background: #fff;
        transform: translateX(14px);
      }
      `}</style>
    </div>
  );
} 