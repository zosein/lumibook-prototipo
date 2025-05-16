import { Home, Search, Clock, User } from 'lucide-react';

export default function NavigationBar({ currentPage, setCurrentPage }) {
  return (
    <nav className="bg-gray-800 text-white p-2 flex justify-around">
      <button 
        className={`flex flex-col items-center p-1 ${currentPage === 'home' ? 'text-blue-300' : ''}`}
        onClick={() => setCurrentPage('home')}
      >
        <Home size={20} />
        <span className="text-xs">Início</span>
      </button>
      <button 
        className={`flex flex-col items-center p-1 ${currentPage === 'resultados' ? 'text-blue-300' : ''}`}
        onClick={() => setCurrentPage('resultados')}
      >
        <Search size={20} />
        <span className="text-xs">Pesquisa</span>
      </button>
      <button className="flex flex-col items-center p-1">
        <Clock size={20} />
        <span className="text-xs">Reservas</span>
      </button>
      <button className="flex flex-col items-center p-1">
        <User size={20} />
        <span className="text-xs">Perfil</span>
      </button>
    </nav>
  );
}