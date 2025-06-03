import { useState, useEffect } from "react";
import {
	Book,
	Home,
	BookOpen,
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
	Clock,
	CheckCircle,
} from "lucide-react";
import { useCatalogacao } from "../hooks/useCatalogacao";
import { getSystemActivities } from "../services/UserService";
import { getProfile } from "../services/profileService";

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
				// Usar StatsService ou endpoint específico para admin
				const endpoint = `/admin/${user.id}/estatisticas`;
				const headers = {
					Authorization: `Bearer ${localStorage.getItem("authToken")}`,
					"Content-Type": "application/json",
				};

				console.log(`[API CALL] GET ${endpoint}`, {
					headers,
					userId: user.id,
					userType: "admin",
				});

				const response = await fetch(
					`${
						process.env.REACT_APP_API_URL || "http://localhost:3001"
					}${endpoint}`,
					{
						method: "GET",
						headers,
						signal: AbortSignal.timeout(10000),
					}
				);

				if (!response.ok) {
					throw new Error(`HTTP ${response.status}: ${response.statusText}`);
				}

				const statsData = await response.json();
				setStats(statsData);
			} catch (err) {
				console.error("Erro ao buscar estatísticas do admin:", err);
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

// REMOVIDO: Funções de dados mockados (getMockAdminStats, getOfflineAdminStats)
// Agora todas as estatísticas de admin vêm da API

export default function AdminProfile({
	user = {
		nome: "ADMINISTRADOR",
		avatar: null, // Avatar será buscado da API
	},
	setCurrentPage,
	isLoggedIn,
	onLogout,
}) {
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
					/>
				);
			case "catalogacao":
				return <CatalogacaoSection adminId={user.id} />;
			case "gerenciar":
				return <GerenciarAcervoSection />;
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
					/>
				);
		}
	};

	const podeGerenciarLivros = user.papel === 'admin' || user.papel === 'bibliotecario';

	return (
		<div className="min-h-screen flex flex-col bg-white animate-in fade-in duration-300">
			{/* Header idêntico ao StudentProfile */}
			<header className="w-full bg-blue-600 flex items-center justify-between px-8 py-3 shadow-lg">
				<div className="flex items-center gap-4">
					<button
						onClick={() => handleNavigation("home")}
						className="flex items-center gap-2 text-white hover:text-blue-200 transition-all duration-200 p-2 rounded-lg hover:bg-blue-500 active:scale-95"
					>
						<ArrowLeft size={20} />
						<span className="hidden sm:inline font-medium">Voltar</span>
					</button>

					<span className="font-bold text-xl text-white tracking-widest flex items-center">
						LUMIBOOK
						<Book
							size={24}
							className="ml-2 text-yellow-400"
							aria-hidden="true"
						/>
					</span>
				</div>
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 bg-white text-red-600 rounded-full flex items-center justify-center border-2 border-white">
						<Shield size={16} />
					</div>
					<span className="font-medium text-white">{user.nome}</span>
					<div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
				</div>
			</header>

			<div className="flex flex-1">
				{/* Sidebar idêntica ao StudentProfile */}
				<aside className="hidden sm:flex flex-col bg-blue-700 w-64 px-6 py-5 text-white shadow-lg">
					<div className="mb-6">
						<span className="text-2xl font-bold">ADMINISTRADOR</span>
						<div className="text-xs text-blue-200 mt-1 flex items-center gap-1">
							<div className="w-1 h-1 bg-red-400 rounded-full"></div>
							Sistema Online
						</div>
					</div>
					<div className="flex flex-col items-center mb-6">
						<div className="w-16 h-16 bg-white text-red-600 rounded-full flex items-center justify-center border-2 border-white">
							<Shield size={28} />
						</div>
						<span className="mt-3 text-sm">Bem-vindo(a)</span>
						<span className="font-semibold">{user.nome}</span>
						{user.email && (
							<span className="text-xs text-blue-200 mt-1">{user.email}</span>
						)}
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

				{/* Conteúdo Principal - REMOVIDO A BARRA DE PESQUISA */}
				<main className="flex-1 p-4 sm:p-8 bg-gray-50">
					<div className="max-w-6xl mx-auto">
						{/* Cabeçalho da página */}
						<div className="mb-6">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								Painel Administrativo
							</h1>
							<p className="text-gray-600">
								Gerencie o sistema bibliotecário e monitore as atividades
							</p>
						</div>

						{/* Conteúdo da seção ativa - REMOVIDO O CONTAINER DA BARRA DE PESQUISA */}
						{podeGerenciarLivros && (
							<div className="flex gap-4 mb-4">
								<button className="bg-blue-600 text-white px-4 py-2 rounded-lg" onClick={() => setCurrentPage('catalogar')}>Catalogar Livro</button>
								<button className="bg-purple-600 text-white px-4 py-2 rounded-lg" onClick={() => setCurrentPage('gerenciarAcervo')}>Gerenciar Acervo</button>
							</div>
						)}

						{renderActiveSection()}
					</div>
				</main>
			</div>
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
}) {
	const [activities, setActivities] = useState([]);
	const [activitiesLoading, setActivitiesLoading] = useState(true);

	useEffect(() => {
		const loadActivities = async () => {
			try {
				const systemActivities = await getSystemActivities();
				setActivities(systemActivities);
			} catch (error) {
				console.error("Erro ao carregar atividades:", error);
				// Fallback para dados offline se necessário
				setActivities([]);
			} finally {
				setActivitiesLoading(false);
			}
		};

		loadActivities();
	}, []);

	return (
		<section className="space-y-8">
			{/* Estatísticas principais */}
			<div className="mb-8">
				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-semibold text-gray-900">
						Estatísticas do Sistema
					</h2>
					{stats && (
						<div className="flex items-center gap-2 text-sm text-gray-500">
							{stats.fonte === "offline" && (
								<div className="flex items-center gap-1 text-amber-600">
									<AlertTriangle size={14} />
									<span>Dados offline</span>
								</div>
							)}
							{stats.ultimaAtualizacao && (
								<span>
									Atualizado:{" "}
									{new Date(stats.ultimaAtualizacao).toLocaleTimeString()}
								</span>
							)}
							<button
								onClick={onRefresh}
								className="text-blue-600 hover:text-blue-700 ml-2"
							>
								Atualizar
							</button>
						</div>
					)}
				</div>

				{loading ? (
					<AdminStatsLoadingGrid />
				) : error && !stats ? (
					<AdminStatsErrorState error={error} onRetry={onRefresh} />
				) : (
					<AdminStatsGrid stats={stats} />
				)}
			</div>

			{/* Atividades recentes */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
					<Activity size={20} className="text-blue-600" />
					Atividades Recentes
				</h3>
				<div className="space-y-4">
					{activitiesLoading ? (
						<div className="text-center py-4">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
							<p className="text-sm text-gray-500 mt-2">
								Carregando atividades...
							</p>
						</div>
					) : activities.length === 0 ? (
						<div className="text-center py-4">
							<p className="text-gray-500">
								Nenhuma atividade recente encontrada
							</p>
						</div>
					) : (
						activities.map((activity, index) => (
							<div
								key={index}
								className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200"
							>
								<div
									className={`p-2 bg-${activity.color}-100 rounded-lg flex-shrink-0`}
								>
									<activity.icon
										size={16}
										className={`text-${activity.color}-600`}
									/>
								</div>
								<div className="flex-1 min-w-0">
									<p className="font-medium text-gray-900">{activity.action}</p>
									<p className="text-sm text-gray-600 truncate">
										{activity.details}
									</p>
								</div>
								<span className="text-xs text-gray-500 flex-shrink-0">
									{activity.time}
								</span>
							</div>
						))
					)}
				</div>
			</div>

			{/* Ações rápidas */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				<AdminQuickAction
					icon={<Plus size={24} />}
					title="Catalogar Obra"
					description="Adicionar novos livros ao acervo"
					onClick={() => setActiveSection("catalogacao")}
				/>
				<AdminQuickAction
					icon={<Users size={24} />}
					title="Gerenciar Usuários"
					description="Visualizar e gerenciar usuários"
					onClick={() => setActiveSection("usuarios")}
				/>
				<AdminQuickAction
					icon={<FileText size={24} />}
					title="Relatórios"
					description="Gerar relatórios e estatísticas"
					onClick={() => setActiveSection("relatorios")}
				/>
			</div>
		</section>
	);
}

// Grid de estatísticas do admin
function AdminStatsGrid({ stats }) {
	if (!stats) return null;

	const statsCards = [
		{
			key: "totalObras",
			value: stats.totalObras?.toLocaleString() || "0",
			label: "Total de Obras",
			desc: "Livros catalogados no sistema",
			icon: <BookOpen size={32} />,
			color: "bg-blue-50 border-blue-200",
			iconColor: "text-blue-600",
		},
		{
			key: "usuariosAtivos",
			value: stats.usuariosAtivos?.toLocaleString() || "0",
			label: "Usuários Ativos",
			desc: "Usuários cadastrados no sistema",
			icon: <Users size={32} />,
			color: "bg-green-50 border-green-200",
			iconColor: "text-green-600",
		},
		{
			key: "emprestimosHoje",
			value: stats.emprestimosHoje || "0",
			label: "Empréstimos Hoje",
			desc: "Empréstimos realizados hoje",
			icon: <Clock size={32} />,
			color: "bg-orange-50 border-orange-200",
			iconColor: "text-orange-600",
		},
		{
			key: "obrasDisponiveis",
			value: stats.obrasDisponiveis?.toLocaleString() || "0",
			label: "Obras Disponíveis",
			desc: "Livros disponíveis para empréstimo",
			icon: <Database size={32} />,
			color: "bg-purple-50 border-purple-200",
			iconColor: "text-purple-600",
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{statsCards.map(({ key, ...rest }) => (
				<AdminStatCard key={key} {...rest} />
			))}
		</div>
	);
}

// Componente de loading para as estatísticas do admin
function AdminStatsLoadingGrid() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{Array.from({ length: 4 }).map((_, index) => (
				<div
					key={index}
					className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse"
				>
					<div className="flex items-center justify-between mb-3">
						<div className="h-8 bg-gray-300 rounded w-16"></div>
						<div className="h-8 w-8 bg-gray-300 rounded"></div>
					</div>
					<div className="space-y-2">
						<div className="h-4 bg-gray-300 rounded w-24"></div>
						<div className="h-3 bg-gray-300 rounded w-32"></div>
					</div>
				</div>
			))}
		</div>
	);
}

// Componente de erro para as estatísticas do admin
function AdminStatsErrorState({ error, onRetry }) {
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

// Card de estatística do admin
function AdminStatCard({
	value,
	label,
	desc,
	icon,
	color = "bg-gray-50 border-gray-200",
	iconColor = "text-gray-600",
}) {
	return (
		<div
			className={`${color} border rounded-xl p-4 transition-all duration-200 hover:shadow-md hover:scale-105 cursor-default`}
		>
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

// Ação rápida do admin
function AdminQuickAction({ icon, title, description, onClick }) {
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
	} = useCatalogacao(adminId);

	// Estados locais para UI
	const [showSugestoes, setShowSugestoes] = useState(false);
	const [isbnTimer, setIsbnTimer] = useState(null);

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
						<p className="text-gray-600">
							Adicione novas obras ao acervo da biblioteca
						</p>
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

						{/* Autor */}
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Autor <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								value={formData.autor}
								onChange={(e) => updateField("autor", e.target.value)}
								className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
									errors.autor
										? "border-red-300 focus:border-red-500"
										: "border-gray-200 focus:border-green-500"
								}`}
								placeholder="Nome completo do autor"
							/>
							{errors.autor && (
								<p className="text-red-500 text-sm mt-1">{errors.autor}</p>
							)}
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
								{tiposObra.map((tipo) => (
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
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Categoria <span className="text-red-500">*</span>
							</label>
							<select
								value={formData.categoria}
								onChange={(e) => updateField("categoria", e.target.value)}
								className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
									errors.categoria
										? "border-red-300 focus:border-red-500"
										: "border-gray-200 focus:border-green-500"
								}`}
							>
								<option value="">Selecione a categoria</option>
								{categorias.map((categoria) => (
									<option key={categoria} value={categoria}>
										{categoria}
									</option>
								))}
							</select>
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
								value={formData.editora}
								onChange={(e) => {
									updateField("editora", e.target.value);
									buscarEditoras(e.target.value);
									setShowSugestoes(true);
								}}
								onFocus={() => setShowSugestoes(true)}
								onBlur={() => setTimeout(() => setShowSugestoes(false), 200)}
								className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
									errors.editora
										? "border-red-300 focus:border-red-500"
										: "border-gray-200 focus:border-green-500"
								}`}
								placeholder="Nome da editora"
							/>

							{/* Sugestões de editoras */}
							{showSugestoes && sugestaoEditoras.length > 0 && (
								<div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
									{sugestaoEditoras.map((editora, index) => (
										<button
											key={index}
											type="button"
											onClick={() => {
												updateField("editora", editora);
												setShowSugestoes(false);
											}}
											className="w-full px-4 py-2 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
										>
											{editora}
										</button>
									))}
								</div>
							)}
							{errors.editora && (
								<p className="text-red-500 text-sm mt-1">{errors.editora}</p>
							)}
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

						{/* Localização */}
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Localização <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								value={formData.localizacao}
								onChange={(e) => updateField("localizacao", e.target.value)}
								className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200 ${
									errors.localizacao
										? "border-red-300 focus:border-red-500"
										: "border-gray-200 focus:border-green-500"
								}`}
								placeholder="Ex: Estante A25, Prateleira 2"
							/>
							{errors.localizacao && (
								<p className="text-red-500 text-sm mt-1">
									{errors.localizacao}
								</p>
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
	);
}

