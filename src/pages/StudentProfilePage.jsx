import StudentProfile from "../components/StudentProfile";

export default function StudentProfilePage({ setCurrentPage, user, isLoggedIn }) {
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
  // Formatar dados do usuário para o componente StudentProfile
  const userData = {
    name: user.nome || user.usuario || "USUÁRIO",
    avatar: null, // Avatar será buscado dinamicamente pela API via UserService
    email: user.email,
    papel: user.papel,
    matricula: user.tipoLogin === 'matricula' ? user.usuario : null,
    tipoLogin: user.tipoLogin
  };

  return (
    <StudentProfile 
      user={userData}
      setCurrentPage={setCurrentPage}
      isLoggedIn={isLoggedIn}
    />
  );
}