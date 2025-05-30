import { BookMarked, LockIcon, UserPlus, LogOut, ChevronDown, Mail, Hash, UserCheck } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Header({ setCurrentPage, isLoggedIn, user, onLogout }) {
  // DEBUG: Log do usuário atual
  useEffect(() => {
    console.log('Header - Usuario logado:', { isLoggedIn, user });
  }, [isLoggedIn, user]);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Função para determinar o que exibir no dropdown
  const getDisplayInfo = () => {
    if (!user) return { displayName: '', displayEmail: '', displayIcon: null };
    
    if (user.tipoLogin === 'email') {
      return {
        displayName: user.nome || user.usuario,
        displayEmail: user.usuario,
        displayIcon: <Mail size={14} className="text-blue-500" />
      };
    } else {
      return {
        displayName: user.nome || user.usuario,
        displayEmail: `Matrícula: ${user.usuario}`,
        displayIcon: <Hash size={14} className="text-green-500" />
      };
    }
  };

  // Função para obter as iniciais do nome
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  if (isLoggedIn && user) {
    const { displayName, displayEmail, displayIcon } = getDisplayInfo();
    const initials = getInitials(displayName);
    
    return (
      <header className="bg-blue-700 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookMarked size={24} />
            <h1 className="text-xl font-bold">LUMIBOOK</h1>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button 
              className="bg-sky-500 hover:bg-sky-600 px-3 py-2 rounded-lg flex items-center gap-3 transition-all duration-200 hover:shadow-md active:scale-95"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              {/* Avatar com iniciais */}
              <div className="w-8 h-8 bg-white text-blue-700 rounded-full flex items-center justify-center font-semibold text-sm">
                {initials}
              </div>
              <span className="hidden sm:inline font-medium">Olá, {displayName.split(' ')[0]}</span>
              <ChevronDown 
                size={16} 
                className={`transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>
            
            {/* Dropdown com animação */}
            <div className={`absolute right-0 top-full mt-2 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 min-w-64 z-50 overflow-hidden transition-all duration-200 ${
              dropdownOpen 
                ? 'opacity-100 transform translate-y-0 visible' 
                : 'opacity-0 transform translate-y-2 invisible'
            }`}>
              {/* Header do dropdown */}
              <div className="bg-gradient-to-r from-blue-50 to-sky-50 p-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-lg">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{displayName}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      {displayIcon}
                      <p className="text-sm text-gray-600 truncate">{displayEmail}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      <UserCheck size={12} className="text-green-500" />
                      <span className="text-xs text-green-600 font-medium capitalize bg-green-50 px-2 py-0.5 rounded-full">
                        {user.papel || 'Usuário'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Opções do dropdown */}
              <div className="p-2">
                <button 
                  className="w-full text-left px-3 py-2.5 hover:bg-red-50 hover:text-red-600 rounded-lg flex items-center gap-3 text-gray-700 transition-colors duration-150 group"
                  onClick={() => {
                    onLogout();
                    setDropdownOpen(false);
                  }}
                >
                  <LogOut size={16} className="group-hover:text-red-500" />
                  <span className="font-medium">Sair da conta</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-blue-700 text-white p-4 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookMarked size={24} />
          <h1 className="text-xl font-bold">LUMIBOOK</h1>
        </div>
        <div className="flex gap-3">
          <button 
            className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-md active:scale-95"
            onClick={() => setCurrentPage('login')}
          >
            <LockIcon size={18} />
            <span className="font-medium">Entrar</span>
          </button>
          <button 
            className="bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 hover:shadow-md active:scale-95"
            onClick={() => setCurrentPage('cadastro')}
          >
            <UserPlus size={18} />
            <span className="font-medium">Cadastrar</span>
          </button>
        </div>
      </div>
    </header>
  );
}