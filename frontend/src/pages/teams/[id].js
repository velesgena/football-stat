import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import useSWR from 'swr';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FaArrowLeft, FaMapMarkerAlt, FaFutbol, FaCalendarAlt, FaTrophy } from 'react-icons/fa';
import { deleteTeam, getMatches, getTournaments, getTeams, getStadiums, getReferees, getTeamDetails, getTeamMatches } from '../../utils/api';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import { formatErrorMessage } from '../../utils/errorHandler';
import ErrorMessage from '../../components/ui/ErrorMessage';
import TeamInfo from '../../components/teams/TeamInfo';
import MatchList from '../../components/matches/MatchList';

const calculateOverallStats = (matches, teamId) => {
  const stats = matches
    .filter(match => match.status === 'finished')
    .reduce((acc, match) => {
      const isHome = String(match.home_team_id) === String(teamId);
      const goalsFor = isHome ? Number(match.home_score) : Number(match.away_score);
      const goalsAgainst = isHome ? Number(match.away_score) : Number(match.home_score);

      if (goalsFor > goalsAgainst) acc.wins++;
      else if (goalsFor < goalsAgainst) acc.losses++;
      else acc.draws++;

      acc.goalsFor += goalsFor;
      acc.goalsAgainst += goalsAgainst;
      acc.matches++;

      return acc;
    }, { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, matches: 0 });

  return [
    { label: 'Матчей сыграно', value: stats.matches },
    { label: 'Победы', value: stats.wins },
    { label: 'Ничьи', value: stats.draws },
    { label: 'Поражения', value: stats.losses },
    { label: 'Забито голов', value: stats.goalsFor },
    { label: 'Пропущено голов', value: stats.goalsAgainst },
    { label: 'Разница голов', value: stats.goalsFor - stats.goalsAgainst },
    { label: 'Процент побед', value: stats.matches ? Math.round((stats.wins / stats.matches) * 100) + '%' : '0%' }
  ];
};

const calculateTournamentStats = (matches, teamId) => {
  const stats = matches
    .filter(match => match.status === 'finished')
    .reduce((acc, match) => {
      const isHome = String(match.home_team_id) === String(teamId);
      const goalsFor = isHome ? Number(match.home_score) : Number(match.away_score);
      const goalsAgainst = isHome ? Number(match.away_score) : Number(match.home_score);

      if (goalsFor > goalsAgainst) acc.wins++;
      else if (goalsFor < goalsAgainst) acc.losses++;
      else acc.draws++;

      acc.goalsFor += goalsFor;
      acc.goalsAgainst += goalsAgainst;
      acc.matches++;

      return acc;
    }, { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, matches: 0 });

  return [
    { label: 'Матчей сыграно', value: stats.matches },
    { label: 'Победы', value: stats.wins },
    { label: 'Ничьи', value: stats.draws },
    { label: 'Поражения', value: stats.losses },
    { label: 'Забито голов', value: stats.goalsFor },
    { label: 'Пропущено голов', value: stats.goalsAgainst },
    { label: 'Разница голов', value: stats.goalsFor - stats.goalsAgainst },
    { label: 'Процент побед', value: stats.matches ? Math.round((stats.wins / stats.matches) * 100) + '%' : '0%' }
  ];
};

