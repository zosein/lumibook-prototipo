import { useState, useEffect } from 'react';
import { Book, Home, BookOpen, Undo2, CoinsIcon, Search, ArrowLeft, AlertTriangle, Users } from 'lucide-react';

// Hook personalizado para buscar estatísticas da API
const useUserStats = (user, isLoggedIn) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!isLoggedIn || !user) {
        setStats(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Preparar endpoint baseado no tipo de usuário
        const endpoint = user.papel === 'professor' 
          ? `/api/professores/${user.id}/estatisticas`
          : `/api/alunos/${user.id}/estatisticas`;

        // Headers com autenticação
        const headers = {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        };

        // SIMULAÇÃO da chamada API - substituir por fetch real
        console.log(`[API CALL] GET ${endpoint}`, { headers, userId: user.id, userType: user.papel });
        
        // Simular delay da rede
        await new Promise(resolve => setTimeout(resolve, 800));

        // Dados mockados baseados no tipo de usuário
        const mockApiResponse = user.papel === 'professor' 
          ? getMockProfessorStats(user.id)
          : getMockAlunoStats(user.id);

        // Simular possível erro da API (5% de chance)
        if (Math.random() < 0.05) {
          throw new Error('Falha na conexão com o servidor');
        }

        setStats(mockApiResponse);

      } catch (err) {
        console.error('Erro ao buscar estatísticas do usuário:', err);
        setError(err.message || 'Erro ao carregar estatísticas');
        
        // Fallback para dados offline/cache
        setStats(getOfflineStats(user.papel));
        
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user, user?.id, user?.papel, isLoggedIn]);

  return { stats, loading, error };
};

// Função para gerar estatísticas mock de ALUNO com regras de negócio
const getMockAlunoStats = (userId) => {
  const limiteConcorrente = 3; // Limite de livros simultâneos para aluno
  const livrosEmprestados = Math.floor(Math.random() * 3); // 0-2 empréstimos atuais
  const livrosDisponiveis = limiteConcorrente - livrosEmprestados; // CÁLCULO CORRETO

  return {
    // Estatísticas específicas para ALUNOS
    livrosEmprestados,
    livrosDisponiveis, // Quantos ainda pode emprestar
    limiteConcorrente,
    devolucoesPendentes: Math.floor(Math.random() * 2), // 0-1 devoluções pendentes
    multasPendentes: Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0, // 30% chance de multa
    reservasAtivas: Math.floor(Math.random() * 2), // 0-1 reservas
    historicoEmprestimos: Math.floor(Math.random() * 20) + 5, // 5-25 empréstimos históricos
    pontosUsuario: Math.floor(Math.random() * 100), // Sistema de pontuação
    
    // Metadados da consulta
    ultimaAtualizacao: new Date().toISOString(),
    fonte: 'api',
    tipoUsuario: 'aluno'
  };
};

// Função para gerar estatísticas mock de PROFESSOR com regras de negócio
const getMockProfessorStats = (userId) => {
  const limiteConcorrente = 10; // Limite de livros simultâneos para professor
  const livrosEmprestados = Math.floor(Math.random() * 8); // 0-7 empréstimos atuais
  const livrosDisponiveis = limiteConcorrente - livrosEmprestados; // CÁLCULO CORRETO

  return {
    // Estatísticas específicas para PROFESSORES
    livrosEmprestados,
    livrosDisponiveis, // Quantos ainda pode emprestar
    limiteConcorrente,
    devolucoesPendentes: Math.floor(Math.random() * 3), // 0-2 devoluções pendentes
    multasPendentes: 0, // Professores geralmente isentos de multa
    reservasAtivas: Math.floor(Math.random() * 5), // 0-4 reservas
    historicoEmprestimos: Math.floor(Math.random() * 50) + 20, // 20-70 empréstimos históricos
    livrosSolicitados: Math.floor(Math.random() * 3), // Solicitações de compra
    
    // Funcionalidades específicas de professor
    turmasAtivas: Math.floor(Math.random() * 4) + 1, // 1-4 turmas
    bibliografiasGerenciadas: Math.floor(Math.random() * 6) + 2, // 2-8 bibliografias
    
    // Metadados da consulta
    ultimaAtualizacao: new Date().toISOString(),
    fonte: 'api',
    tipoUsuario: 'professor'
  };
};

// Dados de fallback para modo offline
const getOfflineStats = (papel) => {
  const limiteConcorrente = papel === 'professor' ? 10 : 3;
  
  return {
    livrosEmprestados: 0,
    livrosDisponiveis: limiteConcorrente, // Limite completo quando offline
    limiteConcorrente,
    devolucoesPendentes: 0,
    multasPendentes: 0,
    reservasAtivas: 0,
    ultimaAtualizacao: null,
    fonte: 'offline',
    tipoUsuario: papel
  };
};

