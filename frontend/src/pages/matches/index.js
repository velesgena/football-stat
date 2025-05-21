import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useFetch from '../../hooks/useFetch';
import MatchCard from '../../components/matches/MatchCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { FaSearch, FaFilter, FaCalendarAlt } from 'react-icons/fa';

export default function MatchesPage() {
  const router = useRouter();
  const { team_id, tournament_id, player_id } = router.query;
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    team_id: team_id || '',
    tournament_id: tournament_id || '',
    status: '',
    date_from: '',
    date_to: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;
  
  // Маппинг статусов с русского на английский
  const statusMapping = {
    'Запланирован': 'scheduled',
    'Завершен': 'finished',
    'Отменен': 'canceled',
    'Перенесен': 'postponed',
    'Идет сейчас': 'live'
  };
  
  const queryParams = {
    skip: (page - 1) * limit,
    limit,
    ...(filters.team_id ? { team_id: filters.team_id } : {}),
    ...(filters.tournament_id ? { tournament_id: filters.tournament_id } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.date_from ? { date_from: filters.date_from } : {}),
    ...(filters.date_to ? { date_to: filters.date_to } : {}),
  };
  
  const { data, isLoading } = useFetch('/matches/', queryParams);

  const matches = data || [];
  const totalPages = Math.ceil((matches.length > 0 ? 100 : 0) / limit); // Estimate total pages

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    if (name === 'status') {
      // Преобразуем русский статус в английский для бэкенда
      setFilters(prev => ({ ...prev, [name]: statusMapping[value] || value }));
    } else {
      setFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const resetFilters = () => {
    setFilters({
      team_id: '',
      tournament_id: '',
      status: '',
      date_from: '',
      date_to: '',
    });
    setSearch('');
  };

  return (
    <>
      <Head>
        <title>Матчи | Футбольная статистика</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Матчи</h1>
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            <button 
              className="btn btn-outline flex items-center" 
              onClick={() => setShowFilters(!showFilters)}
            >
              <FaFilter className="mr-2" /> Фильтры
            </button>
          </div>
          
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Команда ID</label>
                  <input
                    type="text"
                    name="team_id"
                    className="input"
                    value={filters.team_id}
                    onChange={handleFilterChange}
                    placeholder="ID команды"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Турнир ID</label>
                  <input
                    type="text"
                    name="tournament_id"
                    className="input"
                    value={filters.tournament_id}
                    onChange={handleFilterChange}
                    placeholder="ID турнира"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
                  <select
                    name="status"
                    className="input"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">Все статусы</option>
                    <option value="Запланирован">Запланирован</option>
                    <option value="Завершен">Завершен</option>
                    <option value="Отменен">Отменен</option>
                    <option value="Перенесен">Перенесен</option>
                    <option value="Идет сейчас">Идет сейчас</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      name="date_from"
                      className="input pl-10"
                      value={filters.date_from}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="date"
                      name="date_to"
                      className="input pl-10"
                      value={filters.date_to}
                      onChange={handleFilterChange}
                    />
                  </div>
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
        ) : matches.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
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
            {filters.team_id || filters.tournament_id || filters.status || filters.date_from || filters.date_to
              ? 'По вашему запросу матчей не найдено' 
              : 'Матчи отсутствуют'}
          </div>
        )}
      </div>
    </>
  );
} 