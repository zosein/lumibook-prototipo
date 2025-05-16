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
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState({
    materialType: 'Todos',
    publicationYear: 'Todos',
    language: 'Todos',
    availability: 'Todos'
  });
  
  
  const handleSearch = () => {
    
    setCurrentPage('resultados');
  };

  
  const navigateToDetails = (bookId) => {
    setSelectedBookId(bookId);
    setCurrentPage('detalhes');
  };

  const renderPage = () => {
    try {
      switch (currentPage) {
        case 'home':
          return <HomePage 
                    setCurrentPage={setCurrentPage} 
                    navigateToDetails={navigateToDetails} 
                  />;
        case 'resultados':
          return (
            <SearchResultsPage
              setCurrentPage={setCurrentPage}
              searchQuery={searchQuery}
              advancedFilters={advancedFilters}
              navigateToDetails={navigateToDetails}
            />
          );
        case 'detalhes':
          return <DetailsPage 
                    setCurrentPage={setCurrentPage} 
                    bookId={selectedBookId} 
                  />;
        default:
          return <HomePage 
                    setCurrentPage={setCurrentPage}
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
      <NavigationBar currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
}