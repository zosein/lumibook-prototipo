import BookDetails from '../components/BookDetails';

export default function DetailsPage({ setCurrentPage, bookId }) {
  return (
    <BookDetails 
      setCurrentPage={setCurrentPage} 
      bookId={bookId}
    />
  );
}