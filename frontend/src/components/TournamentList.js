import React, { useState, useEffect } from 'react';
import { tournamentsApi } from '../utils/api';
import { logDetailedError, getErrorMessage } from '../utils/errorHandler';

const TournamentList = ({ onTournamentSelect, onTournamentsLoaded }) => {
  // Состояния компонента
  const [tournaments, setTournaments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTournament, setSelectedTournament] = useState(null);

  useEffect(() => {
    loadTournaments();
  }, []);

  // Проверка валидности данных турнира
  const validateTournamentData = (tournament) => {
    const requiredFields = ['id', 'name', 'season'];
    const missingFields = requiredFields.filter(field => !tournament[field]);
    
    if (missingFields.length > 0) {
      console.warn(`Турнир с ID ${tournament.id} не содержит обязательные поля:`, missingFields);
      return false;
    }
    return true;
  };

  // Функция загрузки турниров
  const loadTournaments = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Получаем турниры
      const response = await tournamentsApi.getTournaments();
      
      // Проверяем, что response это массив
      if (!Array.isArray(response)) {
        throw new Error('Неверный формат данных турниров');
      }

      // Фильтруем и валидируем данные
      const validTournaments = response.filter(validateTournamentData);

      if (validTournaments.length === 0 && response.length > 0) {
        console.error('Все полученные турниры содержат некорректные данные:', response);
        throw new Error('Получены некорректные данные турниров');
      }

      // Сортируем турниры
      const sortedTournaments = validTournaments.sort((a, b) => {
        // Сначала сортируем по сезону (если есть)
        if (a.season && b.season) {
          return b.season - a.season;
        }
        // Если сезонов нет, сортируем по ID
        return b.id - a.id;
      });

      setTournaments(sortedTournaments);
      
      // Если есть турниры, выбираем первый
      if (sortedTournaments.length > 0) {
        const firstTournament = sortedTournaments[0];
        setSelectedTournament(firstTournament);
        
        // Загружаем детальную информацию о турнире
        try {
          const tournamentDetails = await tournamentsApi.getTournamentDetails(firstTournament.id);
          if (tournamentDetails) {
            onTournamentSelect?.({ ...firstTournament, ...tournamentDetails });
          }
        } catch (detailsError) {
          console.error('Ошибка при загрузке деталей турнира:', detailsError);
          onTournamentSelect?.(firstTournament);
        }
      }
      
      // Уведомляем родительский компонент о загруженных турнирах
      onTournamentsLoaded?.(sortedTournaments);

    } catch (error) {
      // Логируем детали ошибки
      logDetailedError(error, 'Загрузка турниров');
      
      // Устанавливаем понятное пользователю сообщение об ошибке
      setError(getErrorMessage(error));
      
      console.error('Ошибка при загрузке турниров:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик выбора турнира
  const handleTournamentSelect = async (tournament) => {
    try {
      setSelectedTournament(tournament);
      
      // Загружаем детальную информацию о турнире
      const tournamentDetails = await tournamentsApi.getTournamentDetails(tournament.id);
      
      if (tournamentDetails) {
        onTournamentSelect?.({ ...tournament, ...tournamentDetails });
      } else {
        onTournamentSelect?.(tournament);
      }
    } catch (error) {
      console.error('Ошибка при загрузке деталей турнира:', error);
      onTournamentSelect?.(tournament);
    }
  };

  // Если идет загрузка, показываем индикатор
  if (isLoading) {
    return <div className="loading">Загрузка турниров...</div>;
  }

  // Если есть ошибка, показываем её
  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={loadTournaments}
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  // Если нет турниров, показываем сообщение
  if (tournaments.length === 0) {
    return <div className="no-data">Турниры не найдены</div>;
  }

  // Рендерим список турниров
  return (
    <div className="tournaments-list">
      {tournaments.map(tournament => (
        <div
          key={tournament.id}
          className={`tournament-item ${selectedTournament?.id === tournament.id ? 'selected' : ''}`}
          onClick={() => handleTournamentSelect(tournament)}
        >
          <h3>{tournament.name}</h3>
          {tournament.season && (
            <span className="season">Сезон: {tournament.season}</span>
          )}
          {tournament.description && (
            <p className="description">{tournament.description}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default TournamentList; 