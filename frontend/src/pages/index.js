import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { FaFutbol, FaUsers, FaTrophy, FaCalendarAlt } from 'react-icons/fa';
import { getTournaments, getMatches, getTeams } from '../utils/api';
import { useRouter } from 'next/router';
import ApiStatus from '../components/ApiStatus';

export default function Home() {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tournamentTable, setTournamentTable] = useState([]);
  const [teamsMap, setTeamsMap] = useState({});
  const router = useRouter();

  const categories = [
    { title: 'Команды', icon: <FaUsers size={24} />, href: '/teams', color: 'bg-blue-500' },
    { title: 'Игроки', icon: <FaFutbol size={24} />, href: '/players', color: 'bg-green-500' },
    { title: 'Турниры', icon: <FaTrophy size={24} />, href: '/tournaments', color: 'bg-yellow-500' },
    { title: 'Матчи', icon: <FaCalendarAlt size={24} />, href: '/matches', color: 'bg-red-500' },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const tournamentsData = await getTournaments();
        // Sort tournaments from newest to oldest
        const sortedTournaments = tournamentsData.sort((a, b) => {
          // Sort by season (assuming higher number is newer)
          if (a.season && b.season) {
            return b.season - a.season;
          }
          // If no season, sort by id (assuming higher id is newer)
          return b.id - a.id;
        });
        
        setTournaments(sortedTournaments);
        
        // Set first tournament as default selected
        if (sortedTournaments.length > 0) {
          setSelectedTournament(sortedTournaments[0]);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchMatches() {
      if (selectedTournament) {
        try {
          // Загружаем матчи
          const matchesData = await getMatches({ tournament_id: selectedTournament.id });
          setMatches(matchesData);
          
          // Загружаем команды и обновляем teamsMap
          const allTeams = await getTeams();
          const map = {};
          allTeams.forEach(team => {
            map[team.id] = team.name;
          });
          setTeamsMap(map);
          
          // Generate tournament table data
          if (activeTab === 'table') {
            generateTournamentTable(matchesData, selectedTournament);
          }
        } catch (error) {
          console.error("Error fetching matches:", error);
        }
      }
    }
    
    fetchMatches();
  }, [selectedTournament]);
  
  useEffect(() => {
    if (activeTab === 'table' && matches.length > 0 && selectedTournament) {
      generateTournamentTable(matches, selectedTournament);
    }
  }, [activeTab, matches, selectedTournament]);

  // Generate tournament table from matches
  const generateTournamentTable = async (matchesData, tournament) => {
    try {
      // Получаем список всех команд-участников турнира
      let participantIds = [];
      if (tournament.teams && Array.isArray(tournament.teams) && tournament.teams.length > 0) {
        participantIds = tournament.teams.map(t => t.team_id);
      }
      if (!participantIds.length) {
        setTournamentTable([]);
        return;
      }
      // Получаем данные только по этим командам
      const allTeams = await getTeams();
      const teamsData = allTeams.filter(team => participantIds.includes(team.id));
      if (!teamsData || teamsData.length === 0) {
        setTournamentTable([]);
        return;
      }
      
      // Создаём объект для быстрого поиска команд по id
      const map = {};
      teamsData.forEach(team => {
        map[team.id] = team.name;
      });
      setTeamsMap(map);
      
      // Создаём массив для данных таблицы
      const tableData = teamsData.map(team => {
        // Находим все матчи для этой команды со статусом finished
        const teamMatches = matchesData.filter(match => 
          (match.home_team_id === team.id || match.away_team_id === team.id) && 
          match.status === 'finished'
        );
        
        // Вычисляем статистику
        let played = 0;
        let wins = 0;
        let draws = 0;
        let losses = 0;
        let goalsFor = 0;
        let goalsAgainst = 0;
        let points = 0;
        let recentForm = [];
        
        teamMatches.forEach(match => {
          if (match.status !== 'finished') return;
          
          played++;
          const isHome = match.home_team_id === team.id;
          const teamScore = isHome ? match.home_score : match.away_score;
          const opponentScore = isHome ? match.away_score : match.home_score;
          
          goalsFor += teamScore || 0;
          goalsAgainst += opponentScore || 0;
          
          // Определяем результат матча для команды
          let result;
          if (teamScore > opponentScore) {
            wins++;
            points += 3;
            result = 'В';
          } else if (teamScore === opponentScore) {
            draws++;
            points += 1;
            result = 'Н';
          } else {
            losses++;
            result = 'П';
          }
          
          // Добавляем в массив последних результатов
          recentForm.push({
            result,
            date: match.match_date
          });
        });
        
        // Сортируем последние матчи по дате (новые в начале) и берём только 5
        recentForm.sort((a, b) => new Date(b.date) - new Date(a.date));
        recentForm = recentForm.slice(0, 5).map(form => form.result);
        
        return {
          id: team.id,
          name: team.name,
          played,
          wins,
          draws,
          losses,
          goalsFor,
          goalsAgainst,
          goalDifference: goalsFor - goalsAgainst,
          points,
          recentForm
        };
      });
      
      // Сортируем по очкам, а для равных очков — по личным встречам, затем по победам, разнице, забитым
      tableData.sort((a, b) => {
        if (a.points !== b.points) {
          return b.points - a.points;
        }
        // Только для равных очков:
        // 1. Личные встречи
        const tiedTeams = tableData.filter(t => t.points === a.points);
        if (tiedTeams.length > 1 && tiedTeams.some(t => t.id === a.id) && tiedTeams.some(t => t.id === b.id)) {
          // Найти все матчи между этими командами
          const headToHeadMatches = matchesData.filter(match => {
            return (
              [a.id, b.id].includes(match.home_team_id) &&
              [a.id, b.id].includes(match.away_team_id) &&
              match.status === 'finished'
            );
          });
          // Статистика личных встреч
          let aH2HPoints = 0, bH2HPoints = 0, aH2HGD = 0, bH2HGD = 0, aH2HGF = 0, bH2HGF = 0;
          headToHeadMatches.forEach(match => {
            const aIsHome = match.home_team_id === a.id;
            const bIsHome = match.home_team_id === b.id;
            const aScore = aIsHome ? match.home_score : match.away_score;
            const bScore = bIsHome ? match.home_score : match.away_score;
            // Очки
            if (aScore > bScore) aH2HPoints += 3;
            else if (aScore === bScore) { aH2HPoints += 1; bH2HPoints += 1; }
            else bH2HPoints += 3;
            // Разница
            aH2HGD += aScore - bScore;
            bH2HGD += bScore - aScore;
            // Забитые
            aH2HGF += aScore;
            bH2HGF += bScore;
          });
          // 1.1 Очки в личных встречах
          if (aH2HPoints !== bH2HPoints) return bH2HPoints - aH2HPoints;
          // 1.2 Разница голов в личных встречах
          if (aH2HGD !== bH2HGD) return bH2HGD - aH2HGD;
          // 1.3 Забитые в личных встречах
          if (aH2HGF !== bH2HGF) return bH2HGF - aH2HGF;
        }
        // 2. Количество побед
        if (a.wins !== b.wins) {
          return b.wins - a.wins;
        }
        // 3. Общая разница голов
        if (a.goalDifference !== b.goalDifference) {
          return b.goalDifference - a.goalDifference;
        }
        // 4. Общее количество забитых голов
        if (a.goalsFor !== b.goalsFor) {
          return b.goalsFor - a.goalsFor;
        }
        return 0;
      });
      
      setTournamentTable(tableData);
    } catch (error) {
      console.error("Error generating tournament table:", error);
      setTournamentTable([]);
    }
  };

  // Filter matches based on active tab
  const filteredMatches = matches.filter(match => {
    if (activeTab === 'schedule') {
      return ['scheduled', 'postponed', 'live'].includes(match.status);
    } else if (activeTab === 'results') {
      return ['finished', 'canceled'].includes(match.status);
    }
    return true;
  });

  // Format date for display
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      const parts = dateStr.split('-');
      return `${parts[2]}.${parts[1]}`;
    } catch (e) {
      return dateStr;
    }
  };

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    
    // If timeStr is full ISO datetime format
    if (timeStr.includes('T')) {
      return timeStr.split('T')[1].substring(0, 5);
    }
    
    // If timeStr already in HH:MM format
    if (timeStr.length >= 5) {
      return timeStr.substring(0, 5);
    }
    
    return timeStr;
  };
  
  // Render recent form
  const renderRecentForm = (forms) => {
    if (!forms || forms.length === 0) return <span className="text-gray-400">Нет данных</span>;
    
    return (
      <div className="flex space-x-1">
        {forms.map((form, index) => {
          let bgColor = 'bg-gray-200';
          if (form === 'В') bgColor = 'bg-green-500';
          else if (form === 'Н') bgColor = 'bg-yellow-500';
          else if (form === 'П') bgColor = 'bg-red-500';
          
          return (
            <span key={index} className={`${bgColor} text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold`}>
              {form}
            </span>
          );
        })}
      </div>
    );
  };

  // Определение статуса матча (иконка)
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

  // Определение победившей команды
  const getWinningTeamId = (match) => {
    if (!match) return null;
    
    if (match.home_score > match.away_score) {
      return match.home_team?.id;
    } else if (match.away_score > match.home_score) {
      return match.away_team?.id;
    }
    
    return null; // Ничья или нет счета
  };

  // Группировка матчей по турам
  const getMatchesByRound = (matchesData) => {
    const matchesByRound = {};
    
    matchesData.forEach(match => {
      const round = match.round || 'Без тура';
      
      if (!matchesByRound[round]) {
        matchesByRound[round] = [];
      }
      
      matchesByRound[round].push(match);
    });
    
    return matchesByRound;
  };

  return (
    <>
      <Head>
        <title>Футбольная статистика</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <section className="mb-10">
          <div className="card p-6">
            <h2 className="text-2xl font-bold mb-6">Турниры и соревнования</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Tournament selector (left column) */}
              <div className="md:col-span-3 border-r pr-4">
                <h3 className="text-lg font-semibold mb-4">Выберите турнир</h3>
                {loading ? (
                  <p>Загрузка турниров...</p>
                ) : (
                  <div className="space-y-2">
                    {tournaments.map(tournament => (
                      <div 
                        key={tournament.id}
                        className={`p-3 rounded cursor-pointer transition-colors ${selectedTournament?.id === tournament.id 
                          ? 'bg-blue-100 border-l-4 border-blue-500' 
                          : 'hover:bg-gray-100'}`}
                        onClick={() => setSelectedTournament(tournament)}
                      >
                        <div className="font-medium">{tournament.name}</div>
                        <div className="text-sm text-gray-600">
                          {tournament.season && `Сезон ${tournament.season}`}
                          {tournament.format && ` • ${tournament.format}`}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tournament data (right column) with tabs */}
              <div className="md:col-span-9">
                {selectedTournament && (
                  <>
                    <div className="mb-4">
                      <h3 className="text-xl font-semibold">{selectedTournament.name}</h3>
                      <div className="text-sm text-gray-600">
                        {selectedTournament.season && `Сезон ${selectedTournament.season}`}
                        {selectedTournament.format && ` • ${selectedTournament.format}`}
                      </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="border-b mb-4">
                      <div className="flex">
                        <button
                          className={`py-2 px-4 font-medium text-sm border-b-2 ${activeTab === 'schedule' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                          onClick={() => setActiveTab('schedule')}
                        >
                          Расписание
                        </button>
                        <button
                          className={`py-2 px-4 font-medium text-sm border-b-2 ${activeTab === 'results' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                          onClick={() => setActiveTab('results')}
                        >
                          Результаты
                        </button>
                        <button
                          className={`py-2 px-4 font-medium text-sm border-b-2 ${activeTab === 'table' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                          onClick={() => setActiveTab('table')}
                        >
                          Турнирная таблица
                        </button>
                      </div>
                    </div>
                    
                    {/* Tab content */}
                    <div>
                      {activeTab === 'schedule' && (
                        <div>
                          <h4 className="text-lg font-medium mb-3">Предстоящие матчи</h4>
                          {filteredMatches.length > 0 ? (
                            <div className="overflow-x-auto">
                              {Object.entries(getMatchesByRound(filteredMatches))
                                .sort(([roundA, _matchesA], [roundB, _matchesB]) => {
                                  if (roundA === 'Без тура') return 1;
                                  if (roundB === 'Без тура') return -1;
                                  return parseInt(roundA) - parseInt(roundB);
                                })
                                .map(([round, roundMatches]) => (
                                <div key={round} className="mb-6">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="w-32 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Дата/Время</th>
                                        <th className="w-20 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                                        <th className="w-64 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Команды</th>
                                        <th className="w-48 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Стадион</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {/* Строка с номером тура между шапкой и матчами */}
                                      <tr className="bg-gray-50 border-b border-gray-200">
                                        <td colSpan="4" className="px-4 py-1 text-sm font-medium text-gray-600">
                                          <div className="flex items-center">
                                            <span className="bg-blue-500 w-2 h-4 mr-2"></span>
                                            {round === 'Без тура' ? 'Матчи без тура' : `Тур ${round}`}
                                          </div>
                                        </td>
                                      </tr>
                                      {roundMatches.map(match => {
                                        return (
                                          <tr 
                                            key={match.id} 
                                            className="hover:bg-gray-50 border-b cursor-pointer" 
                                            onClick={() => router.push(`/matches/${match.id}`)}
                                          >
                                            <td className="px-4 py-2 text-center">
                                              <div>{formatDate(match.match_date)}</div>
                                              <div className="text-sm text-gray-600">{formatTime(match.match_time)}</div>
                                            </td>
                                            <td className="px-4 py-2 text-center">{getStatusBadge(match.status)}</td>
                                            <td className="px-4 py-2 text-left">
                                              <div className="text-black">
                                                {teamsMap[match.home_team_id] || "Загрузка..."}
                                              </div>
                                              <div className="text-black">
                                                {teamsMap[match.away_team_id] || "Загрузка..."}
                                              </div>
                                            </td>
                                            <td className="px-4 py-2 text-left text-sm text-gray-600">
                                              {match.stadium ? (
                                                <div>
                                                  <div>{match.stadium.name}</div>
                                                  {match.stadium.city && (
                                                    <div className="text-xs text-gray-500">{match.stadium.city.name}</div>
                                                  )}
                                                </div>
                                              ) : (
                                                "Не указан"
                                              )}
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">Нет предстоящих матчей</p>
                          )}
                        </div>
                      )}
                      
                      {activeTab === 'results' && (
                        <div>
                          <h4 className="text-lg font-medium mb-3">Результаты матчей</h4>
                          {filteredMatches.length > 0 ? (
                            <div className="overflow-x-auto">
                              {Object.entries(getMatchesByRound(filteredMatches))
                                .sort(([roundA, _matchesA], [roundB, _matchesB]) => {
                                  if (roundA === 'Без тура') return 1;
                                  if (roundB === 'Без тура') return -1;
                                  return parseInt(roundB) - parseInt(roundA);
                                })
                                .map(([round, roundMatches]) => (
                                <div key={round} className="mb-6">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="w-32 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Дата/Время</th>
                                        <th className="w-20 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                                        <th className="w-64 px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Команды</th>
                                        <th className="w-20 px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Счет</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {/* Строка с номером тура между шапкой и матчами */}
                                      <tr className="bg-gray-50 border-b border-gray-200">
                                        <td colSpan="4" className="px-4 py-1 text-sm font-medium text-gray-600">
                                          <div className="flex items-center">
                                            <span className="bg-blue-500 w-2 h-4 mr-2"></span>
                                            {round === 'Без тура' ? 'Матчи без тура' : `Тур ${round}`}
                                          </div>
                                        </td>
                                      </tr>
                                      {roundMatches.map(match => {
                                        const homeWinner = match.home_score > match.away_score;
                                        const awayWinner = match.away_score > match.home_score;
                                        
                                        return (
                                          <tr 
                                            key={match.id} 
                                            className="hover:bg-gray-50 border-b cursor-pointer" 
                                            onClick={() => router.push(`/matches/${match.id}`)}
                                          >
                                            <td className="px-4 py-2 text-center">
                                              <div>{formatDate(match.match_date)}</div>
                                              <div className="text-sm text-gray-600">{formatTime(match.match_time)}</div>
                                            </td>
                                            <td className="px-4 py-2 text-center">{getStatusBadge(match.status)}</td>
                                            <td className="px-4 py-2 text-left">
                                              <div className={`${homeWinner ? 'font-bold' : ''} text-black`}>
                                                {teamsMap[match.home_team_id] || "Загрузка..."}
                                              </div>
                                              <div className={`${awayWinner ? 'font-bold' : ''} text-black`}>
                                                {teamsMap[match.away_team_id] || "Загрузка..."}
                                              </div>
                                            </td>
                                            <td className="px-4 py-2 text-center">
                                              <div className={homeWinner ? 'font-bold' : ''}>
                                                {typeof match.home_score === 'number' ? match.home_score : '0'}
                                              </div>
                                              <div className={awayWinner ? 'font-bold' : ''}>
                                                {typeof match.away_score === 'number' ? match.away_score : '0'}
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500">Нет результатов матчей</p>
                          )}
                        </div>
                      )}
                      
                      {activeTab === 'table' && (
                        <div>
                          <h4 className="text-lg font-medium mb-3">Турнирная таблица</h4>
                          {tournamentTable.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="w-10 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                                    <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Команда</th>
                                    <th className="w-10 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">И</th>
                                    <th className="w-10 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">В</th>
                                    <th className="w-10 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Н</th>
                                    <th className="w-10 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">П</th>
                                    <th className="w-10 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ЗМ</th>
                                    <th className="w-10 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ПМ</th>
                                    <th className="w-10 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">РМ</th>
                                    <th className="w-10 px-2 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">О</th>
                                    <th className="w-32 px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Форма</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {tournamentTable.map((team, index) => {
                                    // Определяем стили для места
                                    let placeStyle = '';
                                    let placeContent = index + 1;
                                    if (index === 0) {
                                      placeStyle = 'bg-yellow-300 text-yellow-900';
                                      placeContent = <span title="1 место 🥇">{index + 1}</span>;
                                    } else if (index === 1) {
                                      placeStyle = 'bg-gray-300 text-gray-900';
                                      placeContent = <span title="2 место 🥈">{index + 1}</span>;
                                    } else if (index === 2) {
                                      placeStyle = 'bg-amber-700 text-amber-50';
                                      placeContent = <span title="3 место 🥉">{index + 1}</span>;
                                    } else if (index >= 8) {
                                      placeStyle = 'bg-red-100 text-red-900';
                                    }
                                    
                                    // Определяем стиль для названия команды
                                    const teamNameStyle = index <= 2 ? 'font-bold' : '';
                                    
                                    return (
                                      <tr key={team.id} className="hover:bg-gray-50 border-b">
                                        <td className={`px-2 py-1 text-center font-bold ${placeStyle}`}>{placeContent}</td>
                                        <td className="px-2 py-1 text-left">
                                          <Link href={`/teams/${team.id}`}>
                                            <span className={`text-black ${teamNameStyle}`}>{team.name}</span>
                                          </Link>
                                        </td>
                                        <td className="px-2 py-1 text-center">{team.played}</td>
                                        <td className="px-2 py-1 text-center">{team.wins}</td>
                                        <td className="px-2 py-1 text-center">{team.draws}</td>
                                        <td className="px-2 py-1 text-center">{team.losses}</td>
                                        <td className="px-2 py-1 text-center">{team.goalsFor}</td>
                                        <td className="px-2 py-1 text-center">{team.goalsAgainst}</td>
                                        <td className="px-2 py-1 text-center">{team.goalDifference}</td>
                                        <td className="px-2 py-1 text-center font-bold">{team.points}</td>
                                        <td className="px-2 py-1">
                                          <div className="flex space-x-1">
                                            {(team.recentForm || []).slice(0, 5).map((form, index) => {
                                              let bgColor = 'bg-gray-200';
                                              if (form === 'В') bgColor = 'bg-green-500';
                                              else if (form === 'Н') bgColor = 'bg-yellow-500';
                                              else if (form === 'П') bgColor = 'bg-red-500';
                                              
                                              return (
                                                <span key={index} className={`${bgColor} text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold`}>
                                                  {form}
                                                </span>
                                              );
                                            })}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <p className="text-gray-500">Нет данных для турнирной таблицы</p>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
        <ApiStatus />
      </div>
    </>
  );
}