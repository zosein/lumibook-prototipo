import { useState } from 'react';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import DetailsPage from './pages/DetailsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import NavigationBar from './components/NavigationBar';

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
  
  const handleSearch = () => {
    setLastSearchQuery(searchQuery);
    setIsSearchTriggered(true);
    setCurrentPage('resultados');
  };
  
  const navigateToDetails = (bookId) => {
    setSelectedBookId(bookId);
    setCurrentPage('detalhes');
  };

  const handlePageChange = (page) => {
    if (page !== 'resultados') {
      setIsSearchTriggered(false);
      setLastSearchQuery('');
    }
    setCurrentPage(page);
  };

  // Função para fazer login
  const handleLogin = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    setCurrentPage('home');
  };

  // Função para fazer logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('home');
  };

  // Função para redirecionar após cadastro
  const handleRegisterSuccess = () => {
    setCurrentPage('login');
  };

  const renderPage = () => {
    try {
      switch (currentPage) {
        case 'home':
          return <HomePage 
                    setCurrentPage={handlePageChange} 
                    navigateToDetails={navigateToDetails} 
                  />;
        case 'resultados':
          return (
            <SearchResultsPage
              setCurrentPage={handlePageChange}
              searchQuery={lastSearchQuery}
              currentInputQuery={searchQuery}
              advancedFilters={advancedFilters}
              navigateToDetails={navigateToDetails}
              isSearchTriggered={isSearchTriggered}
            />
          );
        case 'detalhes':
          return <DetailsPage 
                    setCurrentPage={handlePageChange} 
                    bookId={selectedBookId} 
                  />;
        case 'cadastro':
          return <RegisterPage 
                    setCurrentPage={handlePageChange} 
                    onRegisterSuccess={handleRegisterSuccess}
                  />;
        case 'login':
          return <LoginPage 
                    setCurrentPage={handlePageChange}
                    onLogin={handleLogin}
                  />;
        default:
          return <HomePage 
                    setCurrentPage={handlePageChange}
                    navigateToDetails={navigateToDetails} 
                  />;
      }
    } catch (error) {
      console.error("Erro ao renderizar página:", error);
      return <div className="p-4">Erro ao carregar a página. Por favor, tente novamente.</div>;
    }
  };

  // Verificar se deve mostrar Header, SearchBar e NavigationBar
  const showHeaderAndComponents = !['login', 'cadastro'].includes(currentPage);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {showHeaderAndComponents && (
        <Header 
          setCurrentPage={handlePageChange} 
          isLoggedIn={isLoggedIn}
          user={user}
          onLogout={handleLogout}
        />
      )}
      {showHeaderAndComponents && (
        <SearchBar 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          filterOpen={filterOpen}
          setFilterOpen={setFilterOpen}
          advancedFilters={advancedFilters}
          setAdvancedFilters={setAdvancedFilters}
          handleSearch={handleSearch}
        />
      )}
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
      {showHeaderAndComponents && (
        <NavigationBar currentPage={currentPage} setCurrentPage={handlePageChange} />
      )}
    </div>
  );
}