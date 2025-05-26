import { useState, useCallback } from 'react';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import DetailsPage from './pages/DetailsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import StudentProfilePage from './pages/StudentProfilePage';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import NavigationBar from './components/NavigationBar';
import AdminProfilePage from './pages/AdminProfilePage';
import DebugInfo from './components/DebugInfo';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  
  // Estados de autenticação
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  const [advancedFilters, setAdvancedFilters] = useState({
    materialType: 'Todos',
    publicationYear: 'Todos',
    language: 'Todos',
    availability: 'Todos'
  });
  
  // Função de navegação otimizada com useCallback para performance
  const handlePageChange = useCallback((page, options = {}) => {
    // CORREÇÃO: Lógica específica para admin
    console.log('Navegando para:', page, 'Usuário:', user?.papel);
    
    // Se admin tentar acessar 'perfil', redirecionar para 'admin-perfil'
    if (page === 'perfil' && isLoggedIn && user?.papel === 'admin') {
      setCurrentPage('admin-perfil');
      return;
    }
    
    // Se não-admin tentar acessar admin-perfil, redirecionar para login
    if (page === 'admin-perfil' && (!isLoggedIn || user?.papel !== 'admin')) {
      setCurrentPage('login');
      return;
    }
    
    // Proteção de rota: redirecionar para login se tentar acessar perfil sem estar logado
    if (page === 'perfil' && !isLoggedIn) {
      setCurrentPage('login');
      return;
    }
    
    // Preservar estado de pesquisa quando necessário
    if (page !== 'resultados' && !options.preserveSearch) {
      setIsSearchTriggered(false);
      setLastSearchQuery('');
    }
    
    // Fechar filtros automaticamente ao navegar
    if (filterOpen) {
      setFilterOpen(false);
    }
    
    setCurrentPage(page);
  }, [filterOpen, isLoggedIn, user?.papel]);
  
  const handleSearch = useCallback(() => {
    setLastSearchQuery(searchQuery);
    setIsSearchTriggered(true);
    setCurrentPage('resultados');
  }, [searchQuery]);
  
  const navigateToDetails = useCallback((bookId) => {
    setSelectedBookId(bookId);
    setCurrentPage('detalhes');
  }, []);

  // Funções de autenticação com transições suaves
  const handleLogin = useCallback((userData) => {
    console.log('Login realizado para:', userData);
    setIsLoggedIn(true);
    setUser(userData);
    
    // CORREÇÃO: Redirecionar admin para sua página específica
    if (userData.papel === 'admin') {
      setTimeout(() => {
        setCurrentPage('admin-perfil');
      }, 100);
    } else {
      // Animação suave para home após login de usuários normais
      setTimeout(() => {
        setCurrentPage('home');
      }, 100);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('home');
  }, []);

  const handleRegisterSuccess = useCallback(() => {
    setCurrentPage('login');
  }, []);

  const renderPage = () => {
    try {
      switch (currentPage) {
        case 'home':
          return (
            <div className="animate-in fade-in duration-300">
              <HomePage 
                setCurrentPage={handlePageChange} 
                navigateToDetails={navigateToDetails} 
              />
            </div>
          );
        case 'resultados':
          return (
            <div className="animate-in fade-in duration-300">
              <SearchResultsPage
                setCurrentPage={handlePageChange}
                searchQuery={lastSearchQuery}
                currentInputQuery={searchQuery}
                advancedFilters={advancedFilters}
                navigateToDetails={navigateToDetails}
                isSearchTriggered={isSearchTriggered}
              />
            </div>
          );
        case 'detalhes':
          return (
            <div className="animate-in fade-in duration-300">
              <DetailsPage 
                setCurrentPage={handlePageChange} 
                bookId={selectedBookId} 
              />
            </div>
          );
        case 'perfil':
          // Proteção adicional: só renderiza se estiver logado
          if (!isLoggedIn) {
            console.warn('Tentativa de acesso ao perfil sem login - redirecionando...');
            setTimeout(() => setCurrentPage('login'), 0);
            return (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <p className="text-gray-600">Redirecionando para login...</p>
                </div>
              </div>
            );
          }
          return (
            <div className="animate-in slide-in-from-right duration-400">
              <StudentProfilePage 
                setCurrentPage={handlePageChange}
                user={user}
                isLoggedIn={isLoggedIn}
              />
            </div>
          );
        case 'cadastro':
          return (
            <div className="animate-in slide-in-from-bottom duration-400">
              <RegisterPage 
                setCurrentPage={handlePageChange} 
                onRegisterSuccess={handleRegisterSuccess}
              />
            </div>
          );
        case 'login':
          return (
            <div className="animate-in slide-in-from-bottom duration-400">
              <LoginPage 
                setCurrentPage={handlePageChange}
                onLogin={handleLogin}
              />
            </div>
          );
        case 'admin-perfil':
          // Proteção adicional: só renderiza se for admin
          if (!isLoggedIn || user?.papel !== 'admin') {
            console.warn('Tentativa de acesso ao painel admin sem permissão - redirecionando...');
            setTimeout(() => setCurrentPage('login'), 0);
            return (
              <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                  <p className="text-red-600">Acesso negado. Redirecionando...</p>
                </div>
              </div>
            );
          }
          return (
            <div className="animate-in slide-in-from-right duration-400">
              <AdminProfilePage 
                setCurrentPage={handlePageChange}
                user={user}
                isLoggedIn={isLoggedIn}
                onLogout={handleLogout}
              />
            </div>
          );
        default:
          return (
            <div className="animate-in fade-in duration-300">
              <HomePage 
                setCurrentPage={handlePageChange}
                navigateToDetails={navigateToDetails} 
              />
            </div>
          );
      }
    } catch (error) {
      console.error("Erro ao renderizar página:", error);
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Algo deu errado</h2>
            <p className="text-gray-600 mb-4">Erro ao carregar a página.</p>
            <button 
              onClick={() => handlePageChange('home')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      );
    }
  };

  // Verificar se deve mostrar Header, SearchBar e NavigationBar
  const showHeaderAndComponents = !['login', 'cadastro', 'perfil', 'admin-perfil'].includes(currentPage);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* DEBUG: Informações de debug */}
      <DebugInfo isLoggedIn={isLoggedIn} user={user} currentPage={currentPage} />
      
      {showHeaderAndComponents && (
        <div className="animate-in slide-in-from-top duration-300">
          <Header 
            setCurrentPage={handlePageChange} 
            isLoggedIn={isLoggedIn}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      )}
      {showHeaderAndComponents && (
        <div className="animate-in slide-in-from-top duration-300 delay-100">
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            advancedFilters={advancedFilters}
            setAdvancedFilters={setAdvancedFilters}
            handleSearch={handleSearch}
          />
        </div>
      )}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
      {showHeaderAndComponents && (
        <div className="animate-in slide-in-from-bottom duration-300">
          <NavigationBar 
            currentPage={currentPage} 
            setCurrentPage={handlePageChange}
            isLoggedIn={isLoggedIn}
          />
        </div>
      )}
    </div>
  );
}