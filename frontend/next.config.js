/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', '192.168.1.124'],
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8088';
    console.log("Применение rewrites для API запросов с URL:", apiUrl);
    return [
      // Проксирование все API запросов
      {
        source: '/api/:path*',
        destination: `${apiUrl}/:path*`,
      },
      // Корневой путь API
      {
        source: '/api',
        destination: `${apiUrl}/`,
      },
      // Более конкретные маршруты для различных API endpoints
      {
        source: '/api/players/:id*',
        destination: `${apiUrl}/players/:id*`,
      },
      {
        source: '/api/players',
        destination: `${apiUrl}/players/`,
      },
      {
        source: '/api/cities/:id*',
        destination: `${apiUrl}/cities/:id*`,
      },
      {
        source: '/api/cities',
        destination: `${apiUrl}/cities/`,
      },
      {
        source: '/api/teams/:id*',
        destination: `${apiUrl}/teams/:id*`,
      },
      {
        source: '/api/teams',
        destination: `${apiUrl}/teams/`,
      },
      {
        source: '/api/leagues/:id*',
        destination: `${apiUrl}/leagues/:id*`,
      },
      {
        source: '/api/leagues',
        destination: `${apiUrl}/leagues/`,
      },
      {
        source: '/api/stadiums/:id*',
        destination: `${apiUrl}/stadiums/:id*`,
      },
      {
        source: '/api/stadiums',
        destination: `${apiUrl}/stadiums/`,
      },
      {
        source: '/api/tournaments/:id*',
        destination: `${apiUrl}/tournaments/:id*`,
      },
      {
        source: '/api/tournaments',
        destination: `${apiUrl}/tournaments/`,
      },
      {
        source: '/api/matches/:id*',
        destination: `${apiUrl}/matches/:id*`,
      },
      {
        source: '/api/matches',
        destination: `${apiUrl}/matches/`,
      },
    ];
  },
  trailingSlash: true,
  allowedDevOrigins: ['192.168.1.87', '192.168.1.124', 'localhost'],
  // Увеличиваем время ожидания запросов
  serverRuntimeConfig: {
    http: {
      timeout: 10000, // 10 секунд
    },
  },
  // Отключаем сжатие для упрощения отладки
  compress: false,
};

module.exports = nextConfig;