export default function StudentProfile({ 
  user = {
    name: "ALUNO",
    avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
  }, 
  setCurrentPage,
  isLoggedIn 
}) {
  // Hook para buscar estatísticas da API
  const { stats, loading, error } = useUserStats(user, isLoggedIn);

  // Validação de segurança: só renderiza se estiver logado
  if (!isLoggedIn || !user) {
    console.warn('StudentProfile renderizado sem usuário logado - redirecionando...');
    setTimeout(() => setCurrentPage('login'), 0);
    return null;
  }

  // Função para navegar mantendo o estado da pesquisa
  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  // Função para recarregar estatísticas
  const handleRefreshStats = () => {
    // Força re-fetch das estatísticas
    window.location.reload(); // Temporary - no futuro, usar um estado de refresh
  };

  return (
    <div className="min-h-screen flex flex-col bg-white animate-in fade-in duration-300">
      {/* Header */}
      <header className="w-full bg-blue-600 flex items-center justify-between px-8 py-3 shadow-lg">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleNavigation('home')}
            className="flex items-center gap-2 text-white hover:text-blue-200 transition-all duration-200 p-2 rounded-lg hover:bg-blue-500 active:scale-95"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline font-medium">Voltar</span>
          </button>
          
          <span className="font-bold text-xl text-white tracking-widest flex items-center">
            LUMIBOOK
            <Book size={24} className="ml-2 text-yellow-400" aria-hidden="true" />
          </span>
        </div>
        <div className="flex items-center gap-3">
          <img 
            src={user.avatar} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full border-2 border-white"
          />
          <span className="font-medium text-white">{user.name}</span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden sm:flex flex-col bg-blue-700 w-64 px-6 py-5 text-white shadow-lg">
          <div className="mb-6">
            <span className="text-2xl font-bold">
              {user.papel === 'professor' ? 'PROFESSOR' : 'ESTUDANTE'}
            </span>
            <div className="text-xs text-blue-200 mt-1 flex items-center gap-1">
              <div className="w-1 h-1 bg-green-400 rounded-full"></div>
              Online
            </div>
          </div>
          <div className="flex flex-col items-center mb-6">
            <img 
              src={user.avatar} 
              alt="Avatar do usuário" 
              className="w-16 h-16 rounded-full border-2 border-white"
            />
            <span className="mt-3 text-sm">Bem-vindo(a)</span>
            <span className="font-semibold">{user.name}</span>
            {user.matricula && (
              <span className="text-xs text-blue-200 mt-1">Mat: {user.matricula}</span>
            )}
            {user.email && (
              <span className="text-xs text-blue-200 mt-1">{user.email}</span>
            )}
          </div>
          <nav className="flex flex-col gap-2 mt-6">
            <span className="text-xs mb-1 text-blue-200">BIBLIOTECA</span>
            <NavItem icon={Home} label="Início" onClick={() => handleNavigation('home')} />
            <NavItem icon={Search} label="Pesquisar" onClick={() => handleNavigation('resultados')} />
            <NavItem icon={BookOpen} label="Empréstimos" onClick={() => handleNavigation('reservas')} />
          </nav>
        </aside>

        {/* Conteúdo Principal - REMOVIDO A BARRA DE PESQUISA */}
        <main className="flex-1 p-4 sm:p-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            {/* Cabeçalho da página */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
              <p className="text-gray-600">
                {user.papel === 'professor' 
                  ? 'Gerencie seus empréstimos e acompanhe suas atividades na biblioteca'
                  : 'Acompanhe seus empréstimos, reservas e histórico de leitura'
                }
              </p>
            </div>

            {/* Estatísticas do usuário - REMOVIDO O CONTAINER DA BARRA DE PESQUISA */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Suas Estatísticas</h2>
                {stats && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {stats.fonte === 'offline' && (
                      <div className="flex items-center gap-1 text-amber-600">
                        <AlertTriangle size={14} />
                        <span>Dados offline</span>
                      </div>
                    )}
                    {stats.ultimaAtualizacao && (
                      <span>
                        Atualizado: {new Date(stats.ultimaAtualizacao).toLocaleTimeString()}
                      </span>
                    )}
                    <button
                      onClick={handleRefreshStats}
                      className="text-blue-600 hover:text-blue-700 ml-2"
                    >
                      Atualizar
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <StatsLoadingGrid />
              ) : error && !stats ? (
                <StatsErrorState error={error} onRetry={handleRefreshStats} />
              ) : (
                <StatsGrid stats={stats} userType={user.papel} />
              )}
            </div>

            {/* Ações rápidas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <QuickAction
                icon={<Search size={24} />}
                title="Pesquisar Livros"
                description="Encontre livros no acervo"
                onClick={() => handleNavigation('resultados')}
              />
              <QuickAction
                icon={<BookOpen size={24} />}
                title="Meus Empréstimos"
                description="Veja suas obras emprestadas"
                onClick={() => handleNavigation('reservas')}
              />
              <QuickAction
                icon={<Undo2 size={24} />}
                title="Renovar Empréstimos"
                description="Renove o prazo das suas obras"
                onClick={() => {/* TODO: Implementar página de renovação */}}
              />
            </div>

            {/* Informações do perfil */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Informações do Perfil
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <InfoCard label="Nome completo" value={user.name} />
                <InfoCard label="Email" value={user.email} />
                {user.matricula && (
                  <InfoCard label="Matrícula" value={user.matricula} />
                )}
                <InfoCard 
                  label="Tipo de usuário" 
                  value={user.papel === 'professor' ? 'Professor' : 'Estudante'} 
                  valueColor={user.papel === 'professor' ? 'text-purple-600 font-medium' : 'text-blue-600 font-medium'}
                />
                <InfoCard 
                  label="Status da conta" 
                  value="Ativa" 
                  valueColor="text-green-600 font-medium"
                />
                <InfoCard 
                  label="Membro desde" 
                  value="Janeiro 2024" 
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Componente para grid de estatísticas - ATUALIZADO com nova lógica
function StatsGrid({ stats, userType }) {
  if (!stats) return null;

  // Configuração de cards baseada no tipo de usuário
  const getStatsCards = () => {
    const baseCards = [
      {
        key: 'livrosDisponiveis',
        value: stats.livrosDisponiveis,
        label: 'Disponível para você',
        desc: `Você ainda pode emprestar ${stats.livrosDisponiveis} livro${stats.livrosDisponiveis !== 1 ? 's' : ''} (limite: ${stats.limiteConcorrente})`,
        icon: <Book size={32} />,
        color: stats.livrosDisponiveis > 0 ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200',
        iconColor: stats.livrosDisponiveis > 0 ? 'text-green-600' : 'text-orange-600'
      },
      {
        key: 'livrosEmprestados',
        value: stats.livrosEmprestados,
        label: 'Emprestados',
        desc: `Seus empréstimos ativos`,
        icon: <BookOpen size={32} />,
        color: 'bg-blue-50 border-blue-200',
        iconColor: 'text-blue-600'
      },
      {
        key: 'devolucoesPendentes',
        value: stats.devolucoesPendentes,
        label: 'Devoluções',
        desc: 'Pendências de devolução',
        icon: <Undo2 size={32} />,
        color: stats.devolucoesPendentes > 0 ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200',
        iconColor: stats.devolucoesPendentes > 0 ? 'text-yellow-600' : 'text-gray-600'
      }
    ];

    // Cards específicos por tipo de usuário
    if (userType === 'professor') {
      baseCards.push(
        {
          key: 'bibliografiasGerenciadas',
          value: stats.bibliografiasGerenciadas || 0,
          label: 'Bibliografias',
          desc: 'Listas gerenciadas por você',
          icon: <Users size={32} />,
          color: 'bg-purple-50 border-purple-200',
          iconColor: 'text-purple-600'
        }
      );
    } else {
      // Card de multas apenas para alunos
      baseCards.push(
        {
          key: 'multasPendentes',
          value: stats.multasPendentes,
          label: 'Multas',
          desc: 'Pendências financeiras',
          icon: <CoinsIcon size={32} />,
          color: stats.multasPendentes > 0 ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200',
          iconColor: stats.multasPendentes > 0 ? 'text-red-600' : 'text-gray-600'
        }
      );
    }

    return baseCards;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {getStatsCards().map((card) => (
        <StatCard key={card.key} {...card} />
      ))}
    </div>
  );
}

// Componente de loading para as estatísticas
function StatsLoadingGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="h-8 bg-gray-300 rounded w-12"></div>
            <div className="h-8 w-8 bg-gray-300 rounded"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
            <div className="h-3 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente de erro para as estatísticas
function StatsErrorState({ error, onRetry }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <div className="flex items-center justify-center gap-2 text-red-600 mb-2">
        <AlertTriangle size={24} />
        <h3 className="font-semibold">Erro ao carregar estatísticas</h3>
      </div>
      <p className="text-red-700 text-sm mb-4">{error}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  );
}

// Componentes auxiliares (NavItem, StatCard, InfoCard, QuickAction)
function NavItem({ icon: Icon, label, onClick }) {
  return (
    <button 
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm w-full text-left group active:scale-95"
      onClick={onClick}
    >
      <Icon size={18} className="text-blue-200 group-hover:text-white transition-colors duration-200" />
      <span className="group-hover:text-white transition-colors duration-200">{label}</span>
    </button>
  );
}

function StatCard({ value, label, desc, icon, color = "bg-gray-50 border-gray-200", iconColor = "text-gray-600" }) {
  return (
    <div className={`${color} border rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:scale-105 cursor-default`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl font-bold text-gray-900">{value}</span>
        <div className={`${iconColor}`}>{icon}</div>
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
        <p className="text-xs text-gray-600 mt-1">{desc}</p>
      </div>
    </div>
  );
}

function InfoCard({ label, value, valueColor = "text-gray-900" }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <span className="text-xs text-gray-600 uppercase tracking-wide">{label}</span>
      <p className={`font-medium mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}

function QuickAction({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all duration-200 group active:scale-95"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
          {icon}
        </div>
        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
          {title}
        </h3>
      </div>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}