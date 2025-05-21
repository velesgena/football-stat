import { FaTrophy, FaCalendarAlt } from 'react-icons/fa';
import Card from '../ui/Card';

export default function TournamentCard({ tournament }) {
  return (
    <Card
      link={`/tournaments/${tournament.id}`}
      title={tournament.name}
      subtitle={
        <div className="flex items-center text-gray-500 mt-1">
          <FaCalendarAlt className="h-3 w-3 mr-1" />
          <span>{tournament.season || 'Сезон не указан'}</span>
        </div>
      }
      content={
        <div className="pt-2">
          {tournament.logo_url && (
            <div className="flex justify-center mb-4">
              <img 
                src={tournament.logo_url} 
                alt={`${tournament.name} логотип`} 
                className="h-24 w-24 object-contain"
              />
            </div>
          )}
          {tournament.start_date && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Начало:</span> {new Date(tournament.start_date).toLocaleDateString('ru-RU')}
            </div>
          )}
          {tournament.end_date && (
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Окончание:</span> {new Date(tournament.end_date).toLocaleDateString('ru-RU')}
            </div>
          )}
          {tournament.tournament_type && (
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Тип:</span> {tournament.tournament_type}
            </div>
          )}
        </div>
      }
      footer={
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-primary">
            <FaTrophy className="h-4 w-4 mr-1" />
            <span>Подробнее</span>
          </div>
        </div>
      }
    />
  );
} 