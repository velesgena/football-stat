import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import useFetch from '../../hooks/useFetch';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FaArrowLeft, FaTrophy, FaCalendarAlt, FaGlobe, FaUsers } from 'react-icons/fa';

export default function TournamentDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: tournament, isLoading, isError } = useFetch(id ? `/tournaments/${id}` : null);
  const { data: matches, isLoading: matchesLoading } = useFetch(id ? `/matches/?tournament_id=${id}` : null);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <LoadingSpinner className="py-20" />
      </div>
    );
  }
  
  if (isError || !tournament) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Турнир не найден</h1>
        <p className="mb-6">Турнир, который вы ищете, не существует или был удален.</p>
        <Link href="/tournaments">
          <button className="btn btn-primary">Вернуться к списку турниров</button>
        </Link>
      </div>
    );
  }

  const tournamentTypeMap = {
    'LEAGUE': 'Лига',
    'CUP': 'Кубок',
    'FRIENDLY': 'Товарищеский'
  };
  
  return (
    <>
      <Head>
        <title>{tournament.name} | Футбольная статистика</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <Link href="/tournaments">
          <button className="flex items-center text-primary mb-6">
            <FaArrowLeft className="mr-2" /> Вернуться к списку турниров
          </button>
        </Link>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary text-white p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              {tournament.logo_url && (
                <div className="mb-4 md:mb-0 mr-6">
                  <img 
                    src={tournament.logo_url} 
                    alt={`${tournament.name} логотип`} 
                    className="h-24 w-24 object-contain bg-white rounded-full p-1"
                  />
                </div>
              )}
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{tournament.name}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 text-white/80">
                  {tournament.season && (
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-1" />
                      <span>{tournament.season}</span>
                    </div>
                  )}
                  {tournament.tournament_type && (
                    <div className="flex items-center">
                      <FaTrophy className="mr-1" />
                      <span>{tournamentTypeMap[tournament.tournament_type] || tournament.tournament_type}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Информация о турнире</h2>
                <div className="space-y-3">
                  {tournament.start_date && (
                    <div className="flex justify-between">
                      <span className="font-medium">Дата начала:</span>
                      <span>{new Date(tournament.start_date).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                  {tournament.end_date && (
                    <div className="flex justify-between">
                      <span className="font-medium">Дата окончания:</span>
                      <span>{new Date(tournament.end_date).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                  {tournament.league && (
                    <div className="flex justify-between">
                      <span className="font-medium">Лига:</span>
                      <span>{tournament.league.name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Статистика</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Всего матчей:</span>
                    <span>{matches?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Завершенных матчей:</span>
                    <span>{matches?.filter(m => m.status === 'COMPLETED')?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Предстоящих матчей:</span>
                    <span>{matches?.filter(m => m.status === 'SCHEDULED')?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Ближайшие матчи</h2>
              {matchesLoading ? (
                <LoadingSpinner />
              ) : matches && matches.filter(m => m.status === 'SCHEDULED').length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Матч</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Стадион</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {matches
                        .filter(match => match.status === 'SCHEDULED')
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .slice(0, 5)
                        .map(match => (
                        <tr key={match.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(match.date).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/matches/${match.id}`} className="text-primary hover:underline">
                              {match.home_team.name} vs {match.away_team.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {match.stadium?.name || 'Не указан'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              Запланирован
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Нет запланированных матчей
                </div>
              )}
              
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">Команды-участницы</h2>
                {matchesLoading ? (
                  <LoadingSpinner />
                ) : matches && matches.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from(new Set([
                      ...matches.map(m => JSON.stringify({id: m.home_team.id, name: m.home_team.name})), 
                      ...matches.map(m => JSON.stringify({id: m.away_team.id, name: m.away_team.name}))
                    ]))
                      .map(teamStr => JSON.parse(teamStr))
                      .map(team => (
                        <Link href={`/teams/${team.id}`} key={team.id} className="card hover:shadow-md p-4">
                          <div className="flex items-center text-primary">
                            <FaUsers className="mr-2" />
                            <span>{team.name}</span>
                          </div>
                        </Link>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    Нет данных о командах-участницах
                  </div>
                )}
              </div>
              
              <div className="mt-8 text-center">
                <Link href={`/matches?tournament_id=${tournament.id}`}>
                  <button className="btn btn-primary">Все матчи турнира</button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 