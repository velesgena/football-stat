import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { matchesApi, teamsApi, stadiumsApi, refereesApi, tournamentsApi, playersApi, matchStatsApi } from '../../../services/api';
import SquadSelector from '../../../components/matches/SquadSelector';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

// Функция для получения текущей даты в формате YYYY-MM-DD
const getCurrentDate = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Функция для получения времени по умолчанию (12:00)
const getDefaultTime = () => {
  return '12:00';
};

// Функция для получения последних значений из localStorage
const getLastValues = () => {
  try {
    return {
      tournamentId: localStorage.getItem('lastTournamentId') || '',
      round: localStorage.getItem('lastRound') || ''
    };
  } catch (e) {
    return { tournamentId: '', round: '' };
  }
};

export default function CreateMatchPage() {
  const router = useRouter();
  const lastValues = getLastValues();
  
  const [form, setForm] = useState({
    match_date: getCurrentDate(),
    match_time: getDefaultTime(),
    home_team_id: '',
    away_team_id: '',
    tournament_id: lastValues.tournamentId,
    stadium_id: '',
    referee_id: '',
    home_score: '',
    away_score: '',
    status: 'scheduled',
    round: lastValues.round
  });
  const [teams, setTeams] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [referees, setReferees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [homePlayers, setHomePlayers] = useState([]);
  const [awayPlayers, setAwayPlayers] = useState([]);
  const [squadState, setSquadState] = useState({
    home: [],
    away: []
  });
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
    teamsApi.getAllTeams().then(setTeams);
    tournamentsApi.getAllTournaments().then(setTournaments);
    stadiumsApi.getAllStadiums().then(setStadiums);
    refereesApi.getAllReferees().then(setReferees);
    matchesApi.getAllMatches().then(setMatches);
  }, []);

  useEffect(() => {
    async function loadTeamPlayers() {
      if (form.home_team_id) {
        try {
          const players = await playersApi.getPlayersByTeam(form.home_team_id);
          setHomePlayers(players);
        } catch (error) {
          console.error('Ошибка при загрузке игроков домашней команды:', error);
        }
      }

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

  const handleSquadChange = (teamId, players) => {
    // Ensure is_foreign is properly set as boolean
    const processedPlayers = players.map(player => ({
      player_id: player.player_id,
      name: `${player.last_name} ${player.first_name}`,
      position: player.position,
      jersey_number: player.jersey_number,
      is_started: player.is_started || false,
      is_substitute: player.is_substitute || false,
      is_self: player.is_self || false,
      is_foreign: !!player.is_foreign,
      city: player.city
    }));
    
    if (teamId === form.home_team_id) {
      setSquadState(prev => ({ ...prev, home: processedPlayers }));
    } else if (teamId === form.away_team_id) {
      setSquadState(prev => ({ ...prev, away: processedPlayers }));
    }
  };

  const saveMatchStats = async (matchId) => {
    try {
      // Create arrays for home and away team stats
      const homeStats = squadState.home.map(player => ({
        match_id: parseInt(matchId),
        player_id: player.player_id,
        team_id: parseInt(form.home_team_id),
        is_started: player.is_started || false,
        is_substitute: player.is_substitute || false,
        is_foreign: player.is_foreign || false,
        is_self: player.is_self || false,
        minutes_played: 0,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_card: false
      }));
      
      const awayStats = squadState.away.map(player => ({
        match_id: parseInt(matchId),
        player_id: player.player_id,
        team_id: parseInt(form.away_team_id),
        is_started: player.is_started || false,
        is_substitute: player.is_substitute || false,
        is_foreign: player.is_foreign || false,
        is_self: player.is_self || false,
        minutes_played: 0,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_card: false
      }));
      
      // Combine all stats to save
      const statsToSave = [...homeStats, ...awayStats];

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

  // Получить список команд, которые уже играют в выбранном турнире и туре
  const getUsedTeamIds = () => {
    if (!form.tournament_id || !form.round) return [];
    return matches
      .filter(m => String(m.tournament_id) === String(form.tournament_id) && String(m.round) === String(form.round))
      .reduce((acc, m) => {
        acc.push(m.home_team_id, m.away_team_id);
        return acc;
      }, []);
  };

  // Получаем доступные команды для выбора
  const getAvailableTeams = (isHomeTeam = true) => {
    if (!teams) return [];
    
    // Фильтруем использованные команды в этом туре
    const usedTeamIds = getUsedTeamIds();
    
    return teams.filter(team => {
      // Если это список для домашней команды
      if (isHomeTeam) {
        return !usedTeamIds.includes(team.id) || team.id === Number(form.home_team_id);
      }
      // Если это список для гостевой команды
      return (!usedTeamIds.includes(team.id) || team.id === Number(form.away_team_id)) 
        && team.id !== Number(form.home_team_id); // Исключаем выбранную домашнюю команду
    });
  };

  // Получаем списки команд
  const availableHomeTeams = getAvailableTeams(true);
  const availableAwayTeams = getAvailableTeams(false);

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

  // Сохраняем последние значения турнира и тура
  useEffect(() => {
    if (form.tournament_id) {
      localStorage.setItem('lastTournamentId', form.tournament_id);
    }
    if (form.round) {
      localStorage.setItem('lastRound', form.round);
    }
  }, [form.tournament_id, form.round]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Собираем match_time в формате YYYY-MM-DDTHH:MM:SS
      const match_time = form.match_date && form.match_time
        ? `${form.match_date}T${form.match_time}`
        : null;
      
      const createdMatch = await matchesApi.createMatch({
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

      if (createdMatch && createdMatch.id) {
        const statsSuccess = await saveMatchStats(createdMatch.id);
        
        if (!statsSuccess) {
          alert('Матч создан, но возникли проблемы при сохранении составов команд.');
        }
      }
      
      setLoading(false);
      router.push('/admin/matches');
    } catch (error) {
      console.error('Ошибка при создании матча:', error);
      setLoading(false);
      alert('Произошла ошибка при создании матча.');
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Добавить матч</h1>
      
      <Tabs selectedIndex={activeTab} onSelect={index => setActiveTab(index)}>
        <TabList className="flex mb-4">
          <Tab className={`py-2 px-4 mr-2 cursor-pointer ${activeTab === 0 ? 'bg-blue-500 text-white rounded' : 'bg-gray-100 rounded'}`}>Основная информация</Tab>
          <Tab className={`py-2 px-4 mr-2 cursor-pointer ${activeTab === 1 ? 'bg-blue-500 text-white rounded' : 'bg-gray-100 rounded'}`} disabled={!form.home_team_id || !form.away_team_id}>Составы команд</Tab>
        </TabList>
        
        <TabPanel>
          <form className="space-y-4 max-w-lg">
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
              {availableHomeTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
            </select>
            <select name="away_team_id" value={form.away_team_id} onChange={handleChange} className="input w-full" required>
              <option value="">Гостевая команда</option>
              {availableAwayTeams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
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
          </form>
        </TabPanel>
        
        <TabPanel>
          {form.home_team_id && form.away_team_id ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <SquadSelector
                  teamId={form.home_team_id}
                  teamName={teams.find(t => t.id === parseInt(form.home_team_id))?.name}
                  players={homePlayers.filter(p => p.team_id === parseInt(form.home_team_id))}
                  savedSquad={squadState.home}
                  onChange={handleSquadChange}
                  tournamentId={form.tournament_id}
                />
              </div>
              <div>
                <SquadSelector
                  teamId={form.away_team_id}
                  teamName={teams.find(t => t.id === parseInt(form.away_team_id))?.name}
                  players={awayPlayers.filter(p => p.team_id === parseInt(form.away_team_id))}
                  savedSquad={squadState.away}
                  onChange={handleSquadChange}
                  tournamentId={form.tournament_id}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Сначала выберите команды для матча во вкладке "Основная информация"</p>
            </div>
          )}
        </TabPanel>
      </Tabs>
      
      <div className="mt-6">
        <button onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </div>
  );
} 