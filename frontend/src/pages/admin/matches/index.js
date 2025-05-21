import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { matchesApi, teamsApi, stadiumsApi, refereesApi, tournamentsApi } from '../../../services/api';

export default function AdminMatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stadiums, setStadiums] = useState([]);
  const [referees, setReferees] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule'); // Default to schedule tab

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [matchesData, teamsData, stadiumsData, refereesData, tournamentsData] = await Promise.all([
        matchesApi.getAllMatches(),
        teamsApi.getAllTeams(),
        stadiumsApi.getAllStadiums(),
        refereesApi.getAllReferees(),
        tournamentsApi.getAllTournaments()
      ]);
      setMatches(matchesData);
      setTeams(teamsData);
      setStadiums(stadiumsData);
      setReferees(refereesData);
      setTournaments(tournamentsData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const getTeamName = (id) => teams.find(t => t.id === id)?.name || id;
  const getStadiumName = (id) => {
    const stadium = stadiums.find(s => s.id === id);
    if (!stadium) return '';
    return (
      <div>
        <div>{stadium.name}</div>
        {stadium.city && <div className="text-sm text-gray-600">{stadium.city.name}</div>}
      </div>
    );
  };
  const getRefereeName = (id) => {
    const r = referees.find(r => r.id === id);
    return r ? `${r.last_name} ${r.first_name}` : '';
  };
  const getTournamentName = (id) => tournaments.find(t => t.id === id)?.name || '';
  const getTournamentSeason = (id) => tournaments.find(t => t.id === id)?.season || '';
  const getTournamentFormat = (id) => tournaments.find(t => t.id === id)?.format || '';

  // Форматирование времени в нужный формат
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    
    // Если timeStr - полный ISO datetime формат
    if (timeStr.includes('T')) {
      return timeStr.split('T')[1].substring(0, 5);
    }
    
    // Если timeStr уже в формате HH:MM
    if (timeStr.length >= 5) {
      return timeStr.substring(0, 5);
    }
    
    return timeStr;
  };

  // Форматирование даты в формат ДД.ММ
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      const parts = dateStr.split('-');
      return `${parts[2]}.${parts[1]}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Определение победившей команды
  const getWinningTeamId = (match) => {
    if (!match) return null;
    
    if (match.home_score > match.away_score) {
      return match.home_team_id;
    } else if (match.away_score > match.home_score) {
      return match.away_team_id;
    }
    
    return null; // Ничья или нет счета
  };

  // Определение статуса матча
  const getStatusBadge = (status) => {
    switch (status) {
      case 'scheduled':
        return <span className="inline-block w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center" title="Запланирован">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </span>;
      case 'finished':
        return <span className="inline-block w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center" title="Завершен">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </span>;
      case 'canceled':
        return <span className="inline-block w-6 h-6 bg-gray-100 text-gray-800 rounded-full flex items-center justify-center" title="Отменен">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </span>;
      case 'postponed':
        return <span className="inline-block w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center" title="Перенесен">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </span>;
      case 'live':
        return <span className="inline-block w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center animate-pulse" title="Идет сейчас">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </span>;
      default:
        return <span className="inline-block w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center" title="Запланирован">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        </span>;
    }
  };

  async function handleDelete(e, id) {
    e.stopPropagation(); // Предотвращаем распространение события клика на строку
    if (!confirm('Удалить матч?')) return;
    setDeletingId(id);
    try {
      await matchesApi.deleteMatch(id);
      setMatches(matches => matches.filter(m => m.id !== id));
    } catch (e) {
      alert('Ошибка удаления');
    }
    setDeletingId(null);
  }

  // Переход к редактированию
  const handleRowClick = (id) => {
    router.push(`/admin/matches/edit/${id}`);
  };

  // Переход к информации о матче
  const handleInfoClick = (e, id) => {
    e.stopPropagation(); // Предотвращаем распространение события клика на строку
    router.push(`/matches/${id}`);
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div>Ошибка загрузки</div>;

  // Фильтр матчей в зависимости от выбранной вкладки
  const filterMatchesByTab = (matches) => {
    if (activeTab === 'schedule') {
      return matches.filter(match => 
        ['scheduled', 'postponed', 'live'].includes(match.status)
      );
    } else { // 'results'
      return matches.filter(match => 
        ['finished', 'canceled'].includes(match.status)
      );
    }
  };

  // Группируем матчи по турнирам
  const matchesByTournament = matches.reduce((acc, match) => {
    // Фильтруем матчи по текущей вкладке
    if ((activeTab === 'schedule' && !['scheduled', 'postponed', 'live'].includes(match.status)) ||
        (activeTab === 'results' && !['finished', 'canceled'].includes(match.status))) {
      return acc;
    }
    
    const tournamentId = match.tournament_id;
    const tournamentName = getTournamentName(tournamentId);
    const tournamentSeason = getTournamentSeason(tournamentId);
    const tournamentFormat = getTournamentFormat(tournamentId);
    
    if (!acc[tournamentId]) {
      acc[tournamentId] = {
        id: tournamentId,
        name: tournamentName,
        season: tournamentSeason,
        format: tournamentFormat,
        matchesByRound: {} // Объект для группировки по турам
      };
    }
    
    const round = match.round || 'Без тура';
    
    if (!acc[tournamentId].matchesByRound[round]) {
      acc[tournamentId].matchesByRound[round] = [];
    }
    
    acc[tournamentId].matchesByRound[round].push(match);
    return acc;
  }, {});

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Матчи</h1>
        <button className="btn btn-primary" onClick={() => router.push('/admin/matches/create')}>Добавить матч</button>
      </div>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button 
          className={`px-4 py-2 mr-4 text-sm font-medium border-b-2 ${activeTab === 'schedule' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:border-gray-300'}`}
          onClick={() => setActiveTab('schedule')}
        >
          Расписание
        </button>
        <button 
          className={`px-4 py-2 mr-4 text-sm font-medium border-b-2 ${activeTab === 'results' ? 'border-blue-500 text-blue-600' : 'border-transparent hover:border-gray-300'}`}
          onClick={() => setActiveTab('results')}
        >
          Результаты
        </button>
      </div>
      
      {Object.values(matchesByTournament).map((tournament) => (
        <div key={tournament.id} className="mb-8">
          <h2 className="text-xl font-semibold mb-3 bg-gray-100 p-2">
            {tournament.name}
            {tournament.format && <span className="text-base font-normal ml-2">({tournament.format})</span>}
            {tournament.season && <span className="text-base font-normal ml-2">• Сезон {tournament.season}</span>}
          </h2>
          
          {Object.entries(tournament.matchesByRound)
            // Сортируем туры по убыванию (последние туры сначала)
            // Исключаем "Без тура" из сортировки, чтобы он всегда был в конце
            .sort(([roundA, _matchesA], [roundB, _matchesB]) => {
              if (roundA === 'Без тура') return 1;
              if (roundB === 'Без тура') return -1;
              return parseInt(roundB) - parseInt(roundA);
            })
            .map(([round, roundMatches]) => (
            <div key={`${tournament.id}-${round}`} className="mb-6">
              <table className="table-auto w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="w-32 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Дата/Время</th>
                    <th className="w-20 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                    <th className="w-64 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Команды</th>
                    {activeTab === 'results' && (
                      <th className="w-20 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Счет</th>
                    )}
                    <th className="w-48 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Стадион</th>
                    <th className="w-24 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Строка с номером тура между шапкой и матчами */}
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <td colSpan={activeTab === 'results' ? "6" : "5"} className="px-4 py-1 text-sm font-medium text-gray-600">
                      <div className="flex items-center">
                        <span className="bg-blue-500 w-2 h-4 mr-2"></span>
                        {round === 'Без тура' ? 'Матчи без тура' : `Тур ${round}`}
                      </div>
                    </td>
                  </tr>
                  {roundMatches.map(match => {
                    const winningTeamId = getWinningTeamId(match);
                    
                    return (
                      <tr 
                        key={match.id} 
                        onClick={() => handleRowClick(match.id)}
                        className="cursor-pointer hover:bg-gray-100 border-b bg-white"
                      >
                        <td className="px-4 py-2 text-center">
                          <div>{formatDate(match.match_date)}</div>
                          <div className="text-sm text-gray-600">{formatTime(match.match_time)}</div>
                        </td>
                        <td className="px-4 py-2 text-center">{getStatusBadge(match.status)}</td>
                        <td className="px-4 py-2 text-left">
                          <div className={`${winningTeamId === match.home_team_id ? 'font-bold' : ''}`}>
                            {getTeamName(match.home_team_id)}
                          </div>
                          <div className={`${winningTeamId === match.away_team_id ? 'font-bold' : ''}`}>
                            {getTeamName(match.away_team_id)}
                          </div>
                        </td>
                        {activeTab === 'results' && (
                          <td className="px-4 py-2 text-center">
                            <div className={`${winningTeamId === match.home_team_id ? 'font-bold' : ''}`}>{match.home_score}</div>
                            <div className={`${winningTeamId === match.away_team_id ? 'font-bold' : ''}`}>{match.away_score}</div>
                          </td>
                        )}
                        <td className="px-4 py-2 text-left">{getStadiumName(match.stadium_id)}</td>
                        <td className="px-4 py-2 flex items-center justify-center space-x-2">
                          <button 
                            className="p-1 text-blue-500 hover:text-blue-700" 
                            onClick={(e) => handleInfoClick(e, match.id)} 
                            title="Информация о матче"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                          <button 
                            className="p-1 text-red-500 hover:text-red-700" 
                            onClick={(e) => handleDelete(e, match.id)} 
                            disabled={deletingId === match.id}
                            title="Удалить матч"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
} 