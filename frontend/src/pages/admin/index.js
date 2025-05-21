import { useRouter } from 'next/router';
import { useState } from 'react';
import Head from 'next/head';

export default function AdminPage() {
  const router = useRouter();
  
  const adminMenuItems = [
    { name: 'Команды', path: '/admin/teams', description: 'Добавление и редактирование команд' },
    { name: 'Игроки', path: '/admin/players', description: 'Добавление и редактирование игроков' },
    { name: 'Турниры', path: '/admin/tournaments', description: 'Добавление и редактирование турниров' },
    { name: 'Матчи', path: '/admin/matches', description: 'Добавление и редактирование матчей' },
    { name: 'Города', path: '/admin/cities', description: 'Добавление и редактирование населенных пунктов' },
    { name: 'Лиги', path: '/admin/leagues', description: 'Добавление и редактирование лиг' },
    { name: 'Стадионы', path: '/admin/stadiums', description: 'Добавление и редактирование стадионов' },
    { name: 'Судьи', path: '/admin/referees', description: 'Добавление и редактирование судей' },
  ];

  return (
    <>
      <Head>
        <title>Панель администратора | Football Stat</title>
      </Head>
      
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Панель администратора</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminMenuItems.map((item) => (
            <div 
              key={item.path}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 cursor-pointer"
              onClick={() => router.push(item.path)}
            >
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
                <p className="text-gray-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
} 