import React from 'react';
import { FaMapMarkerAlt, FaFutbol, FaCalendarAlt } from 'react-icons/fa';

export default function TeamInfo({ team }) {
  if (!team) {
    return <div className="text-gray-500">Информация о команде не найдена</div>;
  }

  return (
    <div className="space-y-6">
      {/* Основная информация */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Основная информация</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <FaMapMarkerAlt className="text-gray-500 mr-2" />
              <span className="text-gray-700">{team.city || 'Город не указан'}</span>
            </div>
            <div className="flex items-center">
              <FaFutbol className="text-gray-500 mr-2" />
              <span className="text-gray-700">{team.stadium_name || 'Домашний стадион не указан'}</span>
            </div>
            <div className="flex items-center">
              <FaCalendarAlt className="text-gray-500 mr-2" />
              <span className="text-gray-700">Основан: {team.founded_year || 'Не указано'}</span>
            </div>
          </div>
        </div>

        {/* Контакты */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Контактная информация</h3>
          <div className="space-y-4">
            {team.website && (
              <div>
                <span className="text-gray-600">Сайт:</span>
                <a href={team.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 hover:text-blue-800">
                  {team.website}
                </a>
              </div>
            )}
            {team.email && (
              <div>
                <span className="text-gray-600">Email:</span>
                <a href={`mailto:${team.email}`} className="ml-2 text-blue-600 hover:text-blue-800">
                  {team.email}
                </a>
              </div>
            )}
            {team.phone && (
              <div>
                <span className="text-gray-600">Телефон:</span>
                <a href={`tel:${team.phone}`} className="ml-2 text-blue-600 hover:text-blue-800">
                  {team.phone}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Описание */}
      {team.description && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">О команде</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{team.description}</p>
        </div>
      )}

      {/* Достижения */}
      {team.achievements && team.achievements.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Достижения</h3>
          <ul className="list-disc list-inside space-y-2">
            {team.achievements.map((achievement, index) => (
              <li key={index} className="text-gray-700">{achievement}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 