import ResultList from '../components/ResultList';

export default function SearchResultsPage({ 
  setCurrentPage, 
  searchQuery, 
  currentInputQuery, 
  advancedFilters, 
  navigateToDetails, 
  isSearchTriggered 
}) {
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