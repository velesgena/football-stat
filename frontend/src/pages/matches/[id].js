import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import useFetch from '../../hooks/useFetch';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaFutbol } from 'react-icons/fa';

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

// Format date for display
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export default function MatchDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const { data: match, isLoading, isError } = useFetch(id ? `/matches/${id}` : null);
  const { data: matchStats, isLoading: statsLoading } = useFetch(id ? `/match-stats/?match_id=${id}` : null);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <LoadingSpinner className="py-20" />
      </div>
    );
  }
  
  if (isError || !match) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Матч не найден</h1>
        <p className="mb-6">Матч, который вы ищете, не существует или был удален.</p>
        <Link href="/matches">
          <button className="btn btn-primary">Вернуться к списку матчей</button>
        </Link>
      </div>
    );
  }

  // Определение статуса матча
  const getStatusBadge = () => {
    // Маппинг статусов для перевода английских статусов в русские
    const statusMapping = {
      'scheduled': 'Запланирован',
      'finished': 'Завершен',
      'canceled': 'Отменен',
      'postponed': 'Перенесен',
      'live': 'Идет сейчас'
    };
    
    // Проверяем и обрабатываем как русские, так и английские значения для обратной совместимости
    const status = match.status || 'scheduled';
    const displayStatus = statusMapping[status] || status;
    
    switch (displayStatus) {
      case 'Запланирован':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Запланирован</span>;
      case 'Идет сейчас':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">Идет сейчас</span>;
      case 'Завершен':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">Завершен</span>;
      case 'Перенесен':
        return <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">Перенесен</span>;
      case 'Отменен':
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">Отменен</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">Запланирован</span>;
    }
  };

  // Проверка, завершен ли матч
  const isCompleted = () => {
    const status = match.status || '';
    return status === 'finished' || status === 'Завершен';
  };

  // Форматирование даты и времени
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ru-RU'),
      time: date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const { date, time } = match.date ? formatDateTime(match.date) : { date: 'Неизвестно', time: '' };
  
  // Получение статистики для каждой команды
  const homeTeamStats = matchStats?.filter(stat => stat.team_id === match.home_team.id) || [];
  const awayTeamStats = matchStats?.filter(stat => stat.team_id === match.away_team.id) || [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>{match.home_team.name} vs {match.away_team.name} | Футбольная статистика</title>
      </Head>

      <div className="mb-6">
        <Link href="/matches" className="text-blue-600 hover:text-blue-800 flex items-center">
          <FaArrowLeft className="mr-2" /> Вернуться к списку матчей
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-2">
              {getStatusBadge()}
            </div>
            
            {/* Информация о турнире, сезоне и туре */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {match.tournament?.name || 'Матч'}
              </h1>
              <div className="text-gray-600">
                {match.tournament?.season && <span>Сезон {match.tournament.season}</span>}
                {match.round && <span className="ml-2">• Тур {match.round}</span>}
              </div>
            </div>

            {/* Команды и счет */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl mb-6">
              <div className="text-center md:text-right md:w-1/3">
                <h2 className="text-xl font-semibold">{match.home_team.name}</h2>
              </div>
              
              <div className="flex items-center justify-center md:w-1/3 my-4 md:my-0">
                {match.status === 'finished' ? (
                  <div className="text-3xl font-bold">
                    {match.home_score} : {match.away_score}
                  </div>
                ) : (
                  <div className="text-xl">
                    {formatTime(match.match_time)}
                  </div>
                )}
              </div>
              
              <div className="text-center md:text-left md:w-1/3">
                <h2 className="text-xl font-semibold">{match.away_team.name}</h2>
              </div>
            </div>

            {/* Дополнительная информация */}
            <div className="flex flex-wrap justify-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2" />
                {formatDate(match.match_date)}
              </div>
              {match.stadium && (
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-2" />
                  {match.stadium.name}
                </div>
              )}
              {match.referee && (
                <div className="flex items-center">
                  <FaFutbol className="mr-2" />
                  Судья: {match.referee.last_name} {match.referee.first_name}
                </div>
              )}
            </div>
          </div>

          {/* Составы команд */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Состав домашней команды */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{match.home_team.name}</h2>
                {homeTeamStats.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded mb-4">
                    <div className="text-sm">
                      <span className="font-medium">Всего игроков:</span> {homeTeamStats.length}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Легионеров:</span> {homeTeamStats.filter(s => s.is_foreign).length}
                    </div>
                  </div>
                )}
                
                {/* Стартовый состав */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Стартовый состав</h3>
                  {homeTeamStats.filter(stat => stat.is_started).map(stat => (
                    <div key={stat.id} className="flex justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex-1">
                        <Link href={`/players/${stat.player_id}`} className="text-primary hover:underline">
                          {stat.player?.first_name} {stat.player?.last_name}
                        </Link>
                        {stat.is_foreign && (
                          <span className="ml-2 px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            Легионер
                          </span>
                        )}
                        {stat.position && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({stat.position})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Запасные */}
                <div>
                  <h3 className="font-medium mb-2">Запасные</h3>
                  {homeTeamStats.filter(stat => stat.is_substitute).map(stat => (
                    <div key={stat.id} className="flex justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex-1">
                        <Link href={`/players/${stat.player_id}`} className="text-primary hover:underline">
                          {stat.player?.first_name} {stat.player?.last_name}
                        </Link>
                        {stat.is_foreign && (
                          <span className="ml-2 px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            Легионер
                          </span>
                        )}
                        {stat.position && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({stat.position})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Состав гостевой команды */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{match.away_team.name}</h2>
                {awayTeamStats.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded mb-4">
                    <div className="text-sm">
                      <span className="font-medium">Всего игроков:</span> {awayTeamStats.length}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Легионеров:</span> {awayTeamStats.filter(s => s.is_foreign).length}
                    </div>
                  </div>
                )}
                
                {/* Стартовый состав */}
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Стартовый состав</h3>
                  {awayTeamStats.filter(stat => stat.is_started).map(stat => (
                    <div key={stat.id} className="flex justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex-1">
                        <Link href={`/players/${stat.player_id}`} className="text-primary hover:underline">
                          {stat.player?.first_name} {stat.player?.last_name}
                        </Link>
                        {stat.is_foreign && (
                          <span className="ml-2 px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            Легионер
                          </span>
                        )}
                        {stat.position && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({stat.position})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Запасные */}
                <div>
                  <h3 className="font-medium mb-2">Запасные</h3>
                  {awayTeamStats.filter(stat => stat.is_substitute).map(stat => (
                    <div key={stat.id} className="flex justify-between p-2 hover:bg-gray-50 rounded">
                      <div className="flex-1">
                        <Link href={`/players/${stat.player_id}`} className="text-primary hover:underline">
                          {stat.player?.first_name} {stat.player?.last_name}
                        </Link>
                        {stat.is_foreign && (
                          <span className="ml-2 px-1 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">
                            Легионер
                          </span>
                        )}
                        {stat.position && (
                          <span className="ml-2 text-sm text-gray-500">
                            ({stat.position})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 