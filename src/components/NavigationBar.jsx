import { Home, Search, Clock, User, Shield, BookOpen, FileText, Book, GraduationCap } from 'lucide-react';

export default function NavigationBar({ currentPage, setCurrentPage, isLoggedIn, user }) {
  // Define os itens de navegação de acordo com o tipo de usuário
  const getNavItems = () => {
    const baseItems = [
      { id: 'home', icon: Home, label: 'Início' },
      { id: 'resultados', icon: Search, label: 'Pesquisa' }
    ];
    if (isLoggedIn && user?.papel === 'admin') {
      // Admin tem acesso a rotas exclusivas
      return [
        ...baseItems,
        { id: 'admin-dashboard', icon: Shield, label: 'Admin' },
        { id: 'admin-perfil', icon: User, label: 'Perfil' }
      ];
    } else {
      // Usuário comum
      return [
        ...baseItems,
        { id: 'reservas', icon: Clock, label: 'Reservas' },
        { id: 'perfil', icon: User, label: 'Perfil' }
      ];
    }
  };

  const navItems = getNavItems();

  // Lógica de navegação centralizada para tratar regras de acesso
  const handleNavigation = (id) => {
    // Busca por categoria
    if (id === 'admin-dashboard' || id === 'admin-perfil') {
      if (!isLoggedIn) {
        setCurrentPage('login');
        return;
      }
      if (user?.papel !== 'admin') {
        return;
      }
    }
    // Redireciona para login se tentar acessar perfil sem estar logado
    if (id === 'perfil' && !isLoggedIn) {
      setCurrentPage('login');
      return;
    }
    // Acesso direto para reservas
    if (id === 'reservas') {
      setCurrentPage('reservas');
      return;
    }
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
            {/* Indicador visual para admin logado */}
            {(id === 'admin-dashboard' || id === 'admin-perfil') && isLoggedIn && user?.papel === 'admin' && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-800"></div>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}

// Tooltip contextual para navegação
function getTooltipText(id, isLoggedIn, user) {
  if (id === 'admin-dashboard' || id === 'admin-perfil') {
    if (!isLoggedIn) return 'Clique para fazer login';
    if (user?.papel !== 'admin') return 'Acesso restrito a administradores';
    return 'Painel Administrativo';
  }
  if (id === 'perfil' && !isLoggedIn) return 'Clique para fazer login';
  return '';
}