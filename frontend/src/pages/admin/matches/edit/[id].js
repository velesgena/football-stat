import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { matchesApi, teamsApi, stadiumsApi, refereesApi, tournamentsApi, playersApi, matchStatsApi } from '../../../../services/api';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import SquadSelector from '../../../../components/matches/SquadSelector';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

export default function EditMatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const [form, setForm] = useState({
    match_date: '',
    match_time: '',
    home_team_id: '',
    away_team_id: '',
    tournament_id: '',
    stadium_id: '',
    referee_id: '',
    home_score: '',
    away_score: '',
    status: 'scheduled',
    round: ''
  });
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [squadState, setSquadState] = useState({
    home: [],
    away: []
  });
  const [matchStats, setMatchStats] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [availableTours, setAvailableTours] = useState([]);
  const [matches, setMatches] = useState([]);

  // Маппинг статусов с русского на английский
  const statusMapping = {
    'Запланирован': 'scheduled',
    'Завершен': 'finished',
    'Отменен': 'canceled',
    'Перенесен': 'postponed',
    'Идет сейчас': 'live'
  };

  // Обратное маппинг статусов с английского на русский
  const reverseStatusMapping = {
    'scheduled': 'Запланирован',
    'finished': 'Завершен',
    'canceled': 'Отменен',
    'postponed': 'Перенесен',
    'live': 'Идет сейчас'
  };

  useEffect(() => {
    if (!id) return;

    async function fetchData() {
      setLoading(true);
      try {
        // Загрузка данных матча
        const matchData = await matchesApi.getMatchById(id);
        
        // Загрузка списков для селектов
        const [teamsData, tournamentsData, stadiumsData, refereesData, matchStatsData] = await Promise.all([
          teamsApi.getAllTeams(),
          tournamentsApi.getAllTournaments(),
          stadiumsApi.getAllStadiums(),
          refereesApi.getAllReferees(),
          matchStatsApi.getMatchStatsByMatch(id)
        ]);

        // Загрузка игроков для обеих команд
        const [homePlayers, awayPlayers] = await Promise.all([
          playersApi.getPlayersByTeam(matchData.home_team_id),
          playersApi.getPlayersByTeam(matchData.away_team_id)
        ]);

        setTeams(teamsData);
        setTournaments(tournamentsData);
        setStadiums(stadiumsData);
        setReferees(refereesData);
        setHomePlayers(homePlayers);
        setAwayPlayers(awayPlayers);

        // Обработка статистики матча
        const homeStats = matchStatsData.filter(stat => stat.team_id === matchData.home_team_id);
        const awayStats = matchStatsData.filter(stat => stat.team_id === matchData.away_team_id);

        // Преобразование статистики в формат для SquadSelector
        const processedHomeStats = homeStats.map(stat => ({
          player_id: stat.player_id,
          name: `${stat.player?.last_name} ${stat.player?.first_name}`,
          position: stat.player?.position,
          jersey_number: stat.player?.jersey_number,
          is_started: stat.is_started || false,
          is_substitute: stat.is_substitute || false,
          is_self: stat.is_self || false,
          is_foreign: stat.is_foreign || false,
          city: stat.player?.city
        }));

        const processedAwayStats = awayStats.map(stat => ({
          player_id: stat.player_id,
          name: `${stat.player?.last_name} ${stat.player?.first_name}`,
          position: stat.player?.position,
          jersey_number: stat.player?.jersey_number,
          is_started: stat.is_started || false,
          is_substitute: stat.is_substitute || false,
          is_self: stat.is_self || false,
          is_foreign: stat.is_foreign || false,
          city: stat.player?.city
        }));

        // Установка начальных значений формы
        setForm({
          match_date: matchData.match_date,
          match_time: matchData.match_time ? new Date(matchData.match_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '',
          home_team_id: String(matchData.home_team_id),
          away_team_id: String(matchData.away_team_id),
          tournament_id: String(matchData.tournament_id),
          stadium_id: matchData.stadium_id ? String(matchData.stadium_id) : '',
          referee_id: matchData.referee_id ? String(matchData.referee_id) : '',
          home_score: matchData.home_score !== null ? String(matchData.home_score) : '',
          away_score: matchData.away_score !== null ? String(matchData.away_score) : '',
          status: matchData.status,
          round: matchData.round || ''
        });

        setSquadState({
          home: processedHomeStats,
          away: processedAwayStats
        });

        setLoaded(true);
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        alert('Ошибка при загрузке данных матча');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  // Эффект для загрузки игроков при выборе команды
  useEffect(() => {
    async function loadTeamPlayers() {
      // Если изменилась домашняя команда
      if (form.home_team_id) {
        try {
          const players = await playersApi.getPlayersByTeam(form.home_team_id);
          setHomePlayers(players);
        } catch (error) {
          console.error('Ошибка при загрузке игроков домашней команды:', error);
        }
      }

      // Если изменилась гостевая команда
      if (form.away_team_id) {
        try {
          const players = await playersApi.getPlayersByTeam(form.away_team_id);
          setAwayPlayers(players);
        } catch (error) {
          console.error('Ошибка при загрузке игроков гостевой команды:', error);
        }
      }
    }

    loadTeamPlayers();
  }, [form.home_team_id, form.away_team_id]);
  
  // Генерация списка доступных туров для турнира
  const generateAvailableTours = (tournament) => {
    if (!tournament) return;
    
    // Вычисляем количество туров
    const numRounds = tournament.rounds_count || 1;
    
    // Для обхода проблемы отсутствия teams, будем использовать фиксированное количество туров
    // либо вычислять на основе количества команд, если они доступны
    let numTours = 30; // Фиксированное количество туров по умолчанию (достаточно для большинства турниров)
    
    if (tournament.teams && tournament.teams.length > 1) {
      const numTeams = tournament.teams.length;
      numTours = (numTeams - 1) * numRounds;
    }
    
    // Создаем массив туров
    const tours = [];
    for (let i = 1; i <= numTours; i++) {
      tours.push(i.toString());
    }
    
    setAvailableTours(tours);
  };
  
  // Следим за изменением выбранного турнира
  useEffect(() => {
    if (form.tournament_id) {
      const tournament = tournaments.find(t => t.id === parseInt(form.tournament_id));
      if (tournament) {
        generateAvailableTours(tournament);
      }
    } else {
      setAvailableTours([]);
    }
  }, [form.tournament_id, tournaments]);

  // Получить список команд, которые уже играют в выбранном турнире и туре
  const getUsedTeamIds = () => {
    if (!form.tournament_id || !form.round) return [];
    return matches
      ? matches
        .filter(m => String(m.tournament_id) === String(form.tournament_id) && String(m.round) === String(form.round))
        .reduce((acc, m) => {
          acc.push(m.home_team_id, m.away_team_id);
          return acc;
        }, [])
      : [];
  };

  // Фильтруем команды для выбора
  const usedTeamIds = getUsedTeamIds();
  const availableTeams = teams.filter(team => !usedTeamIds.includes(team.id) || team.id === Number(form.home_team_id) || team.id === Number(form.away_team_id));

  // Сортируем турниры по сезону (по убыванию)
  const sortedTournaments = [...tournaments].sort((a, b) => (b.season || 0) - (a.season || 0));

  // Автоматическая смена статуса на 'finished' при вводе счета
  useEffect(() => {
    if (
      form.home_score !== '' &&
      form.away_score !== '' &&
      !isNaN(Number(form.home_score)) &&
      !isNaN(Number(form.away_score))
    ) {
      setForm(f => ({ ...f, status: 'finished' }));
    }
  }, [form.home_score, form.away_score]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setForm(f => {
      const newForm = { ...f, [name]: newValue };
      
      // Если изменилась домашняя команда, проверяем наличие стадиона по умолчанию
      if (name === 'home_team_id' && value) {
        const homeTeam = teams.find(t => t.id === parseInt(value, 10));
        if (homeTeam?.stadium_id && !newForm.stadium_id) {
          newForm.stadium_id = homeTeam.stadium_id.toString();
        }
      }

      // Если изменился тур, устанавливаем дату из настроек турнира
      if (name === 'round' && value && newForm.tournament_id) {
        const tournament = tournaments.find(t => String(t.id) === String(newForm.tournament_id));
        if (tournament?.tour_dates?.[value]) {
          newForm.match_date = tournament.tour_dates[value];
        }
      }
      
      return newForm;
    });
  }

  // Обработчик изменения состава команды
  const handleSquadChange = (teamId, players) => {
    if (teamId === form.home_team_id) {
      setSquadState(prev => ({ ...prev, home: players }));
    } else if (teamId === form.away_team_id) {
      setSquadState(prev => ({ ...prev, away: players }));
    }
  };

  // Функция для создания/обновления статистики матча
  const saveMatchStats = async () => {
    try {
      // Get current match stats to delete them
      const currentStats = await matchStatsApi.getMatchStatsByMatch(id);
      
      // Create arrays for home and away team stats
      const homeStats = squadState.home.map(player => ({
        match_id: parseInt(id),
        player_id: player.player_id,
        team_id: parseInt(form.home_team_id),
        is_started: player.is_started || false,
        is_substitute: player.is_substitute || false,
        is_foreign: player.is_foreign || false,
        is_self: player.is_self || false, // We keep this field even if it's not visible
        minutes_played: 0,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_card: false
      }));
      
      const awayStats = squadState.away.map(player => ({
        match_id: parseInt(id),
        player_id: player.player_id,
        team_id: parseInt(form.away_team_id),
        is_started: player.is_started || false,
        is_substitute: player.is_substitute || false,
        is_foreign: player.is_foreign || false,
        is_self: player.is_self || false, // We keep this field even if it's not visible
        minutes_played: 0,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_card: false
      }));
      
      // Combine all stats to save
      const statsToSave = [...homeStats, ...awayStats];

      // Delete existing stats
      const deletePromises = currentStats.map(stat => 
        matchStatsApi.deleteMatchStat(stat.id)
      );
      await Promise.all(deletePromises);

      // Create new stats in bulk instead of one by one
      const createPromises = statsToSave.map(stat => 
        matchStatsApi.createMatchStat(stat)
      );
      await Promise.all(createPromises);

      return true;
    } catch (error) {
      console.error('Ошибка при сохранении статистики матча:', error);
      return false;
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // First save match stats to avoid potential hanging
      const statsSuccess = await saveMatchStats();
      
      // Собираем match_time в формате YYYY-MM-DDTHH:MM:SS
      const match_time = form.match_date && form.match_time
        ? `${form.match_date}T${form.match_time}`
        : null;
      
      // Then update main match information
      await matchesApi.updateMatch(id, {
        tournament_id: form.tournament_id,
        home_team_id: form.home_team_id,
        away_team_id: form.away_team_id,
        match_date: form.match_date,
        match_time,
        stadium_id: form.stadium_id || null,
        referee_id: form.referee_id || null,
        home_score: form.home_score ? parseInt(form.home_score, 10) : null,
        away_score: form.away_score ? parseInt(form.away_score, 10) : null,
        status: form.status,
        round: form.round || null
      });
      
      if (!statsSuccess) {
        alert('Матч обновлен, но возникли проблемы при сохранении составов команд.');
      }
      
      router.push('/admin/matches');
    } catch (error) {
      console.error('Ошибка при обновлении матча с ID ' + id + ':', error);
      alert('Ошибка при обновлении матча: ' + (error.message || 'Неизвестная ошибка'));
    } finally {
      setLoading(false);
    }
  }

  if (!loaded) return <div className="p-8">Загрузка...</div>;

  // Находим имена команд
  const homeTeam = teams.find(team => team.id === parseInt(form.home_team_id));
  const awayTeam = teams.find(team => team.id === parseInt(form.away_team_id));

  const breadcrumbsItems = [
    { label: 'Главная', href: '/' },
    { label: 'Администрирование', href: '/admin' },
    { label: 'Матчи', href: '/admin/matches' },
    { label: 'Редактирование матча', href: `/admin/matches/edit/${id}` }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs items={breadcrumbsItems} />
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Редактировать матч</h1>
        <button 
          className="btn btn-outline btn-sm" 
          onClick={() => router.push('/admin/matches')}
        >
          Вернуться к списку матчей
        </button>
      </div>

      <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
        <TabList className="flex border-b mb-4">
          <Tab className="px-4 py-2 mr-2 cursor-pointer border-b-2 border-transparent hover:text-primary transition-colors" selectedClassName="text-primary border-primary font-semibold">
            Основная информация
          </Tab>
          <Tab className="px-4 py-2 mr-2 cursor-pointer border-b-2 border-transparent hover:text-primary transition-colors" selectedClassName="text-primary border-primary font-semibold">
            Составы команд
          </Tab>
        </TabList>

        <TabPanel>
          <form onSubmit={activeTab === 0 ? handleSubmit : e => { e.preventDefault(); setActiveTab(1); }} className="space-y-4 max-w-lg">
            <select name="tournament_id" value={form.tournament_id} onChange={handleChange} className="input w-full" required>
              <option value="">Турнир</option>
              {sortedTournaments.map(t => <option key={t.id} value={t.id}>{t.name} ({t.format || ''} {t.season || ''})</option>)}
            </select>
            
            <div className="grid grid-cols-2 gap-4">
              <select 
                name="round" 
                value={form.round} 
                onChange={handleChange} 
                className="input w-full"
                disabled={!form.tournament_id}
              >
                <option value="">Выберите тур</option>
                {availableTours.map(tour => (
                  <option key={tour} value={tour}>{`Тур ${tour}`}</option>
                ))}
              </select>
              
              <select 
                name="status" 
                value={reverseStatusMapping[form.status] || form.status} 
                onChange={handleChange} 
                className="input w-full" 
                required
              >
                <option value="Запланирован">Запланирован</option>
                <option value="Завершен">Завершен</option>
                <option value="Отменен">Отменен</option>
                <option value="Перенесен">Перенесен</option>
                <option value="Идет сейчас">Идет сейчас</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <input name="match_date" type="date" value={form.match_date} onChange={handleChange} className="input w-full" required />
              <input name="match_time" type="time" value={form.match_time} onChange={handleChange} className="input w-full" required />
            </div>
            <select name="home_team_id" value={form.home_team_id} onChange={handleChange} className="input w-full" required>
              <option value="">Домашняя команда</option>
              {availableTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <select name="away_team_id" value={form.away_team_id} onChange={handleChange} className="input w-full" required>
              <option value="">Гостевая команда</option>
              {availableTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <select name="stadium_id" value={form.stadium_id} onChange={handleChange} className="input w-full">
              <option value="">Стадион</option>
              {stadiums.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select name="referee_id" value={form.referee_id} onChange={handleChange} className="input w-full">
              <option value="">Судья</option>
              {referees.map(r => <option key={r.id} value={r.id}>{r.last_name} {r.first_name}</option>)}
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input name="home_score" type="number" value={form.home_score} onChange={handleChange} className="input w-full" placeholder="Счет домашней команды" />
              <input name="away_score" type="number" value={form.away_score} onChange={handleChange} className="input w-full" placeholder="Счет гостевой команды" />
            </div>
            <div className="flex justify-between">
              <button className="btn btn-primary" type="submit">{activeTab === 0 ? (loading ? 'Сохранение...' : 'Сохранить') : 'Продолжить к составам'}</button>
            </div>
          </form>
        </TabPanel>

        <TabPanel>
          {form.home_team_id && form.away_team_id ? (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Выберите составы команд для матча</h2>
                <p className="text-gray-700 mb-4">
                  Укажите игроков, которые участвуют в матче для обеих команд. Отметьте игроков стартового состава.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Состав домашней команды */}
                {homeTeam && (
                  <div className="h-full">
                    <SquadSelector
                      teamId={form.home_team_id}
                      teamName={homeTeam.name}
                      players={homePlayers.filter(p => p.team_id === parseInt(form.home_team_id))}
                      savedSquad={squadState.home}
                      onChange={handleSquadChange}
                      tournamentId={form.tournament_id}
                    />
                  </div>
                )}
                
                {/* Состав гостевой команды */}
                {awayTeam && (
                  <div className="h-full">
                    <SquadSelector
                      teamId={form.away_team_id}
                      teamName={awayTeam.name}
                      players={awayPlayers.filter(p => p.team_id === parseInt(form.away_team_id))}
                      savedSquad={squadState.away}
                      onChange={handleSquadChange}
                      tournamentId={form.tournament_id}
                    />
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <button 
                  className="btn btn-primary"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : 'Сохранить матч и составы'}
                </button>
                <button 
                  className="btn btn-outline ml-4" 
                  onClick={() => setActiveTab(0)}
                >
                  Вернуться к основной информации
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-lg text-gray-600 mb-4">Пожалуйста, выберите домашнюю и гостевую команды на первой вкладке.</p>
              <button 
                className="btn btn-primary"
                onClick={() => setActiveTab(0)}
              >
                Вернуться к выбору команд
              </button>
            </div>
          )}
        </TabPanel>
      </Tabs>
    </div>
  );
} 