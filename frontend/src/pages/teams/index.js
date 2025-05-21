import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getTeams } from '../../utils/api';
import useFetch from '../../hooks/useFetch';
import TeamCard from '../../components/teams/TeamCard';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Pagination from '../../components/ui/Pagination';
import { FaSearch, FaPlus } from 'react-icons/fa';

export default function TeamsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const limit = 12;
  
  const { data, isLoading } = useFetch('/teams/', {
    skip: (page - 1) * limit,
    limit,
    name: search || undefined,
  });

  const teams = data || [];
  const totalPages = Math.ceil((teams.length > 0 ? 100 : 0) / limit); // Estimate total pages

  const handleAddTeam = () => {
    router.push('/admin/teams/create');
  };

  return (
    <>
      <Head>
        <title>Команды | Футбольная статистика</title>
      </Head>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Команды</h1>
          <button 
            onClick={handleAddTeam}
            className="btn btn-primary flex items-center gap-2"
          >
            <FaPlus /> Добавить команду
          </button>
        </div>
        
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск команд..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>
        
        {isLoading ? (
          <LoadingSpinner className="py-20" />
        ) : teams.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
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
            {search ? 'По вашему запросу команд не найдено' : 'Команды отсутствуют'}
          </div>
        )}
      </div>
    </>
  );
} 