function GerenciarAcervoSection() {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
			<div className="p-4 bg-purple-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
				<Edit3 size={32} className="text-purple-600" />
			</div>
			<h3 className="text-lg font-semibold text-gray-900 mb-2">
				Gerenciar Acervo
			</h3>
			<p className="text-gray-600">Funcionalidade em desenvolvimento</p>
		</div>
	);
}

function UsuariosSection() {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
			<div className="p-4 bg-orange-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
				<Users size={32} className="text-orange-600" />
			</div>
			<h3 className="text-lg font-semibold text-gray-900 mb-2">
				Gerenciar Usuários
			</h3>
			<p className="text-gray-600">Funcionalidade em desenvolvimento</p>
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
				<AdminQuickAction
					icon={<Settings size={24} />}
					title="Configurações do Sistema"
					description="Gerenciar configurações gerais"
					onClick={() => {
						/* TODO: Implementar */
					}}
				/>
				<AdminQuickAction
					icon={<Database size={24} />}
					title="Backup dos Dados"
					description="Fazer backup do sistema"
					onClick={() => {
						/* TODO: Implementar */
					}}
				/>
				<button
					onClick={onLogout}
					className="bg-red-50 border border-red-200 rounded-xl p-4 text-left hover:shadow-md hover:border-red-300 transition-all duration-200 group active:scale-95"
				>
					<div className="flex items-center gap-3 mb-2">
						<div className="text-red-600 group-hover:text-red-700 transition-colors duration-200">
							<ArrowLeft size={24} />
						</div>
						<h3 className="font-semibold text-red-900 group-hover:text-red-700 transition-colors duration-200">
							Sair da Conta
						</h3>
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
