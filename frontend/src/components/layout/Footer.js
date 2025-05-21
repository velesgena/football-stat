import Link from 'next/link';
import { FaGithub, FaTwitter } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 text-white">ФутСтат</h3>
            <p className="text-sm">
              Комплексная платформа футбольной статистики для игроков, команд, матчей и турниров.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3 text-white">Навигация</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm hover:text-white">
                  Главная
                </Link>
              </li>
              <li>
                <Link href="/teams" className="text-sm hover:text-white">
                  Команды
                </Link>
              </li>
              <li>
                <Link href="/players" className="text-sm hover:text-white">
                  Игроки
                </Link>
              </li>
              <li>
                <Link href="/matches" className="text-sm hover:text-white">
                  Матчи
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3 text-white">Информация</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm hover:text-white">
                  О нас
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm hover:text-white">
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm hover:text-white">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm hover:text-white">
                  Условия использования
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-3 text-white">Связаться с нами</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <FaGithub className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <FaTwitter className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} ФутСтат. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
} 