export default function TeamDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    team: null,
    matches: [],
    tournaments: [],
    stadiums: [],
    referees: []
  });

  useEffect(() => {
    async function loadTeamData() {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Загружаем все данные параллельно
        const [teamDetails, teamMatches] = await Promise.all([
          getTeamDetails(id),
          getTeamMatches(id)
        ]);
        
        setData({
          team: teamDetails.team,
          matches: teamMatches.matches,
          tournaments: teamMatches.tournaments,
          stadiums: teamMatches.stadiums,
          referees: teamMatches.referees
        });
      } catch (err) {
        console.error('Error loading team data:', err);
        setError(formatErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    
    loadTeamData();
  }, [id]);

  if (!id) {
    return <LoadingSpinner />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  const { team, matches, tournaments, stadiums, referees } = data;

  return (
    <>
      <Head>
        <title>{team?.name} | Футбольная статистика</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <Link href="/teams">
          <button className="flex items-center text-primary mb-6">
            <FaArrowLeft className="mr-2" /> Вернуться к списку команд
          </button>
        </Link>
        <div className="flex gap-2 mb-6">
          <Link href={`/admin/teams/edit/${team?.id}`}>
            <button className="btn btn-outline btn-sm">Редактировать</button>
          </Link>
          <button className="btn btn-outline btn-error btn-sm" onClick={async () => {
            if (confirm('Вы действительно хотите удалить эту команду?')) {
              await deleteTeam(team?.id);
              router.push('/teams');
            }
          }}>
            Удалить
          </button>
        </div>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary text-white p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              {team?.logo_url && (
                <div className="mb-4 md:mb-0 mr-6">
                  <img 
                    src={team.logo_url} 
                    alt={`${team.name} логотип`} 
                    className="h-24 w-24 object-contain bg-white rounded-full p-1"
                  />
                </div>
              )}
              <div className="flex-grow text-center md:text-left">
                <div className="flex justify-between items-center">
                  <h1 className="text-3xl font-bold mb-2">{team.name}</h1>
                  {team.founded_year && (
                    <div className="text-white/80">
                      Основан в {team.founded_year} году
                    </div>
                  )}
                </div>
                {team.city && (
                  <div className="flex items-center justify-center md:justify-start text-white/80 mb-1">
                    <FaMapMarkerAlt className="mr-1" />
                    <span>{team.city.name}, {team.city.country}</span>
                  </div>
                )}
                {team.stadium && (
                  <div className="flex items-center justify-center md:justify-start text-white/80">
                    <FaFutbol className="mr-1" />
                    <span>{team.stadium.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-6">
            <Tabs selectedIndex={activeTab} onSelect={setActiveTab}>
              <TabList>
                <Tab>Результаты</Tab>
                <Tab>Календарь</Tab>
                <Tab>Статистика</Tab>
                <Tab>Состав</Tab>
              </TabList>
              <TabPanel>
                {/* Результаты */}
                <h2 className="text-xl font-semibold mb-4">Результаты команды по турнирам</h2>
                <TeamInfo team={team} />
              </TabPanel>
              <TabPanel>
                {/* Календарь */}
                <h2 className="text-xl font-semibold mb-4">Календарь матчей по турнирам</h2>
                <MatchList
                  matches={matches}
                  tournaments={tournaments}
                  stadiums={stadiums}
                  referees={referees}
                />
              </TabPanel>
              <TabPanel>
                {/* Статистика */}
                <h2 className="text-xl font-semibold mb-4">Статистика команды</h2>
                <div className="space-y-8">
                  {/* Общая статистика */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Общая статистика</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {calculateOverallStats(matches, id).map(stat => (
                        <div key={stat.label} className="bg-white p-4 rounded-lg shadow">
                          <div className="text-gray-600 text-sm">{stat.label}</div>
                          <div className="text-2xl font-bold mt-1">{stat.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Статистика по турнирам */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Статистика по турнирам</h3>
                    {Object.values(
                      matches.reduce((acc, match) => {
                        const tId = match.tournament_id;
                        if (!acc[tId]) {
                          acc[tId] = {
                            tournament: tournaments.find(t => t.id === tId),
                            matches: []
                          };
                        }
                        acc[tId].matches.push(match);
                        return acc;
                      }, {})
                    ).map(({ tournament, matches }) => (
                      <div key={tournament?.id} className="mb-6">
                        <h4 className="text-md font-semibold mb-2">
                          {tournament?.name || 'Турнир'}
                          {tournament?.season && <span className="ml-2 text-gray-500">{tournament.season}</span>}
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full table-auto border">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left">Показатель</th>
                                <th className="px-3 py-2 text-center">Значение</th>
                              </tr>
                            </thead>
                            <tbody>
                              {calculateTournamentStats(matches, id).map(stat => (
                                <tr key={stat.label} className="border-b">
                                  <td className="px-3 py-2">{stat.label}</td>
                                  <td className="px-3 py-2 text-center">{stat.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabPanel>
              <TabPanel>
                {/* Состав */}
                <h2 className="text-xl font-semibold mb-4">Состав команды</h2>
                <div className="space-y-8">
                  {Object.values(
                    tournaments.reduce((acc, tournament) => {
                      const tournamentPlayers = team.players?.filter(p => 
                        p.tournaments?.some(t => t.tournament_id === tournament.id)
                      ) || [];
                      
                      if (tournamentPlayers.length > 0) {
                        acc[tournament.id] = {
                          tournament,
                          players: tournamentPlayers
                        };
                      }
                      return acc;
                    }, {})
                  ).map(({ tournament, players }) => (
                    <div key={tournament.id} className="bg-white rounded-lg shadow-md p-4">
                      <h3 className="text-lg font-semibold mb-4">
                        {tournament.name}
                        {tournament.season && <span className="ml-2 text-gray-500">{tournament.season}</span>}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full table-auto">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left">№</th>
                              <th className="px-3 py-2 text-left">Игрок</th>
                              <th className="px-3 py-2 text-left">Позиция</th>
                              <th className="px-3 py-2 text-center">Возраст</th>
                              <th className="px-3 py-2 text-center">Статус</th>
                            </tr>
                          </thead>
                          <tbody>
                            {players
                              .sort((a, b) => {
                                // Сортировка по позиции и номеру
                                const posOrder = { 'Вратарь': 1, 'Защитник': 2, 'Полузащитник': 3, 'Нападающий': 4 };
                                const posA = posOrder[a.position] || 5;
                                const posB = posOrder[b.position] || 5;
                                if (posA !== posB) return posA - posB;
                                return (a.jersey_number || 99) - (b.jersey_number || 99);
                              })
                              .map(player => {
                                const tournamentStatus = player.tournaments?.find(t => t.tournament_id === tournament.id);
                                const age = player.date_of_birth ? calculateAge(player.date_of_birth) : null;
                                
                                return (
                                  <tr key={player.id} className="border-b hover:bg-gray-50">
                                    <td className="px-3 py-2">{player.jersey_number || '-'}</td>
                                    <td className="px-3 py-2">
                                      <div>{player.last_name} {player.first_name}</div>
                                      <div className="text-xs text-gray-500">{player.city?.name}</div>
                                    </td>
                                    <td className="px-3 py-2">{player.position || '-'}</td>
                                    <td className="px-3 py-2 text-center">{age || '-'}</td>
                                    <td className="px-3 py-2 text-center">
                                      <div className="space-x-1">
                                        {tournamentStatus?.is_foreign && (
                                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-800">Л</span>
                                        )}
                                        {tournamentStatus?.is_self && (
                                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-800">С</span>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}

// Helper functions
function calculateAge(dateOfBirth) {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
} 