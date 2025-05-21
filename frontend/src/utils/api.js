import axios from 'axios';
import { logDetailedError, tryDirectApiCall, retryRequest } from './errorHandler';

// Настройка базового URL для API
const API_URL = '/api';  // Используем относительный URL для работы через прокси Next.js

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 15 секунд
  withCredentials: true, // Включаем для поддержки сессий если потребуется
  // Отключаем автоматическое преобразование текстового ответа в JSON
  transformResponse: [(data) => {
    // Попытка преобразования ответа в JSON
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch (e) {
        // Если ответ не является JSON, возвращаем как есть
        return data;
      }
    }
    return data;
  }],
});

// Добавляем перехватчик запросов для логирования
api.interceptors.request.use(
  (config) => {
    console.log(`API Запрос: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('Параметры запроса:', config.params);
    console.log('Тело запроса:', config.data);
    return config;
  },
  (error) => {
    console.error('Ошибка при отправке запроса:', error);
    return Promise.reject(error);
  }
);

// Добавляем перехватчик ответов для логирования и обработки ошибок
api.interceptors.response.use(
  (response) => {
    console.log(`API Ответ: ${response.status} от ${response.config.url}`);
    console.log('Данные ответа:', response.data);
    return response;
  },
  async (error) => {
    // Расширенная диагностика ошибки
    logDetailedError(error, 'API Response Error');
    
    // Проверяем, нужно ли делать повторную попытку
    const shouldRetry = (
      // Для 500х ошибок
      (error.response && error.response.status >= 500) ||
      // Для сетевых ошибок
      (error.message && error.message.includes('Network Error')) ||
      // Для таймаутов
      (error.code === 'ECONNABORTED')
    );
    
    if (shouldRetry) {
      const config = error.config;
      
      // Проверяем количество уже сделанных попыток
      if (!config || !config._retryCount || config._retryCount < 2) {
        // Увеличиваем счетчик попыток
        config._retryCount = (config._retryCount || 0) + 1;
        
        // Увеличиваем таймаут с каждой попыткой
        config.timeout = config.timeout * 1.5;
        
        console.log(`Повторная попытка запроса... (попытка ${config._retryCount}/2)`);
        
        // Делаем задержку перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, config._retryCount * 1500));
        
        try {
          // Сначала пробуем через обычный API
          return await api(config);
        } catch (retryError) {
          // Если не получилось, пробуем прямой запрос
          console.log('Пробуем прямой запрос после неудачной повторной попытки...');
          return await tryDirectApiCall(config.url, {
            method: config.method,
            data: config.data,
            params: config.params
          });
        }
      }
    }
    
    // Если не делаем повторную попытку или все попытки исчерпаны
    return Promise.reject(error);
  }
);

// Общая функция для выполнения запроса с повторными попытками
async function makeRequest(requestFn) {
  try {
    return await retryRequest(requestFn);
  } catch (error) {
    // Если все попытки не удались, пробуем прямой запрос
    if (error.config) {
      console.log('Пробуем прямой запрос после исчерпания попыток...');
      return await tryDirectApiCall(error.config.url, {
        method: error.config.method,
        data: error.config.data,
        params: error.config.params
      });
    }
    throw error;
  }
}

// API функции для работы с городами
export const citiesApi = {
  getCities: async (params = {}) => {
    const response = await api.get('/cities/', { params });
    return response.data;
  },
  
  createCity: async (data) => {
    const response = await api.post('/cities/', data);
    return response.data;
  },
  
  updateCity: async (id, data) => {
    const response = await api.put(`/cities/${id}`, data);
    return response.data;
  },
  
  deleteCity: async (id) => {
    const response = await api.delete(`/cities/${id}`);
    return response.data;
  },
  
  getCity: async (id) => {
    const response = await api.get(`/cities/${id}`);
    return response.data;
  }
};

// API функции для работы с игроками
export const playersApi = {
  getPlayers: async (params = {}) => {
    return makeRequest(async () => {
      try {
        const response = await api.get('/players/', { params });
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении списка игроков:', error);
        throw error;
      }
    });
  },
  
  getPlayer: async (id) => {
    const response = await api.get(`/players/${id}`);
    return response.data;
  },
  
  createPlayer: async (data) => {
    const response = await api.post('/players/', data);
    return response.data;
  },
  
  updatePlayer: async (id, data) => {
    const response = await api.put(`/players/${id}`, data);
    return response.data;
  },
  
  deletePlayer: async (id) => {
    const response = await api.delete(`/players/${id}`);
    return response.data;
  }
};

// API функции для работы с командами
export const teamsApi = {
  getTeams: async (params = {}) => {
    return makeRequest(async () => {
      try {
        const response = await api.get('/teams/', { params });
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении списка команд:', error);
        throw error;
      }
    });
  },
  
  getTeam: async (id) => {
    const response = await api.get(`/teams/${id}`);
    return response.data;
  },
  
  getTeamDetails: async (teamId) => {
    try {
      const response = await api.get(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team details:', error);
      throw error;
    }
  },
  
  getTeamMatches: async (teamId) => {
    try {
      const [matches, tournaments, stadiums, referees] = await Promise.all([
        api.get('/matches', { params: { team_id: teamId } }),
        api.get('/tournaments'),
        api.get('/stadiums'),
        api.get('/referees')
      ]);

      return {
        matches: matches.data,
        tournaments: tournaments.data,
        stadiums: stadiums.data,
        referees: referees.data
      };
    } catch (error) {
      console.error('Error fetching team matches:', error);
      throw error;
    }
  },
  
  createTeam: async (teamData) => {
    const response = await api.post('/teams/', teamData);
    return response.data;
  },
  
  updateTeam: async (id, data) => {
    const response = await api.put(`/teams/${id}`, data);
    return response.data;
  },
  
  deleteTeam: async (id) => {
    const response = await api.delete(`/teams/${id}`);
    return response.data;
  }
};

// API функции для работы с лигами
export const leaguesApi = {
  getLeagues: async (params = {}) => {
    const response = await api.get('/leagues/', { params });
    return response.data;
  },
  
  getLeague: async (id) => {
    const response = await api.get(`/leagues/${id}`);
    return response.data;
  },
  
  createLeague: async (data) => {
    const response = await api.post('/leagues/', data);
    return response.data;
  },
  
  updateLeague: async (id, data) => {
    const response = await api.put(`/leagues/${id}`, data);
    return response.data;
  },
  
  deleteLeague: async (id) => {
    const response = await api.delete(`/leagues/${id}`);
    return response.data;
  }
};

// API функции для работы со стадионами
export const stadiumsApi = {
  getStadiums: async (params = {}) => {
    const response = await api.get('/stadiums/', { params });
    return response.data;
  },
  
  getStadium: async (id) => {
    const response = await api.get(`/stadiums/${id}`);
    return response.data;
  },
  
  createStadium: async (data) => {
    const response = await api.post('/stadiums/', data);
    return response.data;
  },
  
  updateStadium: async (id, data) => {
    const response = await api.put(`/stadiums/${id}`, data);
    return response.data;
  },
  
  deleteStadium: async (id) => {
    const response = await api.delete(`/stadiums/${id}`);
    return response.data;
  }
};

// API функции для работы с судьями
export const refereesApi = {
  getReferees: async (params = {}) => {
    const response = await api.get('/referees/', { params });
    return response.data;
  }
};

// API функции для работы с матчами
export const matchesApi = {
  getMatches: async (params = {}) => {
    const response = await api.get('/matches/', { params });
    return response.data;
  },
  
  getMatch: async (id) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  },
  
  createMatch: async (data) => {
    const response = await api.post('/matches/', data);
    return response.data;
  },
  
  updateMatch: async (id, data) => {
    const response = await api.put(`/matches/${id}`, data);
    return response.data;
  },
  
  deleteMatch: async (id) => {
    const response = await api.delete(`/matches/${id}`);
    return response.data;
  }
};

// API функции для работы с турнирами
export const tournamentsApi = {
  getTournaments: async (params = {}) => {
    return makeRequest(async () => {
      try {
        const response = await api.get('/tournaments/', { params });
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении списка турниров:', error);
        throw error;
      }
    });
  },
  
  getTournamentDetails: async (id) => {
    return makeRequest(async () => {
      try {
        // Загружаем основную информацию о турнире
        const [
          tournamentResponse,
          matchesResponse,
          teamsResponse,
          statsResponse
        ] = await Promise.all([
          api.get(`/tournaments/${id}`),
          api.get('/matches/', { params: { tournament_id: id } }),
          api.get('/teams/', { params: { tournament_id: id } }),
          api.get(`/tournaments/${id}/statistics`)
        ]);

        return {
          ...tournamentResponse.data,
          matches: matchesResponse.data,
          teams: teamsResponse.data,
          statistics: statsResponse.data
        };
      } catch (error) {
        console.error('Ошибка при получении деталей турнира:', error);
        throw error;
      }
    });
  },
  
  createTournament: async (data) => {
    const response = await api.post('/tournaments/', data);
    return response.data;
  },
  
  updateTournament: async (id, data) => {
    const response = await api.put(`/tournaments/${id}`, data);
    return response.data;
  },
  
  deleteTournament: async (id) => {
    const response = await api.delete(`/tournaments/${id}`);
    return response.data;
  },

  // Новые методы для работы со статистикой турнира
  getTournamentStatistics: async (id) => {
    return makeRequest(async () => {
      try {
        const response = await api.get(`/tournaments/${id}/statistics`);
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении статистики турнира:', error);
        throw error;
      }
    });
  },

  getTournamentTeams: async (id) => {
    return makeRequest(async () => {
      try {
        const response = await api.get('/teams/', { params: { tournament_id: id } });
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении команд турнира:', error);
        throw error;
      }
    });
  },

  getTournamentMatches: async (id) => {
    return makeRequest(async () => {
      try {
        const response = await api.get('/matches/', { params: { tournament_id: id } });
        return response.data;
      } catch (error) {
        console.error('Ошибка при получении матчей турнира:', error);
        throw error;
      }
    });
  }
};

// API функции для работы со статусами игроков в лигах
export const playerLeagueStatusesApi = {
  getPlayerLeagueStatuses: async (playerId) => {
    const response = await api.get(`/players/${playerId}/leagues_statuses`);
    return response.data;
  },
  
  createPlayerLeagueStatus: async (playerId, data) => {
    const response = await api.post(`/players/${playerId}/leagues_statuses`, data);
    return response.data;
  },
  
  updatePlayerLeagueStatus: async (plsId, data) => {
    const response = await api.put(`/players/leagues_statuses/${plsId}`, data);
    return response.data;
  },
  
  deletePlayerLeagueStatus: async (plsId) => {
    const response = await api.delete(`/players/leagues_statuses/${plsId}`);
    return response.data;
  }
};

// Direct exports for cities
export const { getCities, createCity, updateCity, deleteCity, getCity } = citiesApi;

// Direct exports for players
export const { getPlayers, getPlayer, createPlayer, updatePlayer, deletePlayer } = playersApi;

// Direct exports for teams
export const { getTeams, getTeam, getTeamDetails, getTeamMatches, createTeam, updateTeam, deleteTeam } = teamsApi;

// Direct exports for leagues
export const { getLeagues, getLeague, createLeague, updateLeague, deleteLeague } = leaguesApi;

// Direct exports for stadiums
export const { getStadiums, getStadium, createStadium, updateStadium, deleteStadium } = stadiumsApi;

// Direct exports for matches
export const { getMatches, getMatch, createMatch, updateMatch, deleteMatch } = matchesApi;

// Direct exports for tournaments
export const { 
  getTournaments, 
  getTournamentDetails, 
  createTournament, 
  updateTournament, 
  deleteTournament,
  getTournamentStatistics,
  getTournamentTeams,
  getTournamentMatches 
} = tournamentsApi;

// Direct exports for player league statuses
export const { 
  getPlayerLeagueStatuses, 
  createPlayerLeagueStatus, 
  updatePlayerLeagueStatus, 
  deletePlayerLeagueStatus 
} = playerLeagueStatusesApi;

export default api;