import BookDetails from '../components/BookDetails';

export default function DetailsPage({ setCurrentPage, bookId, navigateToDetails }) {
  return (
    <BookDetails 
      setCurrentPage={setCurrentPage} 
      bookId={bookId}
      navigateToDetails={navigateToDetails}
    />
  );
}