import HomeContent from '../components/HomeContent';

export default function HomePage({ setCurrentPage, navigateToDetails }) {
  return (
    <HomeContent 
      setCurrentPage={setCurrentPage}
      navigateToDetails={navigateToDetails}
    />
  );
}