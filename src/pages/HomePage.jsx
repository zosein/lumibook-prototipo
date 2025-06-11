import HomeContent from '../components/HomeContent';
import StudentProfilePage from './StudentProfilePage';

export default function HomePage({ setCurrentPage, navigateToDetails, currentPage, user, isLoggedIn }) {
  return (
    <HomeContent 
      setCurrentPage={setCurrentPage}
      navigateToDetails={navigateToDetails}
    >
      {currentPage === 'perfil' || currentPage === 'reservas' || currentPage === 'emprestimos' ? (
        <StudentProfilePage
          setCurrentPage={setCurrentPage}
          user={user}
          isLoggedIn={isLoggedIn}
          showReservationsOnly={currentPage === 'reservas'}
          currentPage={currentPage}
        />
      ) : null}
    </HomeContent>
  );
}