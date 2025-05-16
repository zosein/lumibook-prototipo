import ResultList from '../components/ResultList';

export default function SearchResultsPage({ setCurrentPage, searchQuery, advancedFilters, navigateToDetails }) {
  return (
    <ResultList
      setCurrentPage={setCurrentPage}
      searchQuery={searchQuery}
      advancedFilters={advancedFilters}
      navigateToDetails={navigateToDetails}
    />
  );
}