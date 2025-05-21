import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './components/HomePage';

// Заглушки для других страниц, которые мы создадим позже
const Teams = () => <div className="container py-5"><h1>Команды</h1><p>Страница списка команд (будет реализована)</p></div>;
const TeamDetail = () => <div className="container py-5"><h1>Детали команды</h1><p>Страница с детальной информацией о команде (будет реализована)</p></div>;
const Matches = () => <div className="container py-5"><h1>Матчи</h1><p>Страница списка матчей (будет реализована)</p></div>;
const MatchDetail = () => <div className="container py-5"><h1>Детали матча</h1><p>Страница с детальной информацией о матче (будет реализована)</p></div>;
const Stats = () => <div className="container py-5"><h1>Статистика</h1><p>Страница со статистикой (будет реализована)</p></div>;
const About = () => <div className="container py-5"><h1>О нас</h1><p>Информация о проекте Football Stat (будет реализована)</p></div>;
const NotFound = () => <div className="container py-5 text-center"><h1>404</h1><p>Страница не найдена</p></div>;

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:id" element={<TeamDetail />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/matches/:id" element={<MatchDetail />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App; 