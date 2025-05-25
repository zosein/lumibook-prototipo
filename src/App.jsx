import { useState } from 'react';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import DetailsPage from './pages/DetailsPage';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import NavigationBar from './components/NavigationBar';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState(''); // Nova state para a última busca executada
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    materialType: 'Todos',
    publicationYear: 'Todos',
    language: 'Todos',
    availability: 'Todos'
  });
  
  const handleSearch = () => {
    setLastSearchQuery(searchQuery); // Captura o termo atual da busca
    setIsSearchTriggered(true);
    setCurrentPage('resultados');
  };
  
  const navigateToDetails = (bookId) => {
    setSelectedBookId(bookId);
    setCurrentPage('detalhes');
  };

  // Função para resetar a pesquisa quando navegar para outras páginas
  const handlePageChange = (page) => {
    if (page !== 'resultados') {
      setIsSearchTriggered(false);
      setLastSearchQuery(''); // Limpa a última busca ao sair da página de resultados
    }
    setCurrentPage(page);
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
              searchQuery={lastSearchQuery} // Passa a última busca executada
              currentInputQuery={searchQuery} // Passa o valor atual do input
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

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      <SearchBar 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        filterOpen={filterOpen}
        setFilterOpen={setFilterOpen}
        advancedFilters={advancedFilters}
        setAdvancedFilters={setAdvancedFilters}
        handleSearch={handleSearch}
      />
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
      <NavigationBar currentPage={currentPage} setCurrentPage={handlePageChange} />
    </div>
  );
}