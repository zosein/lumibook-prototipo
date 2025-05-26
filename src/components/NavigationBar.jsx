import { Home, Search, Clock, User, Shield } from 'lucide-react';

export default function NavigationBar({ currentPage, setCurrentPage, isLoggedIn, user }) {
  // Determinar itens de navegação baseado no tipo de usuário
  const getNavItems = () => {
    const baseItems = [
      { id: 'home', icon: Home, label: 'Início' },
      { id: 'resultados', icon: Search, label: 'Pesquisa' }
    ];

    if (isLoggedIn && user?.papel === 'admin') {
      return [
        ...baseItems,
        { id: 'admin-dashboard', icon: Shield, label: 'Admin' },
        { id: 'admin-perfil', icon: User, label: 'Perfil' } // MUDANÇA: usar admin-perfil diretamente
      ];
    } else {
      return [
        ...baseItems,
        { id: 'reservas', icon: Clock, label: 'Reservas' },
        { id: 'perfil', icon: User, label: 'Perfil' }
      ];
    }
  };

  const navItems = getNavItems();

  const handleNavigation = (id) => {
    // CORREÇÃO: Lógica mais clara para roteamento
    
    // Se é admin tentando acessar qualquer área restrita
    if (isLoggedIn && user?.papel === 'admin') {
      if (id === 'admin-dashboard' || id === 'admin-perfil') {
        setCurrentPage('admin-perfil');
        return;
      }
      if (id === 'perfil') {
        setCurrentPage('admin-perfil');
        return;
      }
    }

    // Se usuário não-admin tenta acessar admin
    if (id === 'admin-dashboard' || id === 'admin-perfil') {
      if (!isLoggedIn) {
        setCurrentPage('login');
        return;
      }
      if (user?.papel !== 'admin') {
        // Usuário logado mas não é admin - negar acesso
        return;
      }
    }

    // Se tentar acessar perfil sem estar logado, redireciona para login
    if (id === 'perfil' && !isLoggedIn) {
      setCurrentPage('login');
      return;
    }
    
    // Navegação normal para outras páginas
    setCurrentPage(id);
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg border-t border-gray-700">
      <div className="flex justify-around py-2">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            className={`relative flex flex-col items-center p-2 min-w-[60px] rounded-lg transition-all duration-200 active:scale-95 ${
              (currentPage === id || 
               (id === 'admin-dashboard' && currentPage === 'admin-perfil') ||
               (id === 'admin-perfil' && currentPage === 'admin-perfil'))
                ? 'text-blue-300 bg-gray-700'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => handleNavigation(id)}
            title={getTooltipText(id, isLoggedIn, user)}
          >
            <Icon 
              size={20} 
              className={`mb-1 transition-colors duration-200 ${
                (currentPage === id || 
                 (id === 'admin-dashboard' && currentPage === 'admin-perfil') ||
                 (id === 'admin-perfil' && currentPage === 'admin-perfil'))
                  ? 'text-blue-300' 
                  : 'text-gray-300'
              }`} 
            />
            <span className="text-xs font-medium">{label}</span>
            {(currentPage === id || 
              (id === 'admin-dashboard' && currentPage === 'admin-perfil') ||
              (id === 'admin-perfil' && currentPage === 'admin-perfil')) && (
              <div className="w-1 h-1 bg-blue-300 rounded-full mt-1 animate-pulse"></div>
            )}
            {/* Indicador especial para admin */}
            {(id === 'admin-dashboard' || id === 'admin-perfil') && isLoggedIn && user?.papel === 'admin' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-800"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

function getTooltipText(id, isLoggedIn, user) {
  if (id === 'admin-dashboard' || id === 'admin-perfil') {
    if (!isLoggedIn) return 'Clique para fazer login';
    if (user?.papel !== 'admin') return 'Acesso restrito a administradores';
    return 'Painel Administrativo';
  }
  if (id === 'perfil' && !isLoggedIn) return 'Clique para fazer login';
  return '';
}