import axios from 'axios';

// Базовый URL API - используем относительный путь для прокси через Next.js
const API_URL = '/api';

// Создаем экземпляр axios с базовым URL
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем логгирование запросов и ответов
apiClient.interceptors.request.use(
  (config) => {
    console.log(`API запрос: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Ошибка запроса:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`API ответ: ${response.status} от ${response.config.url}`);
    console.log('Данные ответа:', response.data);
    return response;
  },
  (error) => {
    console.error('Ошибка ответа:', error);
    return Promise.reject(error);
  }
);

// API сервис для работы с командами
export const teamsApi = {
  // Получить все команды
  getAllTeams: async () => {
    try {
      const response = await apiClient.get('/teams');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка команд:', error);
      throw error;
    }
  },

  // Получить команду по ID
  getTeamById: async (id) => {
    try {
      const response = await apiClient.get(`/teams/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении команды с ID ${id}:`, error);
      throw error;
    }
  },
};

// API сервис для работы с городами
export const citiesApi = {
  // Получить все города
  getAllCities: async () => {
    try {
      const response = await apiClient.get('/cities');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка городов:', error);
      throw error;
    }
  },

  // Получить город по ID
  getCityById: async (id) => {
    try {
      const response = await apiClient.get(`/cities/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении города с ID ${id}:`, error);
      throw error;
    }
  },

  // Создать новый город
  createCity: async (cityData) => {
    try {
      const response = await apiClient.post('/cities', cityData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании города:', error);
      throw error;
    }
  },

  // Обновить город
  updateCity: async (id, cityData) => {
    try {
      const response = await apiClient.put(`/cities/${id}`, cityData);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении города с ID ${id}:`, error);
      throw error;
    }
  },

  // Удалить город
  deleteCity: async (id) => {
    try {
      await apiClient.delete(`/cities/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Ошибка при удалении города с ID ${id}:`, error);
      throw error;
    }
  },
};

// API сервис для работы с матчами
export const matchesApi = {
  // Получить все матчи
  getAllMatches: async () => {
    try {
      const response = await apiClient.get('/matches');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка матчей:', error);
      throw error;
    }
  },

  // Получить матч по ID
  getMatchById: async (id) => {
    try {
      const response = await apiClient.get(`/matches/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении матча с ID ${id}:`, error);
      throw error;
    }
  },

  // Получить предстоящие матчи
  getUpcomingMatches: async () => {
    try {
      const response = await apiClient.get('/matches/upcoming');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении предстоящих матчей:', error);
      throw error;
    }
  },

  // Создать новый матч
  createMatch: async (matchData) => {
    try {
      const response = await apiClient.post('/matches', matchData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании матча:', error);
      throw error;
    }
  },

  // Обновить матч
  updateMatch: async (id, matchData) => {
    try {
      // We don't need to format match_time here as the form components are
      // now sending the correct format directly
      const response = await apiClient.put(`/matches/${id}`, matchData);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении матча с ID ${id}:`, error);
      throw error;
    }
  },

  // Удалить матч
  deleteMatch: async (id) => {
    try {
      await apiClient.delete(`/matches/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Ошибка при удалении матча с ID ${id}:`, error);
      throw error;
    }
  },
};

// API сервис для статистики
export const statsApi = {
  // Получить общую статистику
  getGeneralStats: async () => {
    try {
      const response = await apiClient.get('/stats/general');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении общей статистики:', error);
      throw error;
    }
  },

  // Получить статистику команды
  getTeamStats: async (teamId) => {
    try {
      const response = await apiClient.get(`/stats/teams/${teamId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении статистики команды с ID ${teamId}:`, error);
      throw error;
    }
  },
};

// API сервис для работы с судьями
export const refereesApi = {
  // Получить всех судей
  getAllReferees: async () => {
    try {
      const response = await apiClient.get('/referees');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка судей:', error);
      throw error;
    }
  },

  // Получить судью по ID
  getRefereeById: async (id) => {
    try {
      const response = await apiClient.get(`/referees/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении судьи с ID ${id}:`, error);
      throw error;
    }
  },

  // Создать нового судью
  createReferee: async (refereeData) => {
    try {
      const response = await apiClient.post('/referees', refereeData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании судьи:', error);
      throw error;
    }
  },

  // Обновить судью
  updateReferee: async (id, refereeData) => {
    try {
      const response = await apiClient.put(`/referees/${id}`, refereeData);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении судьи с ID ${id}:`, error);
      throw error;
    }
  },

  // Удалить судью
  deleteReferee: async (id) => {
    try {
      await apiClient.delete(`/referees/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Ошибка при удалении судьи с ID ${id}:`, error);
      throw error;
    }
  },
};

// API сервис для работы со стадионами
export const stadiumsApi = {
  getAllStadiums: async () => {
    try {
      const response = await apiClient.get('/stadiums');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка стадионов:', error);
      throw error;
    }
  },
};

// API сервис для работы с турнирами
export const tournamentsApi = {
  // Получить все турниры
  getAllTournaments: async () => {
    try {
      const response = await apiClient.get('/tournaments');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка турниров:', error);
      throw error;
    }
  },

  // Получить турнир по ID
  getTournamentById: async (id) => {
    try {
      const response = await apiClient.get(`/tournaments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении турнира с ID ${id}:`, error);
      throw error;
    }
  },

  // Создать новый турнир
  createTournament: async (tournamentData) => {
    try {
      const response = await apiClient.post('/tournaments', tournamentData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании турнира:', error);
      throw error;
    }
  },

  // Обновить турнир
  updateTournament: async (id, tournamentData) => {
    try {
      const response = await apiClient.put(`/tournaments/${id}`, tournamentData);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении турнира с ID ${id}:`, error);
      throw error;
    }
  },

  // Удалить турнир
  deleteTournament: async (id) => {
    try {
      await apiClient.delete(`/tournaments/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Ошибка при удалении турнира с ID ${id}:`, error);
      throw error;
    }
  },
};

// API сервис для статистики матча
export const matchStatsApi = {
  // Получить статистику по матчу
  getMatchStatsByMatch: async (matchId) => {
    try {
      const response = await apiClient.get(`/match-stats/?match_id=${matchId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении статистики матча с ID ${matchId}:`, error);
      throw error;
    }
  },

  // Создать статистику матча для игрока
  createMatchStat: async (data) => {
    try {
      const response = await apiClient.post('/match-stats/', data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании статистики матча:', error);
      throw error;
    }
  },

  // Обновить статистику матча для игрока
  updateMatchStat: async (id, data) => {
    try {
      const response = await apiClient.put(`/match-stats/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении статистики матча с ID ${id}:`, error);
      throw error;
    }
  },

  // Удалить статистику матча для игрока
  deleteMatchStat: async (id) => {
    try {
      await apiClient.delete(`/match-stats/${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Ошибка при удалении статистики матча с ID ${id}:`, error);
      throw error;
    }
  },
};

// API сервис для работы с игроками
export const playersApi = {
  // Получить всех игроков
  getAllPlayers: async () => {
    try {
      const response = await apiClient.get('/players');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка игроков:', error);
      throw error;
    }
  },

  // Получить игрока по ID
  getPlayerById: async (id) => {
    try {
      const response = await apiClient.get(`/players/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении игрока с ID ${id}:`, error);
      throw error;
    }
  },

  // Получить игроков команды
  getPlayersByTeam: async (teamId) => {
    try {
      const response = await apiClient.get(`/players/?team_id=${teamId}`);
      return response.data;
    } catch (error) {
      console.error(`Ошибка при получении игроков команды с ID ${teamId}:`, error);
      throw error;
    }
  },
}; 