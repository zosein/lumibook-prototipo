import ResultList from '../components/ResultList';
import { useEffect } from 'react';

export default function SearchResultsPage({ 
  setCurrentPage, 
  searchQuery, 
  currentInputQuery, 
  advancedFilters, 
  navigateToDetails, 
  isSearchTriggered 
}) {
  // Busca automática ao montar, se não houver busca
  useEffect(() => {
    if (!isSearchTriggered && !searchQuery) {
      setCurrentPage('resultados', { preserveSearch: true });
    }
  }, [isSearchTriggered, searchQuery, setCurrentPage]);

  return (
    <ResultList
      setCurrentPage={setCurrentPage}
      searchQuery={searchQuery} // Query da última busca executada
      currentInputQuery={currentInputQuery} // Query atual do input
      advancedFilters={advancedFilters}
      navigateToDetails={navigateToDetails}
      isSearchTriggered={isSearchTriggered}
    />
  );
}