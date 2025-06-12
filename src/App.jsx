import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import DetailsPage from './pages/DetailsPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import StudentProfilePage from './pages/StudentProfilePage';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import NavigationBar from './components/NavigationBar';
import AdminProfilePage from './pages/AdminProfilePage';
import DebugInfo from './components/DebugInfo';
import { getProfile } from './services/profileService';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function DetailsPageWrapper({ setCurrentPage, navigateToDetails }) {
  const { bookId } = useParams();
  return <DetailsPage setCurrentPage={setCurrentPage} bookId={bookId} navigateToDetails={navigateToDetails} />;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastSearchQuery, setLastSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [isSearchTriggered, setIsSearchTriggered] = useState(false);
  
  // Estados de autenticação
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  
  const [advancedFilters, setAdvancedFilters] = useState({
    materialType: 'Todos',
    publicationYear: 'Todos',
    language: 'Todos',
    availability: 'Todos'
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Função de navegação otimizada com useCallback para performance
  const handlePageChange = useCallback((page, options = {}) => {
    switch (page) {
      case 'home':
        navigate('/');
        break;
      case 'resultados':
        navigate('/resultados');
        break;
      case 'detalhes':
        break;
      case 'perfil':
        if (!isLoggedIn) {
          navigate('/login');
        } else if (user?.papel === 'admin') {
          navigate('/admin-perfil');
        } else {
          navigate('/perfil');
        }
        break;
      case 'admin-perfil':
        if (!isLoggedIn || user?.papel !== 'admin') {
          navigate('/login');
        } else {
          navigate('/admin-perfil');
        }
        break;
      case 'cadastro':
        navigate('/cadastro');
        break;
      case 'login':
        navigate('/login');
        break;
      case 'emprestimos':
        navigate('/emprestimos');
        break;
      case 'reservas':
        navigate('/reservas');
        break;
      default:
        navigate('/');
    }
    if (filterOpen) {
      setFilterOpen(false);
    }
    if (page !== 'resultados' && !options.preserveSearch) {
      setIsSearchTriggered(false);
      setLastSearchQuery('');
    }
    setCurrentPage(page);
  }, [filterOpen, isLoggedIn, user?.papel, navigate]);
  
  const handleSearch = useCallback(() => {
    setLastSearchQuery(searchQuery);
    setIsSearchTriggered(true);
    setCurrentPage('resultados');
  }, [searchQuery]);
  
  const navigateToDetails = useCallback((bookId) => {
    if (!bookId) {
      alert('ID do livro inválido!');
      return;
    }
    navigate(`/detalhes/${bookId}`);
  }, [navigate]);

  // Persistência de login
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
      // Atualiza dados do usuário com a API (opcional, mas recomendado)
      getProfile(token)
        .then((userDataApi) => {
          setIsLoggedIn(true);
          setUser(userDataApi);
          localStorage.setItem('userData', JSON.stringify(userDataApi));
        })
        .catch(() => {
          // Token inválido ou expirado: faz logout
          setIsLoggedIn(false);
          setUser(null);
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          // Opcional: mostrar toast de sessão expirada
        });
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  // Salvar usuário no localStorage ao logar
  const handleLogin = useCallback((userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    localStorage.setItem('authToken', userData.token); // <-- Garante que o token é salvo
    localStorage.setItem('userData', JSON.stringify(userData));
    if (userData.papel === 'admin') {
      navigate('/admin-perfil');
    } else {
      navigate('/perfil');
    }
  }, [navigate]);

  // Limpar usuário do localStorage ao deslogar
  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setUser(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    setCurrentPage('home');
  }, []);

  const handleRegisterSuccess = useCallback(() => {
    setCurrentPage('login');
  }, []);

  // Verificar se deve mostrar Header, SearchBar e NavigationBar
  const hideLayoutRoutes = ['/login', '/cadastro', '/perfil', '/admin-perfil'];
  const showHeaderAndComponents = !hideLayoutRoutes.includes(location.pathname);

  useEffect(() => {
    // Verifica se há filtro de categoria salvo ao navegar para resultados
    if (currentPage === 'resultados') {
      const filtroCategoria = localStorage.getItem('lumibook_categoria_filtro');
      if (filtroCategoria) {
        setAdvancedFilters((prev) => ({
          ...prev,
          materialType: filtroCategoria,
        }));
        setLastSearchQuery(''); // Limpa busca textual
        setIsSearchTriggered(true); // Dispara busca
        localStorage.removeItem('lumibook_categoria_filtro');
      }
    }
  }, [currentPage]);

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      {/* DEBUG: Informações de debug */}
      <DebugInfo isLoggedIn={isLoggedIn} user={user} currentPage={currentPage} />
      
      {showHeaderAndComponents && (
        <div className="animate-in slide-in-from-top duration-300">
          <Header 
            setCurrentPage={handlePageChange} 
            isLoggedIn={isLoggedIn}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      )}
      {showHeaderAndComponents && (
        <div className="animate-in slide-in-from-top duration-300 delay-100">
          <SearchBar 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery}
            filterOpen={filterOpen}
            setFilterOpen={setFilterOpen}
            advancedFilters={advancedFilters}
            setAdvancedFilters={setAdvancedFilters}
            handleSearch={handleSearch}
          />
        </div>
      )}
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={
            <HomePage 
              setCurrentPage={handlePageChange} 
              navigateToDetails={navigateToDetails} 
            />
          } />
          <Route path="/resultados" element={
            <SearchResultsPage
              setCurrentPage={handlePageChange}
              searchQuery={lastSearchQuery}
              currentInputQuery={searchQuery}
              advancedFilters={advancedFilters}
              navigateToDetails={navigateToDetails}
              isSearchTriggered={isSearchTriggered}
            />
          } />
          <Route path="/detalhes/:bookId" element={<DetailsPageWrapper setCurrentPage={handlePageChange} navigateToDetails={navigateToDetails} />} />
          <Route path="/cadastro" element={<RegisterPage setCurrentPage={handlePageChange} onRegisterSuccess={handleRegisterSuccess} />} />
          <Route path="/login" element={<LoginPage setCurrentPage={handlePageChange} onLogin={handleLogin} />} />
          <Route path="/perfil" element={<StudentProfilePage setCurrentPage={handlePageChange} user={user} isLoggedIn={isLoggedIn} />} />
          <Route path="/admin-perfil" element={<AdminProfilePage setCurrentPage={handlePageChange} user={user} isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
          <Route path="/reservas" element={
            <StudentProfilePage setCurrentPage={handlePageChange} user={user} isLoggedIn={isLoggedIn} currentPage="reservas" />
          } />
          <Route path="/emprestimos" element={
            <StudentProfilePage setCurrentPage={handlePageChange} user={user} isLoggedIn={isLoggedIn} currentPage="emprestimos" />
          } />
          <Route path="/books/:bookId" element={<DetailsPageWrapper setCurrentPage={handlePageChange} navigateToDetails={navigateToDetails} />} />
        </Routes>
      </div>
      {showHeaderAndComponents && (
        <div className="animate-in slide-in-from-bottom duration-300">
          <NavigationBar 
            currentPage={currentPage} 
            setCurrentPage={handlePageChange}
            isLoggedIn={isLoggedIn}
          />
        </div>
      )}
    </div>
  );
}   