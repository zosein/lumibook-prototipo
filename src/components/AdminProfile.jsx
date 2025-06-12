import { useState, useEffect } from "react";
import {
	Book,
	Home,
	Search,
	ArrowLeft,
	AlertTriangle,
	Users,
	Plus,
	Edit3,
	FileText,
	Settings,
	BarChart3,
	Shield,
	Database,
	Activity,
	CheckCircle,
	User,
	UserPlus,
	Loader2,
} from "lucide-react";
import { useCatalogacao } from "../hooks/useCatalogacao";
import { getProfile } from "../services/profileService";
import StatsService from '../services/StatsService';
import * as UserService from '../services/UserService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CatalogService from '../services/CatalogService';
import { GerenciarAcervoContent } from '../pages/AdminProfilePage';

// Hook personalizado para buscar estatísticas do admin
const useAdminStats = (user, isLoggedIn) => {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchAdminStats = async () => {
			if (!isLoggedIn || !user || user.papel !== "admin") {
				setStats(null);
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const response = await StatsService.getAdminDashboard();
				// Se a resposta vier com dados aninhados, desaninha para facilitar o uso no componente
				const apiData = response.data;
				if (apiData && apiData.dados) {
					setStats({ ...apiData.dados, sucesso: apiData.sucesso });
				} else {
					setStats(apiData);
				}
			} catch (err) {
				console.error("Erro ao buscar estatísticas do dashboard:", err);
				setError(err.message || "Erro ao carregar estatísticas");
				setStats(null);
			} finally {
				setLoading(false);
			}
		};

		fetchAdminStats();
	}, [user, user?.id, isLoggedIn]);

	return { stats, loading, error };
};

// Função utilitária para tema visual
function getProfileTheme(papel) {
	switch (papel) {
		case 'admin':
			return {
				color: 'red',
				bg: 'bg-gradient-to-r from-blue-800 to-red-700',
				avatarBorder: 'border-red-500',
				icon: <Shield size={32} />,
				frase: 'Administração total do sistema',
			};
		default:
			return {
				color: 'blue',
				bg: 'bg-gradient-to-r from-blue-600 to-blue-400',
				avatarBorder: 'border-blue-500',
				icon: <User size={32} />,
				frase: 'Bem-vindo ao seu espaço de aprendizado!',
			};
	}
}

// Função utilitária para limpar ISBN
function limparIsbn(isbn) {
	return isbn ? isbn.replace(/[-\s]/g, '') : '';
}

export default function AdminProfile({
	user = {
		nome: "ADMINISTRADOR",
		avatar: null, // Avatar será buscado da API
	},
	setCurrentPage,
	isLoggedIn,
	onLogout,
}) {
	const theme = getProfileTheme(user.papel);
	// Hooks devem estar no topo
	const { stats, loading, error } = useAdminStats(user, isLoggedIn);
	const [activeSection, setActiveSection] = useState("dashboard");

	// Validação de segurança: só renderiza se estiver logado como admin
	if (!isLoggedIn || !user || user.papel !== "admin") {
		console.warn(
			"AdminProfile renderizado sem usuário admin logado - redirecionando..."
		);
		setTimeout(() => setCurrentPage("login"), 0);
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

	// Função para renderizar conteúdo da seção ativa
	const renderActiveSection = () => {
		switch (activeSection) {
			case "dashboard":
				return (
					<DashboardSection
						stats={stats}
						loading={loading}
						error={error}
						onRefresh={handleRefreshStats}
						setActiveSection={setActiveSection}
						onCadastrar={() => {}}
						onExportar={() => {}}
						user={user}
					/>
				);
			case "catalogacao":
				return <CatalogacaoSection adminId={user.id} />;
			case "gerenciar":
				return <GerenciarAcervoContent />;
			case "usuarios":
				return <UsuariosSection />;
			case "relatorios":
				return <RelatoriosSection />;
			case "configuracoes":
				return <ConfiguracoesSection user={user} onLogout={onLogout} />;
			default:
				return (
					<DashboardSection
						stats={stats}
						loading={loading}
						error={error}
						onRefresh={handleRefreshStats}
						setActiveSection={setActiveSection}
						onCadastrar={() => {}}
						onExportar={() => {}}
						user={user}
					/>
				);
		}
	};

	return (
		<div className="min-h-screen flex flex-col bg-white animate-in fade-in duration-300">
			<header className={`w-full ${theme.bg} flex items-center justify-between px-8 py-4 shadow-lg rounded-b-2xl`}>
				<div className="flex items-center gap-4">
					<button
						onClick={() => handleNavigation("home")}
						className="flex items-center gap-2 text-white hover:text-blue-200 transition-all duration-200 p-2 rounded-lg hover:bg-blue-500 active:scale-95"
					>
						<ArrowLeft size={20} />
						<span className="hidden sm:inline font-medium">Voltar</span>
					</button>

					<span className="font-bold text-2xl text-white tracking-widest flex items-center drop-shadow">
						LUMIBOOK
						<Book size={28} className="ml-2 text-yellow-400" />
					</span>
				</div>
				<div className="flex items-center gap-4">
					<img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=3B82F6&color=fff&size=128`} alt="Avatar" className="w-12 h-12 rounded-full border-4" />
					<span className="font-semibold text-lg text-white drop-shadow">{user.nome}</span>
				</div>
			</header>

			<div className="flex flex-1">
				<aside className="hidden sm:flex flex-col bg-gradient-to-b from-blue-800 to-blue-700 w-72 px-8 py-8 text-white shadow-2xl rounded-r-3xl">
					<div className="flex flex-col items-center mb-10">
						<img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=3B82F6&color=fff&size=128`} alt="Avatar" className="w-20 h-20 rounded-full border-4" />
						<span className="mt-4 text-lg font-bold">{user.nome}</span>
						<span className="text-xs text-blue-200">{user.email}</span>
					</div>
					<nav className="flex flex-col gap-2 mt-6">
						<span className="text-xs mb-1 text-blue-200">ADMINISTRAÇÃO</span>
						<AdminNavItem
							icon={BarChart3}
							label="Dashboard"
							isActive={activeSection === "dashboard"}
							onClick={() => setActiveSection("dashboard")}
						/>
						<AdminNavItem
							icon={Plus}
							label="Catalogar"
							isActive={activeSection === "catalogacao"}
							onClick={() => setActiveSection("catalogacao")}
						/>
						<AdminNavItem
							icon={Edit3}
							label="Gerenciar Acervo"
							isActive={activeSection === "gerenciar"}
							onClick={() => setActiveSection("gerenciar")}
						/>
						<AdminNavItem
							icon={Users}
							label="Usuários"
							isActive={activeSection === "usuarios"}
							onClick={() => setActiveSection("usuarios")}
						/>
						<AdminNavItem
							icon={FileText}
							label="Relatórios"
							isActive={activeSection === "relatorios"}
							onClick={() => setActiveSection("relatorios")}
						/>
						<AdminNavItem
							icon={Settings}
							label="Configurações"
							isActive={activeSection === "configuracoes"}
							onClick={() => setActiveSection("configuracoes")}
						/>

						<div className="mt-4 pt-4 border-t border-blue-600">
							<span className="text-xs mb-1 text-blue-200">NAVEGAÇÃO</span>
							<AdminNavItem
								icon={Home}
								label="Início"
								onClick={() => handleNavigation("home")}
							/>
							<AdminNavItem
								icon={Search}
								label="Pesquisar"
								onClick={() => handleNavigation("resultados")}
							/>
						</div>
					</nav>
				</aside>

				<main className="flex-1 p-4 sm:p-8 bg-gray-50">
					<div className="max-w-6xl mx-auto">
						<div className="mb-6">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
							<p className="text-gray-600">{theme.frase}</p>
						</div>

						{/* Conteúdo da seção ativa - REMOVIDO O CONTAINER DA BARRA DE PESQUISA */}
						{/* {podeGerenciarLivros && (
							<div className="flex gap-4 mb-4">
								<button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={() => setCurrentPage('catalogar')}>Catalogar Livro</button>
								<button className="bg-purple-600 text-white px-4 py-2 rounded-lg" onClick={() => setCurrentPage('gerenciarAcervo')}>Gerenciar Acervo</button>
							</div>
						)} */}

						{renderActiveSection()}
					</div>
				</main>
			</div>
			<ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
		</div>
	);
}

