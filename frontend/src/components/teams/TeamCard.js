import { FaMapMarkerAlt, FaTrophy } from 'react-icons/fa';
import Card from '../ui/Card';

export default function TeamCard({ team }) {
  return (
    <Card
      link={`/teams/${team.id}`}
      title={team.name}
      subtitle={
        <div className="flex items-center text-gray-500 mt-1">
          <FaMapMarkerAlt className="h-3 w-3 mr-1" />
          <span>{team.city?.name || 'Неизвестно'}</span>
        </div>
      }
      content={
        <div className="pt-2">
          {team.logo_url && (
            <div className="flex justify-center mb-4">
              <img 
                src={team.logo_url} 
                alt={`${team.name} логотип`} 
                className="h-24 w-24 object-contain"
              />
            </div>
          )}
          {team.founded_year && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Основание:</span> {team.founded_year}
            </div>
          )}
          {team.league && (
            <div className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Лига:</span> {team.league.name}
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