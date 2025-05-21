import { useState, useEffect } from 'react';
import Head from 'next/head';
import useFetch from '../../hooks/useFetch';
import TournamentCard from '../../components/tournaments/TournamentCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { FaSearch, FaFilter } from 'react-icons/fa';

export default function TournamentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    season: '',
    league_id: '',
    tournament_type: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [debugInfo, setDebugInfo] = useState({ visible: false, messages: [] });
  const limit = 12;
  
  const queryParams = {
    skip: (page - 1) * limit,
    limit,
    ...(search ? { name: search } : {}),
    ...(filters.season ? { season: filters.season } : {}),
    ...(filters.league_id ? { league_id: filters.league_id } : {}),
    ...(filters.tournament_type ? { tournament_type: filters.tournament_type } : {}),
  };
  
  const { data, isLoading, isError, errorInfo } = useFetch('/tournaments/', queryParams);

  const tournaments = data || [];
  const totalPages = Math.ceil((tournaments.length > 0 ? 100 : 0) / limit); // Estimate total pages

  // Добавляем логирование ошибок и информации
  useEffect(() => {
    if (isError && errorInfo) {
      console.error('Ошибка при загрузке турниров:', errorInfo);
      setDebugInfo(prev => ({
        visible: true,
        messages: [...prev.messages, `Ошибка: ${errorInfo.message || 'Неизвестная ошибка'}`]
      }));
    }

    if (data) {
      console.log('Загружены данные о турнирах:', data);
      setDebugInfo(prev => ({
        ...prev,
        messages: [...prev.messages, `Загружено ${data.length} турниров`]
      }));
    }
  }, [data, isError, errorInfo]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      season: '',
      league_id: '',
      tournament_type: '',
    });
    setSearch('');
  };

  const toggleDebugInfo = () => {
    setDebugInfo(prev => ({ ...prev, visible: !prev.visible }));
  };

  return (
    <>
      <Head>
        <title>Турниры | Футбольная статистика</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Турниры</h1>
        
        {/* Кнопка отладки */}
        <button 
          onClick={toggleDebugInfo} 
          className="mb-4 text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300"
        >
          {debugInfo.visible ? 'Скрыть отладку' : 'Показать отладку'}
        </button>
        
        {/* Отладочная информация */}
        {debugInfo.visible && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm">
            <h3 className="font-bold mb-2">Отладочная информация:</h3>
            <ul className="list-disc pl-5">
              <li>URL запроса: /tournaments/</li>
              <li>Параметры: {JSON.stringify(queryParams)}</li>
              <li>Статус загрузки: {isLoading ? 'Загрузка...' : 'Завершена'}</li>
              <li>Есть ошибка: {isError ? 'Да' : 'Нет'}</li>
              {isError && errorInfo && (
                <>
                  <li>Сообщение ошибки: {errorInfo.message}</li>
                  <li>Статус ошибки: {errorInfo.status}</li>
                  <li>URL запроса с ошибкой: {errorInfo.url}</li>
                </>
              )}
            </ul>
            {debugInfo.messages.length > 0 && (
              <div className="mt-2">
                <h4 className="font-bold">Журнал событий:</h4>
                <ul className="list-disc pl-5">
                  {debugInfo.messages.map((msg, idx) => (
                    <li key={idx}>{msg}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Поиск турниров..."
                className="input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
            <button 
              className="btn btn-outline flex items-center" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="mr-2" /> Фильтры
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Сезон</label>
                  <input
                    type="text"
                    name="season"
                    className="input"
                    value={filters.season}
                    onChange={handleFilterChange}
                    placeholder="Например: 2023/2024"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Лига ID</label>
                  <input
                    type="text"
                    name="league_id"
                    className="input"
                    value={filters.league_id}
                    onChange={handleFilterChange}
                    placeholder="ID лиги"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Тип турнира</label>
                  <select
                    name="tournament_type"
                    className="input"
                    value={filters.tournament_type}
                    onChange={handleFilterChange}
                  >
                    <option value="">Все типы</option>
                    <option value="LEAGUE">Лига</option>
                    <option value="CUP">Кубок</option>
                    <option value="FRIENDLY">Товарищеский</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <button 
                  className="btn btn-outline" 
                  onClick={resetFilters}
                >
                  Сбросить
                </button>
              </div>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <LoadingSpinner className="py-20" />
        ) : isError ? (
          <div className="text-center py-10 text-red-500">
            <p className="mb-2 font-bold">Ошибка при загрузке данных</p>
            <p>{errorInfo?.message || 'Неизвестная ошибка'}</p>
            {errorInfo?.status && <p>Статус: {errorInfo.status}</p>}
          </div>
        ) : tournaments.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {tournaments.map((tournament) => (
                <TournamentCard key={tournament.id} tournament={tournament} />
              ))}
            </div>
            
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              className="mt-8"
            />
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            {search || filters.season || filters.league_id || filters.tournament_type 
              ? 'По вашему запросу турниров не найдено' 
              : 'Турниры отсутствуют'}
          </div>
        )}
      </div>
    </>
  );
} 