// Componente de navegação específico para admin
function AdminNavItem({ icon: Icon, label, onClick, isActive = false }) {
	return (
		<button
			className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm w-full text-left group active:scale-95 ${
				isActive
					? "bg-blue-600 text-white shadow-sm"
					: "hover:bg-blue-600 text-blue-100 hover:text-white"
			}`}
			onClick={onClick}
		>
			<Icon
				size={18}
				className={`transition-colors duration-200 ${
					isActive ? "text-white" : "text-blue-200 group-hover:text-white"
				}`}
			/>
			<span
				className={`transition-colors duration-200 ${
					isActive ? "text-white font-medium" : "group-hover:text-white"
				}`}
			>
				{label}
			</span>
		</button>
	);
}

// Seção Dashboard
function DashboardSection({
	stats,
	loading,
	error,
	onRefresh,
	setActiveSection,
	onCadastrar,
	onExportar,
	user
}) {
	const [activities, setActivities] = useState([]);
	const [activitiesLoading, setActivitiesLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [dashboardStats, setDashboardStats] = useState(stats);

	// Atualiza dashboardStats quando stats muda externamente (ex: login)
	useEffect(() => {
		setDashboardStats(stats);
	}, [stats]);

	const handleDashboardRefresh = async () => {
		setRefreshing(true);
		try {
			const response = await StatsService.getAdminDashboard();
			const apiData = response.data;
			if (apiData && apiData.dados) {
				setDashboardStats({ ...apiData.dados, sucesso: apiData.sucesso });
			} else {
				setDashboardStats(apiData);
			}
			toast.success('Dashboard atualizado com sucesso!');
		} catch (err) {
			toast.error('Erro ao atualizar informações do dashboard.');
		} finally {
			setRefreshing(false);
		}
	};

	useEffect(() => {
		if (dashboardStats && dashboardStats.recentActivities) {
			setActivities(dashboardStats.recentActivities);
			setActivitiesLoading(false);
			return;
		}
		setActivitiesLoading(false);
	}, [dashboardStats]);

	return (
		<section className="space-y-8">
			{/* Header do dashboard com botão de atualizar */}
			<div className="border-b border-gray-100 pb-4 flex items-center gap-3">
				<div className="p-2 bg-blue-100 rounded-lg">
					<BarChart3 size={24} className="text-blue-600" />
				</div>
				<div className="flex-1">
					<h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
						Dashboard
						<button
							onClick={handleDashboardRefresh}
							disabled={refreshing}
							className={`ml-2 px-2 py-1 rounded text-xs border border-blue-200 bg-white hover:bg-blue-50 transition-colors flex items-center gap-1 ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
							title="Atualizar informações do dashboard"
						>
							{refreshing ? <Loader2 size={16} className="animate-spin" /> : null}
							{refreshing ? 'Atualizando...' : 'Atualizar'}
						</button>
					</h2>
					<p className="text-gray-600">Visão geral do sistema bibliotecário</p>
				</div>
			</div>

			{/* Estatísticas principais */}
			<div className="mb-8">
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					<div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center">
						<span className="text-2xl font-bold text-blue-700">{dashboardStats?.totalUsuarios ?? '-'}</span>
						<span className="text-sm text-gray-600 mt-1">Total de Usuários</span>
					</div>
					<div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center">
						<span className="text-2xl font-bold text-green-700">{dashboardStats?.totalLivros ?? '-'}</span>
						<span className="text-sm text-gray-600 mt-1">Total de Livros</span>
					</div>
					<div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center">
						<span className="text-2xl font-bold text-orange-700">{dashboardStats?.totalEmprestimos ?? '-'}</span>
						<span className="text-sm text-gray-600 mt-1">Total de Empréstimos</span>
					</div>
					<div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center">
						<span className="text-2xl font-bold text-purple-700">{dashboardStats?.totalReservas ?? '-'}</span>
						<span className="text-sm text-gray-600 mt-1">Total de Reservas</span>
					</div>
				</div>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
					<div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center">
						<span className="text-2xl font-bold text-red-700">{dashboardStats?.totalMultas ?? '-'}</span>
						<span className="text-sm text-gray-600 mt-1">Total de Multas</span>
					</div>
					<div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center">
						<span className="text-2xl font-bold text-blue-700">{dashboardStats?.emprestimosAbertos ?? '-'}</span>
						<span className="text-sm text-gray-600 mt-1">Empréstimos Abertos</span>
					</div>
					<div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center">
						<span className="text-2xl font-bold text-orange-700">{dashboardStats?.reservasPendentes ?? '-'}</span>
						<span className="text-sm text-gray-600 mt-1">Reservas Pendentes</span>
					</div>
					<div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center">
						<span className="text-2xl font-bold text-red-700">{dashboardStats?.multasPendentes ?? '-'}</span>
						<span className="text-sm text-gray-600 mt-1">Multas Pendentes</span>
					</div>
				</div>
				{loading && <div className="text-center py-4">Carregando estatísticas...</div>}
				{error && !dashboardStats && (
					<div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
						<div className="flex items-center justify-center gap-2 text-red-600 mb-2">
							<AlertTriangle size={24} />
							<h3 className="font-semibold">Erro ao carregar estatísticas</h3>
						</div>
						<p className="text-red-700 text-sm mb-4">{error}</p>
						<button onClick={onRefresh} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">Tentar novamente</button>
					</div>
				)}
			</div>

			{/* Atividades recentes */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<Activity size={20} className="text-blue-600" />
					Atividades Recentes
				</h3>
				{activitiesLoading ? (
					<div>Carregando atividades...</div>
				) : activities && activities.length > 0 ? (
					<ul className="divide-y divide-gray-100">
						{activities.map((act, idx) => (
							<li key={idx} className="py-2 text-sm text-gray-700">
								<span className="font-medium">{act.acao || act.action}</span> - {act.dataHora || act.timestamp}
								{act.usuario && (
									<span className="ml-2 text-gray-500">por {act.usuario}</span>
								)}
								{act.detalhes && (
									<span className="ml-2 text-gray-400">({act.detalhes})</span>
								)}
							</li>
						))}
					</ul>
				) : (
					<div className="text-gray-500">Nenhuma atividade recente encontrada.</div>
				)}
			</div>

			{/* Ações rápidas */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
				<button onClick={() => setActiveSection("catalogacao")}
					className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all duration-200 group active:scale-95">
					<div className="flex items-center gap-3 mb-2">
						<Plus size={24} className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
						<h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Catalogar Obra</h3>
					</div>
					<p className="text-sm text-gray-600">Adicionar novos livros ao acervo</p>
				</button>
				<button onClick={() => setActiveSection("usuarios")}
					className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all duration-200 group active:scale-95">
					<div className="flex items-center gap-3 mb-2">
						<Users size={24} className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
						<h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Gerenciar Usuários</h3>
					</div>
					<p className="text-sm text-gray-600">Visualizar e gerenciar usuários</p>
				</button>
				<button onClick={() => setActiveSection("relatorios")}
					className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all duration-200 group active:scale-95">
					<div className="flex items-center gap-3 mb-2">
						<FileText size={24} className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
						<h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Relatórios</h3>
					</div>
					<p className="text-sm text-gray-600">Gerar relatórios e estatísticas</p>
				</button>
				{user.papel === 'admin' && (
					<button onClick={onCadastrar}
						className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all duration-200 group active:scale-95">
						<div className="flex items-center gap-3 mb-2">
							<UserPlus size={24} className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
							<h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Cadastrar Bibliotecário</h3>
						</div>
						<p className="text-sm text-gray-600">Adicionar novo bibliotecário</p>
					</button>
				)}
				{user.papel === 'admin' && (
					<button onClick={onExportar}
						className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all duration-200 group active:scale-95">
						<div className="flex items-center gap-3 mb-2">
							<FileText size={24} className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
							<h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Exportar Log de Req/Res</h3>
						</div>
						<p className="text-sm text-gray-600">Baixar log de requisições</p>
					</button>
				)}
			</div>
		</section>
	);
}

// Seções placeholder (implementar conforme necessidade)
function CatalogacaoSection({ adminId }) {
	const {
		formData,
		loading,
		submitting,
		errors,
		success,
		tiposObra,
		categorias,
		sugestaoEditoras,
		verificandoDuplicata,
		updateField,
		buscarEditoras,
		verificarDuplicata,
		preencherPorISBN,
		submitForm,
		limparFormulario,
		capaUrl,
		sugestaoAutores,
		buscarAutores,
	} = useCatalogacao(adminId);

	// Estados locais para sugestões de autocomplete
	const [showSugestoesAutor, setShowSugestoesAutor] = useState(false);
	const [showSugestoesEditora, setShowSugestoesEditora] = useState(false);

	// Estados locais para UI
	const [isbnTimer, setIsbnTimer] = useState(null);
	const [showSugestoesCategoria, setShowSugestoesCategoria] = useState(false);
	const [showSugestoesLocalizacao, setShowSugestoesLocalizacao] = useState(false);
	const localizacoesPadrao = [
		"Estante A, Prateleira 1",
		"Estante A, Prateleira 2",
		"Estante A, Prateleira 3",
		"Estante B, Prateleira 1",
		"Estante B, Prateleira 2",
		"Estante B, Prateleira 3",
		"Estante C, Prateleira 1",
		"Estante C, Prateleira 2",
		"Estante C, Prateleira 3",
		"Estante D, Prateleira 1",
		"Estante D, Prateleira 2",
		"Estante D, Prateleira 3",
		"Sala de Leitura",
		"Sala de Estudos",
		"Acervo Infantil",
		"Acervo Geral",
		"Depósito",
		"Recepção",
		"Mesa de Consulta",
		"Arquivo Morto",
		"Sala dos Professores",
		"Auditório",
		"Corredor Central",
		"Prateleira Especial",
		"Estante de Referência"
	];

	// Estados para autocomplete e cadastro rápido de autor/editora
	const [showModalAutor, setShowModalAutor] = useState(false);
	const [showModalEditora, setShowModalEditora] = useState(false);
	const [novoAutorNome, setNovoAutorNome] = useState('');
	const [novoEditoraNome, setNovoEditoraNome] = useState('');
	const [loadingNovoAutor, setLoadingNovoAutor] = useState(false);
	const [loadingNovaEditora, setLoadingNovaEditora] = useState(false);
	const [erroNovoAutor, setErroNovoAutor] = useState('');
	const [erroNovaEditora, setErroNovaEditora] = useState('');

	// Debounce para busca de ISBN
	const handleISBNChange = (value) => {
		updateField("isbn", value);

		// Limpar timer anterior
		if (isbnTimer) {
			clearTimeout(isbnTimer);
		}

		// Configurar novo timer para busca automática
		const newTimer = setTimeout(() => {
			if (value && value.length >= 10) {
				preencherPorISBN(value);
				verificarDuplicata(value, formData.titulo);
			}
		}, 1000);

		setIsbnTimer(newTimer);
	};

	// Submissão do formulário
	const handleSubmit = async (e) => {
		e.preventDefault();
		console.log('Formulário de catalogação: submit disparado');
		const token = localStorage.getItem('authToken');
		const resultado = await submitForm(token);

		if (resultado.success) {
			console.log("Obra catalogada com sucesso:", resultado.data);
		}
	};

	// Cleanup do timer
	useEffect(() => {
		return () => {
			if (isbnTimer) {
				clearTimeout(isbnTimer);
			}
		};
	}, [isbnTimer]);

	if (loading) {
		return (
			<div className="p-6 space-y-6">
				<div className="border-b border-gray-100 pb-4">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-green-100 rounded-lg">
							<Plus size={24} className="text-green-600" />
						</div>
						<div>
							<h2 className="text-2xl font-bold text-gray-900">
								Catalogar Nova Obra
							</h2>
							<p className="text-gray-600">Carregando dados...</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
					<p className="text-gray-600">
						Carregando formulário de catalogação...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			{/* Header da seção */}
			<div className="border-b border-gray-100 pb-4">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-green-100 rounded-lg">
						<Plus size={24} className="text-green-600" />
					</div>
					<div>
						<h2 className="text-2xl font-bold text-gray-900">
							Catalogar Nova Obra
						</h2>
						<p className="text-gray-600">Adicione novas obras ao acervo da biblioteca</p>
					</div>
				</div>
			</div>

			{/* Mensagens de feedback */}
			{errors.geral && (
				<div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-2">
					<AlertTriangle size={20} />
					<span>{
						typeof errors.geral === 'string' && errors.geral.match(/duplicate key|E11000|stack|index|collection|Mongo/gi)
							? 'Erro ao realizar operação. Tente novamente.'
							: errors.geral
					}</span>
				</div>
			)}

			{errors.duplicata && (
				<div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl flex items-center gap-2">
					<AlertTriangle size={20} />
					<span>{errors.duplicata}</span>
				</div>
			)}

			{success && (
				<div className="bg-green-50 border border-green-200 text-green-600 p-4 rounded-xl flex items-center gap-2">
					<CheckCircle size={20} />
					<span>{success}</span>
				</div>
			)}

			{/* Layout do formulário + capa */}
			<div className="flex flex-col lg:flex-row gap-8 items-start">
				<div className="flex-1 w-full">
					{/* Formulário principal */}
					<div className="bg-white rounded-xl border border-gray-100 shadow-sm">
						<form onSubmit={handleSubmit} className="p-6 space-y-6">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
								{/* Título */}
								<div className="lg:col-span-2">
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Título da Obra <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={formData.titulo}
										onChange={(e) => updateField("titulo", e.target.value)}
										onBlur={() =>
											verificarDuplicata(formData.isbn, formData.titulo)
										}
										className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
											errors.titulo
												? "border-red-300 focus:border-red-500"
												: "border-gray-200 focus:border-green-500"
										}`}
										placeholder="Digite o título completo da obra"
									/>
									{errors.titulo && (
										<p className="text-red-500 text-sm mt-1">{errors.titulo}</p>
									)}
								</div>

								{/* Autor com autocomplete */}
								<div className="relative">
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Autor <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={formData.autorLabel || ''}
										onChange={async (e) => {
											updateField("autorLabel", e.target.value);
											await buscarAutores(e.target.value);
											setShowSugestoesAutor(true);
										}}
										onFocus={() => setShowSugestoesAutor(true)}
										onBlur={() => setTimeout(() => setShowSugestoesAutor(false), 200)}
										className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
											errors.autor ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
										}`}
										placeholder="Nome completo do autor"
										autoComplete="off"
									/>
									{showSugestoesAutor && sugestaoAutores.length > 0 && (
										<div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
											{sugestaoAutores.map((autor, idx) => (
												<button
													key={autor.value}
													type="button"
													onClick={() => {
														updateField("autor", "");
														updateField("autorLabel", autor.label);
														setShowSugestoesAutor(false);
													}}
													className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
												>
													{autor.label}
												</button>
											))}
										</div>
									)}
									{errors.autor && <p className="text-red-500 text-sm mt-1">{errors.autor}</p>}
								</div>

								{/* ISBN com busca automática */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										ISBN
										{verificandoDuplicata && (
											<span className="ml-2 text-blue-600 text-xs">
												Verificando...
											</span>
										)}
									</label>
									<input
										type="text"
										value={formData.isbn}
										onChange={(e) => handleISBNChange(e.target.value)}
										className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
											errors.isbn
												? "border-red-300 focus:border-red-500"
												: "border-gray-200 focus:border-green-500"
										}`}
										placeholder="978-XX-XXXX-XXX-X"
									/>
									{errors.isbn && (
										<p className="text-red-500 text-sm mt-1">{errors.isbn}</p>
									)}
									<p className="text-xs text-gray-500 mt-1">
										Dados serão preenchidos automaticamente se o ISBN for encontrado
									</p>
								</div>

								{/* Tipo de Obra */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Tipo de Obra <span className="text-red-500">*</span>
									</label>
									<select
										value={formData.tipo}
										onChange={(e) => updateField("tipo", e.target.value)}
										className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
											errors.tipo
												? "border-red-300 focus:border-red-500"
												: "border-gray-200 focus:border-green-500"
										}`}
									>
										<option value="">Selecione o tipo</option>
										{Array.isArray(tiposObra) && tiposObra.map((tipo) => (
											<option key={tipo} value={tipo}>
												{tipo}
											</option>
										))}
									</select>
									{errors.tipo && (
										<p className="text-red-500 text-sm mt-1">{errors.tipo}</p>
									)}
								</div>

								{/* Categoria */}
								<div className="relative">
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Categoria <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={formData.categoria}
										onChange={e => {
											updateField("categoria", e.target.value);
										}}
										onFocus={() => setShowSugestoesCategoria(true)}
										onBlur={() => setTimeout(() => setShowSugestoesCategoria(false), 200)}
										className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
											errors.categoria
												? "border-red-300 focus:border-red-500"
												: "border-gray-200 focus:border-green-500"
										}`}
										placeholder="Digite ou selecione a categoria"
										autoComplete="off"
									/>
									{/* Sugestões de categorias */}
									{showSugestoesCategoria && Array.isArray(categorias) && categorias.length > 0 && (
										<div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
											{(formData.categoria
												? categorias.filter(cat => cat.toLowerCase().includes(formData.categoria.toLowerCase()))
												: categorias
											).slice(0, 20).map((cat, idx) => (
												<button
													key={idx}
													type="button"
													onClick={() => {
														updateField("categoria", cat);
														setShowSugestoesCategoria(false);
													}}
													className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
												>
													{cat}
												</button>
											))}
										</div>
									)}
									{errors.categoria && (
										<p className="text-red-500 text-sm mt-1">{errors.categoria}</p>
									)}
								</div>

								{/* Ano de Publicação */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Ano de Publicação <span className="text-red-500">*</span>
									</label>
									<input
										type="number"
										min="1450"
										max={new Date().getFullYear() + 1}
										value={formData.ano}
										onChange={(e) => updateField("ano", e.target.value)}
										className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
											errors.ano
												? "border-red-300 focus:border-red-500"
												: "border-gray-200 focus:border-green-500"
										}`}
										placeholder={new Date().getFullYear()}
									/>
									{errors.ano && (
										<p className="text-red-500 text-sm mt-1">{errors.ano}</p>
									)}
								</div>

								{/* Editora com autocomplete */}
								<div className="relative">
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Editora
									</label>
									<input
										type="text"
										value={formData.editoraLabel || ''}
										onChange={async (e) => {
											updateField("editoraLabel", e.target.value);
											await buscarEditoras(e.target.value);
											setShowSugestoesEditora(true);
										}}
										onFocus={() => setShowSugestoesEditora(true)}
										onBlur={() => setTimeout(() => setShowSugestoesEditora(false), 200)}
										className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
											errors.editora ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-green-500"
										}`}
										placeholder="Nome da editora"
										autoComplete="off"
									/>
									{showSugestoesEditora && sugestaoEditoras.length > 0 && (
										<div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
											{sugestaoEditoras.map((editora, idx) => (
												<button
													key={editora.value}
													type="button"
													onClick={() => {
														updateField("editora", "");
														updateField("editoraLabel", editora.label);
														setShowSugestoesEditora(false);
													}}
													className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
												>
													{editora.label}
												</button>
											))}
										</div>
									)}
									{errors.editora && <p className="text-red-500 text-sm mt-1">{errors.editora}</p>}
								</div>

								{/* Idioma */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Idioma
									</label>
									<select
										value={formData.idioma}
										onChange={(e) => updateField("idioma", e.target.value)}
										className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200"
									>
										<option value="Português">Português</option>
										<option value="Inglês">Inglês</option>
										<option value="Espanhol">Espanhol</option>
										<option value="Francês">Francês</option>
										<option value="Alemão">Alemão</option>
										<option value="Italiano">Italiano</option>
										<option value="Outro">Outro</option>
									</select>
								</div>

								{/* Número de Páginas */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Número de Páginas
									</label>
									<input
										type="number"
										min="1"
										value={formData.paginas}
										onChange={(e) => updateField("paginas", e.target.value)}
										className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
											errors.paginas
												? "border-red-300 focus:border-red-500"
												: "border-gray-200 focus:border-green-500"
										}`}
										placeholder="Ex: 350"
									/>
									{errors.paginas && (
										<p className="text-red-500 text-sm mt-1">{errors.paginas}</p>
									)}
								</div>

								{/* Localização com autocomplete */}
								<div className="relative">
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Localização <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={formData.localizacao}
										onChange={e => updateField("localizacao", e.target.value)}
										onFocus={() => setShowSugestoesLocalizacao(true)}
										onBlur={() => setTimeout(() => setShowSugestoesLocalizacao(false), 200)}
										className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
											errors.localizacao
												? "border-red-300 focus:border-red-500"
												: "border-gray-200 focus:border-green-500"
										}`}
										placeholder="Ex: Estante A, Prateleira 2"
										autoComplete="off"
									/>
									{/* Sugestões de localizações */}
									{showSugestoesLocalizacao && localizacoesPadrao.length > 0 && (
										<div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
											{(formData.localizacao
												? localizacoesPadrao.filter(loc => loc.toLowerCase().includes(formData.localizacao.toLowerCase()))
												: localizacoesPadrao
											).slice(0, 30).map((loc, idx) => (
												<button
													key={idx}
													type="button"
													onClick={() => {
														updateField("localizacao", loc);
														setShowSugestoesLocalizacao(false);
													}}
													className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
												>
													{loc}
												</button>
											))}
										</div>
									)}
									{errors.localizacao && (
										<p className="text-red-500 text-sm mt-1">{errors.localizacao}</p>
									)}
								</div>

								{/* Quantidade de Exemplares */}
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Quantidade de Exemplares <span className="text-red-500">*</span>
									</label>
									<input
										type="number"
										min="1"
										value={formData.exemplares}
										onChange={(e) => updateField("exemplares", e.target.value)}
										className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
											errors.exemplares
												? "border-red-300 focus:border-red-500"
												: "border-gray-200 focus:border-green-500"
										}`}
										placeholder="1"
									/>
									{errors.exemplares && (
										<p className="text-red-500 text-sm mt-1">{errors.exemplares}</p>
									)}
								</div>

								{/* Resumo */}
								<div className="lg:col-span-2">
									<label className="block text-sm font-semibold text-gray-700 mb-2">
										Resumo
										<span className="text-gray-500 text-xs ml-2">
											({formData.resumo.length}/1000 caracteres)
										</span>
									</label>
									<textarea
										rows="4"
										value={formData.resumo}
										onChange={(e) => updateField("resumo", e.target.value)}
										className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 resize-none ${
											errors.resumo
												? "border-red-300 focus:border-red-500"
												: "border-gray-200 focus:border-green-500"
										}`}
										placeholder="Breve descrição da obra, suas contribuições e contexto..."
									/>
									{errors.resumo && (
										<p className="text-red-500 text-sm mt-1">{errors.resumo}</p>
									)}
								</div>
							</div>

							{/* Botões de ação */}
							<div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
								<button
									type="submit"
									disabled={submitting}
									className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
								>
									{submitting ? (
										<>
											<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
											Catalogando...
										</>
									) : (
										<>
											<Plus size={18} />
											Catalogar Obra
										</>
									)}
								</button>

								<button
									type="button"
									onClick={limparFormulario}
									disabled={submitting}
									className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
								>
									Limpar Formulário
								</button>
							</div>
						</form>
					</div>
				</div>
				{(capaUrl || formData.isbn) && (
					<div className="flex-shrink-0 mt-6 lg:mt-0">
						<img
							src={
								capaUrl ||
								(formData.isbn
									? `https://covers.openlibrary.org/b/isbn/${limparIsbn(formData.isbn)}-L.jpg`
									: undefined)
							}
							alt="Capa do livro"
							className="w-48 h-auto rounded-lg shadow-lg border"
							style={{ maxHeight: 300 }}
							onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=Livro&background=3B82F6&color=fff&size=128'; }}
						/>
						<p className="text-center text-xs text-gray-500 mt-2">Capa do livro</p>
					</div>
				)}
			</div>
			{showModalAutor && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
					<div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm">
						<h2 className="text-lg font-bold mb-2">Adicionar novo autor</h2>
						<input
							type="text"
							className="w-full border rounded px-3 py-2 mb-3"
							value={novoAutorNome}
							onChange={e => setNovoAutorNome(e.target.value)}
							placeholder="Nome do autor"
						/>
						{erroNovoAutor && <p className="text-red-500 text-sm mb-2">{erroNovoAutor}</p>}
						<div className="flex gap-2 justify-end">
							<button
								className="px-4 py-2 rounded bg-gray-200"
								onClick={() => { setShowModalAutor(false); setErroNovoAutor(''); }}
							>Cancelar</button>
							<button
								className="px-4 py-2 rounded bg-green-600 text-white"
								disabled={loadingNovoAutor}
								onClick={async () => {
									setLoadingNovoAutor(true);
									setErroNovoAutor('');
									try {
										const res = await CatalogService.criarAutorRapido(novoAutorNome);
										updateField("autor", res._id);
										updateField("autorLabel", res.nome);
										setShowModalAutor(false);
									} catch (err) {
										if (err.response && err.response.status === 409) {
											setErroNovoAutor('Autor já existe. Selecione na lista.');
										} else {
											setErroNovoAutor('Erro ao cadastrar autor.');
										}
									} finally {
										setLoadingNovoAutor(false);
									}
								}}
							>Salvar</button>
						</div>
					</div>
				</div>
			)}
			{showModalEditora && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
					<div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm">
						<h2 className="text-lg font-bold mb-2">Adicionar nova editora</h2>
						<input
							type="text"
							className="w-full border rounded px-3 py-2 mb-3"
							value={novoEditoraNome}
							onChange={e => setNovoEditoraNome(e.target.value)}
							placeholder="Nome da editora"
						/>
						{erroNovaEditora && <p className="text-red-500 text-sm mb-2">{erroNovaEditora}</p>}
						<div className="flex gap-2 justify-end">
							<button
								className="px-4 py-2 rounded bg-gray-200"
								onClick={() => { setShowModalEditora(false); setErroNovaEditora(''); }}
							>Cancelar</button>
							<button
								className="px-4 py-2 rounded bg-green-600 text-white"
								disabled={loadingNovaEditora}
								onClick={async () => {
									setLoadingNovaEditora(true);
									setErroNovaEditora('');
									try {
										const res = await CatalogService.criarEditoraRapida(novoEditoraNome);
										updateField("editora", res._id);
										updateField("editoraLabel", res.nome);
										setShowModalEditora(false);
									} catch (err) {
										if (err.response && err.response.status === 409) {
											setErroNovaEditora('Editora já existe. Selecione na lista.');
										} else {
											setErroNovaEditora('Erro ao cadastrar editora.');
										}
									} finally {
										setLoadingNovaEditora(false);
									}
								}}
							>Salvar</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

function UsuariosSection() {
	const [usuarios, setUsuarios] = useState([]);
	const [loading, setLoading] = useState(true);
	const [erro, setErro] = useState(null);
	const [busca, setBusca] = useState("");
	const [papelFiltro, setPapelFiltro] = useState("");
	const [alterandoId, setAlterandoId] = useState(null);

	// Função para buscar usuários
	const fetchUsuarios = async () => {
		setLoading(true);
		try {
			const data = await UserService.getAllUsers();
			setUsuarios(data);
			setErro(null);
		} catch (err) {
			setErro("Erro ao carregar usuários");
			setUsuarios([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsuarios();
	}, []);

	const usuariosFiltrados = usuarios.filter(u => {
		const buscaOk = busca.trim() === "" || (u.nome && u.nome.toLowerCase().includes(busca.toLowerCase())) || (u.email && u.email.toLowerCase().includes(busca.toLowerCase()));
		const papelOk = !papelFiltro || u.papel === papelFiltro;
		return buscaOk && papelOk;
	});

	const handleToggleStatus = async (usuario) => {
		if (!usuario || !usuario.id) return;
		setAlterandoId(usuario.id);
		try {
			const novoStatus = usuario.statusConta === 'ativa' ? 'inativo' : 'ativa';
			await UserService.updateUserStatus(usuario.id, novoStatus);
			setUsuarios(usrs => usrs.map(u => u.id === usuario.id ? { ...u, statusConta: novoStatus } : u));
		} catch (err) {
			alert('Erro ao atualizar status do usuário.');
		} finally {
			setAlterandoId(null);
		}
	};

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
			<h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
				<Users size={28} className="text-orange-600" /> Gerenciar Usuários
				<button
					onClick={fetchUsuarios}
					disabled={loading}
					className={`ml-2 px-2 py-1 rounded text-xs border border-orange-200 bg-white hover:bg-orange-50 transition-colors flex items-center gap-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
					title="Atualizar lista de usuários"
				>
					{loading ? <Loader2 size={16} className="animate-spin" /> : null}
					{loading ? 'Atualizando...' : 'Atualizar'}
				</button>
			</h2>
			<div className="flex flex-col md:flex-row gap-4 mb-6">
				<input
					type="text"
					placeholder="Buscar por nome ou email..."
					value={busca}
					onChange={e => setBusca(e.target.value)}
					className="border rounded px-3 py-2 flex-1"
				/>
				<select
					value={papelFiltro}
					onChange={e => setPapelFiltro(e.target.value)}
					className="border rounded px-3 py-2"
				>
					<option value="">Todos os papéis</option>
					<option value="aluno">Aluno</option>
					<option value="professor">Professor</option>
					<option value="admin">Admin/Bibliotecário</option>
				</select>
			</div>
			{loading ? (
				<div className="text-center text-gray-500">Carregando usuários...</div>
			) : erro ? (
				<div className="text-center text-red-600">{erro}</div>
			) : usuariosFiltrados.length === 0 ? (
				<div className="text-center text-gray-500">Nenhum usuário encontrado.</div>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full border text-sm">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-2 border">Nome</th>
								<th className="px-4 py-2 border">Email</th>
								<th className="px-4 py-2 border">Papel</th>
								<th className="px-4 py-2 border">Status</th>
								<th className="px-4 py-2 border">Ações</th>
							</tr>
						</thead>
						<tbody>
							{usuariosFiltrados.map(usuario => (
								<tr key={usuario.id} className="hover:bg-gray-50">
									<td className="px-4 py-2 border font-medium">{usuario.nome}</td>
									<td className="px-4 py-2 border">{usuario.email}</td>
									<td className="px-4 py-2 border capitalize">{usuario.papel}</td>
									<td className="px-4 py-2 border">
										<span className={usuario.statusConta === 'ativa' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
											{usuario.statusConta === 'ativa' ? 'Ativo' : 'Inativo'}
										</span>
									</td>
									<td className="px-4 py-2 border">
										<button
											onClick={() => handleToggleStatus(usuario)}
											disabled={alterandoId === usuario.id}
											className={`px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 text-xs ${alterandoId === usuario.id ? 'opacity-50 cursor-not-allowed' : ''}`}
										>
											{alterandoId === usuario.id ? 'Aguarde...' : (usuario.statusConta === 'ativa' ? 'Desativar' : 'Ativar')}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

function RelatoriosSection() {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
			<div className="p-4 bg-indigo-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
				<FileText size={32} className="text-indigo-600" />
			</div>
			<h3 className="text-lg font-semibold text-gray-900 mb-2">Relatórios</h3>
			<p className="text-gray-600">Funcionalidade em desenvolvimento</p>
		</div>
	);
}

function ConfiguracoesSection({ user, onLogout }) {
	const [profile, setProfile] = useState(null);

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const token = localStorage.getItem("authToken");
				const profileData = await getProfile(token);
				setProfile(profileData);
			} catch (error) {
				console.error("Erro ao carregar perfil do admin:", error);
				try {
					const token = localStorage.getItem("authToken");
					setProfile(await getProfile(token));
				} catch {}
			}
		};

		if (user?.id) {
			loadProfile();
		}
	}, [user]);

	return (
		<div className="space-y-6">
			{/* Informações do admin */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<div className="w-2 h-2 bg-red-500 rounded-full"></div>
					Informações do Administrador
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<AdminInfoCard label="Nome completo" value={user.nome} />
					<AdminInfoCard label="Email" value={user.email} />
					<AdminInfoCard
						label="Nível de acesso"
						value="Administrador"
						valueColor="text-red-600 font-medium"
					/>
					<AdminInfoCard
						label="Tipo de login"
						value={profile?.tipoLogin || "Carregando..."}
					/>
					<AdminInfoCard
						label="Status da conta"
						value={profile?.statusConta || "Carregando..."}
						valueColor="text-green-600 font-medium"
					/>
					<AdminInfoCard
						label="Permissões"
						value={profile?.permissoes || "Carregando..."}
						valueColor="text-orange-600 font-medium"
					/>
				</div>
			</div>

			{/* Ações de configuração */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<button
					onClick={() => {/* TODO: Implementar */}}
					className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all duration-200 group active:scale-95"
				>
					<div className="flex items-center gap-3 mb-2">
						<Settings size={24} className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
						<h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Configurações do Sistema</h3>
					</div>
					<p className="text-sm text-gray-600">Gerenciar configurações gerais</p>
				</button>
				<button
					onClick={() => {/* TODO: Implementar */}}
					className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all duration-200 group active:scale-95"
				>
					<div className="flex items-center gap-3 mb-2">
						<Database size={24} className="text-blue-600 group-hover:text-blue-700 transition-colors duration-200" />
						<h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">Backup dos Dados</h3>
					</div>
					<p className="text-sm text-gray-600">Fazer backup do sistema</p>
				</button>
				<button
					onClick={onLogout}
					className="bg-red-50 border border-red-200 rounded-xl p-4 text-left hover:shadow-md hover:border-red-300 transition-all duration-200 group active:scale-95"
				>
					<div className="flex items-center gap-3 mb-2">
						<div className="text-red-600 group-hover:text-red-700 transition-colors duration-200">
							<ArrowLeft size={24} />
						</div>
						<h3 className="font-semibold text-red-900 group-hover:text-red-700 transition-colors duration-200">Sair da Conta</h3>
					</div>
					<p className="text-sm text-red-600">Fazer logout do sistema</p>
				</button>
			</div>
		</div>
	);
}

function AdminInfoCard({ label, value, valueColor = "text-gray-900" }) {
	return (
		<div className="bg-gray-50 rounded-lg p-3">
			<span className="text-xs text-gray-600 uppercase tracking-wide">
				{label}
			</span>
			<p className={`font-medium mt-1 ${valueColor}`}>{value}</p>
		</div>
	);
}
