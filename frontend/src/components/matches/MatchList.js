import React from 'react';
import Link from 'next/link';

export default function MatchList({ matches, tournaments, stadiums, referees }) {
  if (!matches || matches.length === 0) {
    return <div className="text-gray-500">Матчи не найдены</div>;
  }

  // Группируем матчи по турнирам
  const matchesByTournament = matches.reduce((acc, match) => {
    const tournamentId = match.tournament_id;
    if (!acc[tournamentId]) {
      acc[tournamentId] = {
        tournament: tournaments.find(t => t.id === tournamentId),
        matches: []
      };
    }
    acc[tournamentId].matches.push(match);
    return acc;
  }, {});

  // Функция для определения результата матча
  const getMatchResult = (match, isHome) => {
    if (!match || match.status !== 'finished') return null;
    
    const home = Number(match.home_score);
    const away = Number(match.away_score);
    
    if (isHome) {
      if (home > away) return { label: 'Победа', color: 'bg-green-100 text-green-800' };
      if (home === away) return { label: 'Ничья', color: 'bg-yellow-100 text-yellow-800' };
      return { label: 'Поражение', color: 'bg-red-100 text-red-800' };
    } else {
      if (away > home) return { label: 'Победа', color: 'bg-green-100 text-green-800' };
      if (home === away) return { label: 'Ничья', color: 'bg-yellow-100 text-yellow-800' };
      return { label: 'Поражение', color: 'bg-red-100 text-red-800' };
    }
  };

  return (
    <div className="space-y-8">
      {Object.values(matchesByTournament).map(({ tournament, matches }) => (
        <div key={tournament?.id || 'unknown'} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 bg-gray-50 border-b">
            <h3 className="text-lg font-bold">
              {tournament?.name || 'Турнир'}
              {tournament?.season && (
                <span className="ml-2 text-gray-500">{tournament.season}</span>
              )}
              {tournament?.format && (
                <span className="ml-2 text-gray-500">({tournament.format})</span>
              )}
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дата
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Тур
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Матч
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Счёт
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Стадион
                  </th>
                  <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {matches
                  .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
                  .map(match => {
                    const stadium = stadiums.find(s => s.id === match.stadium_id);
                    const referee = referees.find(r => r.id === match.referee_id);
                    const result = getMatchResult(match, match.home_team_id === match.team_id);

                    return (
                      <tr
                        key={match.id}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => window.location.href = `/matches/${match.id}`}
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {new Date(match.match_date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {match.round || '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          {match.home_team_name} - {match.away_team_name}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                          {match.status === 'finished' ? (
                            <span>
                              {match.home_score} : {match.away_score}
                            </span>
                          ) : (
                            <span className="text-gray-400">-:-</span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                          {stadium?.name || '-'}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm">
                          {result ? (
                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${result.color}`}>
                              {result.label}
                            </span>
                          ) : (
                            <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {match.status === 'scheduled' ? 'Запланирован' :
                               match.status === 'live' ? 'В игре' :
                               match.status === 'postponed' ? 'Перенесен' :
                               match.status === 'canceled' ? 'Отменен' : 
                               'Неизвестно'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
} 