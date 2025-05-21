import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import useFetch from '../../hooks/useFetch';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FaArrowLeft, FaFutbol, FaCalendarAlt, FaFlag, FaUserAlt, FaRulerVertical, FaWeight } from 'react-icons/fa';

export default function PlayerDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: player, isLoading, isError } = useFetch(id ? `/players/${id}` : null);
  const { data: playerStats, isLoading: statsLoading } = useFetch(id ? `/match-stats/?player_id=${id}` : null);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <LoadingSpinner className="py-20" />
      </div>
    );
  }
  
  if (isError || !player) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Игрок не найден</h1>
        <p className="mb-6">Игрок, которого вы ищете, не существует или был удален.</p>
        <Link href="/players">
          <button className="btn btn-primary">Вернуться к списку игроков</button>
        </Link>
      </div>
    );
  }

  const fullName = `${player.last_name} ${player.first_name}${player.patronymic ? ` ${player.patronymic}` : ''}`;
  const stats = playerStats || [];
  
  // Вычисляем сводную статистику
  const totalMatches = stats.length;
  const totalGoals = stats.reduce((sum, stat) => sum + (stat.goals || 0), 0);
  const totalAssists = stats.reduce((sum, stat) => sum + (stat.assists || 0), 0);
  const totalYellowCards = stats.reduce((sum, stat) => sum + (stat.yellow_cards || 0), 0);
  const totalRedCards = stats.reduce((sum, stat) => sum + (stat.red_card ? 1 : 0), 0);
  
  return (
    <>
      <Head>
        <title>{fullName} | Футбольная статистика</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <Link href="/players">
          <button className="flex items-center text-primary mb-6">
            <FaArrowLeft className="mr-2" /> Вернуться к списку игроков
          </button>
        </Link>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-primary text-white p-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              {player.photo_url && (
                <div className="mb-4 md:mb-0 mr-6">
                  <img 
                    src={player.photo_url} 
                    alt={fullName}
                    className="h-32 w-32 object-cover rounded-full bg-white p-1"
                  />
                </div>
              )}
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2">{fullName}</h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 text-white/80">
                  {player.nationality && (
                    <div className="flex items-center">
                      <FaFlag className="mr-1" />
                      <span>{player.nationality}</span>
                    </div>
                  )}
                  {player.position && (
                    <div className="flex items-center">
                      <FaFutbol className="mr-1" />
                      <span>{player.position}</span>
                    </div>
                  )}
                  {player.team && (
                    <div className="flex items-center">
                      <FaUserAlt className="mr-1" />
                      <span>{player.team.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Личная информация</h2>
                <div className="space-y-3">
                  {player.birth_date && (
                    <div className="flex justify-between">
                      <span className="font-medium">Дата рождения:</span>
                      <span>{new Date(player.birth_date).toLocaleDateString('ru-RU')}</span>
                    </div>
                  )}
                  {player.height && (
                    <div className="flex justify-between">
                      <span className="font-medium">Рост:</span>
                      <span>{player.height} см</span>
                    </div>
                  )}
                  {player.weight && (
                    <div className="flex justify-between">
                      <span className="font-medium">Вес:</span>
                      <span>{player.weight} кг</span>
                    </div>
                  )}
                  {player.shirt_number && (
                    <div className="flex justify-between">
                      <span className="font-medium">Номер:</span>
                      <span>{player.shirt_number}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Сводная статистика</h2>
                {statsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium">Матчей:</span>
                      <span>{totalMatches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Голов:</span>
                      <span>{totalGoals}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Передач:</span>
                      <span>{totalAssists}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Желтых карточек:</span>
                      <span>{totalYellowCards}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Красных карточек:</span>
                      <span>{totalRedCards}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Последние матчи</h2>
              {statsLoading ? (
                <LoadingSpinner />
              ) : stats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Матч</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Минуты</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Голы</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Передачи</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.slice(0, 5).map((stat) => (
                        <tr key={stat.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link href={`/matches/${stat.match_id}`} className="text-primary hover:underline">
                              {stat.match?.home_team?.name} vs {stat.match?.away_team?.name}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {stat.match?.date && new Date(stat.match.date).toLocaleDateString('ru-RU')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{stat.minutes_played}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{stat.goals}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{stat.assists}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Нет данных о матчах
                </div>
              )}
              
              {stats.length > 5 && (
                <div className="text-center mt-4">
                  <Link href={`/matches?player_id=${player.id}`}>
                    <button className="btn btn-primary">Все матчи игрока</button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 