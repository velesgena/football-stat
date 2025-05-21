import { useState, useEffect } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function SquadSelector({ 
  teamId, 
  teamName, 
  players, 
  savedSquad = [], 
  onChange,
  tournamentId
}) {
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedStarters, setSelectedStarters] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Инициализируем выбранных игроков при загрузке сохраненного состава
  useEffect(() => {
    if (savedSquad && savedSquad.length > 0) {
      setSelectedPlayers(savedSquad.map(stat => ({
        player_id: stat.player_id,
        name: `${stat.player?.last_name} ${stat.player?.first_name}`,
        position: stat.player?.position,
        jersey_number: stat.player?.jersey_number,
        is_started: stat.is_started || false,
        is_substitute: stat.is_substitute || false,
        is_self: stat.is_self || false,
        is_foreign: stat.is_foreign || false,
        city: stat.player?.city,
      })));
      
      setSelectedStarters(
        savedSquad
          .filter(stat => stat.is_started)
          .map(stat => stat.player_id)
      );
    }
  }, [savedSquad]);

  // Фильтрация игроков по поисковому запросу и турниру
  const filteredPlayers = players.filter(player => {
    const fullName = `${player.last_name} ${player.first_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    
    // Проверяем, заявлен ли игрок на турнир
    const isRegisteredForTournament = !tournamentId || player.tournaments?.some(t => 
      String(t.tournament_id) === String(tournamentId)
    );
    
    return matchesSearch && isRegisteredForTournament;
  });

  // Проверка, выбран ли игрок
  const isPlayerSelected = (playerId) => {
    return selectedPlayers.some(p => p.player_id === playerId);
  };

  // Проверка, в стартовом ли составе игрок
  const isPlayerStarter = (playerId) => {
    return selectedStarters.includes(playerId);
  };

  // Переключение выбора игрока
  const togglePlayer = (player) => {
    if (isPlayerSelected(player.id)) {
      removePlayer(player.id);
    } else {
      addPlayer(player);
    }
  };

  // Добавление игрока в состав
  const addPlayer = (player) => {
    if (!isPlayerSelected(player.id)) {
      // Get player's tournament registration data
      const tournamentRegistration = player.tournaments?.find(t => 
        String(t.tournament_id) === String(tournamentId)
      );

      const newPlayer = {
        player_id: player.id,
        name: `${player.last_name} ${player.first_name}`,
        position: player.position,
        jersey_number: player.jersey_number,
        is_started: false,
        is_substitute: true,
        is_self: tournamentRegistration?.is_self || false,
        is_foreign: Boolean(player.is_foreign),
        city: player.city,
      };
      
      const updatedPlayers = [...selectedPlayers, newPlayer];
      setSelectedPlayers(updatedPlayers);
      
      // Уведомляем родительский компонент об изменении
      onChange(teamId, updatedPlayers);
    }
  };

  // Удаление игрока из состава
  const removePlayer = (playerId) => {
    const updatedPlayers = selectedPlayers.filter(p => p.player_id !== playerId);
    setSelectedPlayers(updatedPlayers);
    
    // Если игрок был в стартовом составе, удаляем из списка
    if (isPlayerStarter(playerId)) {
      const updatedStarters = selectedStarters.filter(id => id !== playerId);
      setSelectedStarters(updatedStarters);
    }
    
    // Уведомляем родительский компонент об изменении
    onChange(teamId, updatedPlayers);
  };

  // Переключение статуса игрока (стартовый состав / запасной)
  const toggleStarting = (playerId) => {
    let updatedStarters;
    
    if (isPlayerStarter(playerId)) {
      // Удаляем из стартового состава
      updatedStarters = selectedStarters.filter(id => id !== playerId);
    } else {
      // Добавляем в стартовый состав
      updatedStarters = [...selectedStarters, playerId];
    }
    
    setSelectedStarters(updatedStarters);
    
    // Обновляем статусы в списке выбранных игроков
    const updatedPlayers = selectedPlayers.map(player => {
      if (player.player_id === playerId) {
        return {
          ...player,
          is_started: !isPlayerStarter(playerId),
          is_substitute: isPlayerStarter(playerId)
        };
      }
      return player;
    });
    
    setSelectedPlayers(updatedPlayers);
    
    // Уведомляем родительский компонент об изменении
    onChange(teamId, updatedPlayers);
  };

  // Расчет статистики
  const stats = {
    total: selectedPlayers.length,
    starters: selectedStarters.length,
    substitutes: selectedPlayers.length - selectedStarters.length,
    foreigners: selectedPlayers.filter(p => !!p.is_foreign).length,
    goalkeepers: selectedPlayers.filter(p => p.position === 'Вратарь').length,
    needTransport: selectedPlayers.filter(p => !p.is_self).length
  };

  // Группировка игроков с отметкой "Сам" по городам
  const selfPlayersCounts = {};
  selectedPlayers
    .filter(p => p.is_self && p.city)
    .forEach(p => {
      const cityName = p.city.name;
      selfPlayersCounts[cityName] = (selfPlayersCounts[cityName] || 0) + 1;
    });

  // Группировка игроков без отметки "Сам" по городам (нужен транспорт)
  const transportNeededCounts = {};
  selectedPlayers
    .filter(p => !p.is_self && p.city)
    .forEach(p => {
      const cityName = p.city.name;
      transportNeededCounts[cityName] = (transportNeededCounts[cityName] || 0) + 1;
    });

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <h3 className="text-lg font-semibold mb-4">Состав {teamName}</h3>
      
      {/* Статистика по выбранным игрокам */}
      <div className="bg-gray-50 p-3 mb-4 rounded">
        <h4 className="font-medium mb-2 text-sm">Статистика состава</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Всего игроков: <span className="font-bold">{stats.total}</span></div>
          <div>Легионеров: <span className="font-bold">{stats.foreigners}</span></div>
          <div>В старте: <span className="font-bold">{stats.starters}</span></div>
          <div>Запасных: <span className="font-bold">{stats.substitutes}</span></div>
          <div>Вратарей: <span className="font-bold">{stats.goalkeepers}</span></div>
          <div>Нужен транспорт: <span className="font-bold">{stats.needTransport}</span></div>
        </div>
        
        {/* Распределение игроков с отметкой "Сам" по городам */}
        {Object.keys(selfPlayersCounts).length > 0 && (
          <div className="mt-2">
            <div className="font-medium text-sm">Приезжают сами (по городам):</div>
            <ul className="list-disc list-inside ml-2 text-sm">
              {Object.entries(selfPlayersCounts).map(([city, count]) => (
                <li key={city}>{city}: {count}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Распределение игроков, которым нужен транспорт, по городам */}
        {Object.keys(transportNeededCounts).length > 0 && (
          <div className="mt-2">
            <div className="font-medium text-sm">Нужен транспорт (по городам):</div>
            <ul className="list-disc list-inside ml-2 text-sm">
              {Object.entries(transportNeededCounts).map(([city, count]) => (
                <li key={city}>{city}: {count}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* Поиск игроков */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Найти игрока..."
          className="input input-bordered w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Список доступных игроков */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Состав команды</h4>
        <div className="max-h-[500px] overflow-y-auto">
          {filteredPlayers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Игроки не найдены</p>
          ) : (
            <table className="table-auto w-full">
              <thead className="sticky top-0 bg-white">
                <tr>
                  <th className="px-2 py-2 text-center">Выбор</th>
                  <th className="px-2 py-2 text-left">№</th>
                  <th className="px-2 py-2 text-left">Игрок</th>
                  <th className="px-2 py-2 text-center">Старт</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlayers.map(player => (
                  <tr key={player.id} className={`${isPlayerSelected(player.id) ? 'bg-gray-100' : ''}`}>
                    <td className="px-2 py-2 text-center">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary"
                        checked={isPlayerSelected(player.id)}
                        onChange={() => togglePlayer(player)}
                      />
                    </td>
                    <td className="px-2 py-2">{player.jersey_number || '-'}</td>
                    <td className="px-2 py-2">
                      {player.last_name} {player.first_name}
                      {player.position === 'Вратарь' && <span className="ml-1 font-bold text-blue-600">В</span>}
                      {player.is_foreign && <span className="ml-1 font-bold text-red-600">Л</span>}
                    </td>
                    <td className="px-2 py-2 text-center">
                      {isPlayerSelected(player.id) && (
                        <button 
                          className={`btn btn-xs btn-circle ${isPlayerStarter(player.id) ? 'btn-success' : 'btn-outline'}`}
                          onClick={() => toggleStarting(player.id)}
                          title={isPlayerStarter(player.id) ? "В стартовом составе" : "Запасной"}
                        >
                          {isPlayerStarter(player.id) ? <FaCheck /> : <FaTimes />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
} 