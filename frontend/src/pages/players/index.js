import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import useFetch from '../../hooks/useFetch';
import PlayerCard from '../../components/players/PlayerCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { FaSearch, FaFilter } from 'react-icons/fa';

export default function PlayersPage() {
  const router = useRouter();
  const { team_id } = router.query;
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    team_id: team_id || '',
    nationality: '',
    position: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const limit = 12;
  
  const queryParams = {
    skip: (page - 1) * limit,
    limit,
    ...(search ? { name: search } : {}),
    ...(filters.team_id ? { team_id: filters.team_id } : {}),
    ...(filters.nationality ? { nationality: filters.nationality } : {}),
    ...(filters.position ? { position: filters.position } : {}),
  };
  
  const { data, isLoading } = useFetch('/players/', queryParams);

  const players = data || [];
  const totalPages = Math.ceil((players.length > 0 ? 100 : 0) / limit); // Estimate total pages

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      team_id: '',
      nationality: '',
      position: '',
    });
    setSearch('');
  };

  return (
    <>
      <Head>
        <title>Игроки | Футбольная статистика</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Игроки</h1>
        
        <div className="mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Поиск игроков..."
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Национальность</label>
                  <input
                    type="text"
                    name="nationality"
                    className="input"
                    value={filters.nationality}
                    onChange={handleFilterChange}
                    placeholder="Например: Россия"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Позиция</label>
                  <input
                    type="text"
                    name="position"
                    className="input"
                    value={filters.position}
                    onChange={handleFilterChange}
                    placeholder="Например: Нападающий"
                  />
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
        ) : players.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {players.map((player) => (
                <PlayerCard key={player.id} player={player} />
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
            {search || filters.team_id || filters.nationality || filters.position 
              ? 'По вашему запросу игроков не найдено' 
              : 'Игроки отсутствуют'}
          </div>
        )}
      </div>
    </>
  );
} 