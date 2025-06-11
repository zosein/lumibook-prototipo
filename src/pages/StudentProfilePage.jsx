import StudentProfile from "../components/StudentProfile";
import UserReservationsPage from "./UserReservationsPage";
import LoanPage from './LoanPage';

export default function StudentProfilePage({ setCurrentPage, user, isLoggedIn, showReservationsOnly, currentPage }) {
  console.log('StudentProfilePage', { currentPage, isLoggedIn, user });
  // Proteção de rota: só renderiza se estiver logado
  if (!isLoggedIn || !user) {
    console.warn('Acesso não autorizado ao perfil - redirecionando para login');
    // Redirecionar para login de forma segura
    setTimeout(() => setCurrentPage('login'), 0);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    );
  }

  if (currentPage === 'reservas') {
    return <UserReservationsPage setCurrentPage={setCurrentPage} user={user} isLoggedIn={isLoggedIn} />;
  }

  if (currentPage === 'emprestimos') {
    return <LoanPage setCurrentPage={setCurrentPage} />;
  }

  // Formatar dados do usuário para o componente StudentProfile
  const userData = {
    name: user.nome || user.usuario || "USUÁRIO",
    avatar: user.avatar || null,
    email: user.email,
    papel: user.papel,
    matricula: user.tipoLogin === 'matricula' ? user.usuario : null,
    tipoLogin: user.tipoLogin,
    id: user.id || user._id || null // Corrigido: nunca papel!
  };

  return (
    <StudentProfile 
      user={userData}
      setCurrentPage={setCurrentPage}
      isLoggedIn={isLoggedIn}
      showReservations={false}
    />
  );
}