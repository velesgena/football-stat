import { FaFutbol, FaFlag } from 'react-icons/fa';
import Card from '../ui/Card';

export default function PlayerCard({ player }) {
  return (
    <Card
      link={`/players/${player.id}`}
      title={`${player.last_name} ${player.first_name}${player.patronymic ? ` ${player.patronymic}` : ''}`}
      subtitle={
        <div className="flex items-center text-gray-500 mt-1">
          <FaFlag className="h-3 w-3 mr-1" />
          <span>{player.nationality || 'Неизвестно'}</span>
        </div>
      }
      content={
        <div className="pt-2">
          {player.photo_url && (
            <div className="flex justify-center mb-4">
              <img 
                src={player.photo_url} 
                alt={`${player.first_name} ${player.last_name}`} 
                className="h-32 w-32 object-cover rounded-full"
              />
            </div>
          )}
          {player.birth_date && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Дата рождения:</span> {new Date(player.birth_date).toLocaleDateString('ru-RU')}
            </div>
          )}
          {player.team && (
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Команда:</span> {player.team.name}
            </div>
          )}
          {player.position && (
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Позиция:</span> {player.position}
            </div>
          )}
        </div>
      }
      footer={
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-primary">
            <FaFutbol className="h-4 w-4 mr-1" />
            <span>Подробнее</span>
          </div>
        </div>
      }
    />
  );
} 