import { FaCalendarAlt, FaMapMarkerAlt, FaTrophy } from 'react-icons/fa';
import Card from '../ui/Card';

export default function MatchCard({ match }) {
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

  return (
    <Card
      link={`/matches/${match.id}`}
      title={
        <div className="flex justify-between items-center">
          <span>Матч #{match.id}</span>
          {getStatusBadge()}
        </div>
      }
      content={
        <div className="pt-2">
          <div className="flex justify-between items-center my-4">
            <div className="flex flex-col items-center text-center w-5/12">
              {match.home_team?.logo_url && (
                <img 
                  src={match.home_team.logo_url} 
                  alt={match.home_team.name} 
                  className="h-12 w-12 mb-2 object-contain"
                />
              )}
              <span className="font-medium text-sm">{match.home_team?.name || 'TBD'}</span>
            </div>
            
            <div className="text-center w-2/12">
              {isCompleted() ? (
                <div className="font-bold text-lg">{match.home_score} : {match.away_score}</div>
              ) : (
                <div className="font-bold text-lg">vs</div>
              )}
            </div>
            
            <div className="flex flex-col items-center text-center w-5/12">
              {match.away_team?.logo_url && (
                <img 
                  src={match.away_team.logo_url} 
                  alt={match.away_team.name} 
                  className="h-12 w-12 mb-2 object-contain"
                />
              )}
              <span className="font-medium text-sm">{match.away_team?.name || 'TBD'}</span>
            </div>
          </div>
          
          <div className="space-y-1 text-sm text-gray-600 mt-4">
            <div className="flex items-center">
              <FaCalendarAlt className="h-3 w-3 mr-2" />
              <span>{date}, {time}</span>
            </div>
            {match.stadium && (
              <div className="flex items-center">
                <FaMapMarkerAlt className="h-3 w-3 mr-2" />
                <span>{match.stadium.name}</span>
              </div>
            )}
            {match.tournament && (
              <div className="flex items-center">
                <FaTrophy className="h-3 w-3 mr-2" />
                <span>{match.tournament.name}</span>
              </div>
            )}
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-primary">
            <span>Подробнее</span>
          </div>
        </div>
      }
    />
  );
} 