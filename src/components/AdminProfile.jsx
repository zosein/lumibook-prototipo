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
	User,
	UserPlus,
	Loader2,
} from "lucide-react";
import { getProfile } from "../services/profileService";
import StatsService from '../services/StatsService';
import * as UserService from '../services/UserService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GerenciarAcervoContent } from '../pages/AdminProfilePage';
import axios from "axios";
import { CatalogacaoContent } from '../pages/AdminProfilePage';

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
				const apiData = response.data;
				if (apiData && apiData.dados) {
					setStats(apiData.dados);
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
				frase: '',
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
							{/* <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1> */}
							{/* <p className="text-gray-600">{theme.frase}</p> */}
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
	const [dashboardStats, setDashboardStats] = useState(stats);

	// Atualiza dashboardStats quando stats muda externamente (ex: login)
	useEffect(() => {
		let statsObj = stats;
		if (stats && stats.dados) {
			statsObj = stats.dados;
		}
		setDashboardStats(statsObj || {});
	}, [stats]);

	// Simular refresh apenas com toast
	const handleDashboardRefresh = () => {
		toast.info('Dashboard mockado atualizado!');
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
							className={`ml-2 px-2 py-1 rounded text-xs border border-blue-200 bg-white hover:bg-blue-50 transition-colors flex items-center gap-1`}
							title="Atualizar informações do dashboard"
						>
							Atualizar
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
	// Estado para menu de escolha
	const [showMenu, setShowMenu] = useState(true);
	const [tipoCadastro, setTipoCadastro] = useState(null);

	// Função para escolher tipo
	const handleEscolherTipo = (tipo) => {
		setTipoCadastro(tipo);
		setShowMenu(false);
	};
	// Função para voltar ao menu
	const handleVoltarMenu = () => {
		setTipoCadastro(null);
		setShowMenu(true);
	};

	// Renderização condicional
	if (showMenu) {
		return <CatalogarMenu onEscolher={handleEscolherTipo} onClose={() => setShowMenu(false)} />;
	}
	if (tipoCadastro === 'book') {
		return (
			<div>
				<button onClick={handleVoltarMenu} className="mb-4 text-blue-700 underline">Voltar</button>
				<FormLivroEbookCatalogacao />
			</div>
		);
	}
	if (tipoCadastro === 'thesis') {
		return (
			<div>
				<button onClick={handleVoltarMenu} className="mb-4 text-blue-700 underline">Voltar</button>
				<FormCadastroTese adminId={adminId} />
			</div>
		);
	}
	return null;
}

function CatalogarMenu({ onEscolher, onClose }) {
	return (
		<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
			<div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-xs flex flex-col gap-4 items-center">
				<h2 className="text-xl font-bold mb-4 text-center">Escolha o tipo de obra</h2>
				<button onClick={() => onEscolher('book')} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Livro/E-Book</button>
				<button disabled className="w-full bg-gray-300 text-gray-600 py-2 rounded opacity-60 cursor-not-allowed">Periódico (em construção)</button>
				<button onClick={() => onEscolher('thesis')} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Tese</button>
				<button onClick={onClose} className="w-full mt-2 text-blue-700 underline">Cancelar</button>
			</div>
		</div>
	);
}

function FormLivroEbookCatalogacao() {
	return (
		<div className="bg-white rounded-xl shadow-md p-6 max-w-2xl mx-auto">
			<CatalogacaoContent />
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

// [NOVO COMPONENTE] Formulário de cadastro de tese
function FormCadastroTese({ adminId }) {
	const [query, setQuery] = useState("");
	const [sugestoes, setSugestoes] = useState([]);
	const [teseSelecionada, setTeseSelecionada] = useState(null);
	const [feedback, setFeedback] = useState("");
	const [erro, setErro] = useState("");
	const [loading, setLoading] = useState(false);
	const [tesesCadastradas, setTesesCadastradas] = useState([]);
	const [buscaLocal, setBuscaLocal] = useState("");

	// Autocomplete de teses via OpenAlex
	const handleChange = async (e) => {
		const value = e.target.value;
		setQuery(value);
		setTeseSelecionada(null);
		setFeedback("");
		setErro("");
		if (value.length > 2) {
			try {
				setLoading(true);
				const res = await axios.get(`/api/academic-theses/search-openalex?q=${encodeURIComponent(value)}`);
				setSugestoes(res.data || []);
			} catch {
				setSugestoes([]);
			} finally {
				setLoading(false);
			}
		} else {
			setSugestoes([]);
		}
	};

	// Selecionar tese do autocomplete
	const handleSelectTese = (tese) => {
		setTeseSelecionada(tese);
		setQuery(tese.title);
		setSugestoes([]);
		setFeedback("");
		setErro("");
	};

	// Cadastrar tese selecionada
	const handleCadastrarTese = async () => {
		if (!teseSelecionada) return;
		try {
			setLoading(true);
			setFeedback("");
			setErro("");
			await axios.post("/api/academic-theses", teseSelecionada);
			setFeedback("Tese cadastrada com sucesso!");
			setTeseSelecionada(null);
			setQuery("");
			buscarTesesLocalmente();
		} catch (e) {
			setErro("Erro ao cadastrar tese. Ela pode já estar cadastrada.");
		} finally {
			setLoading(false);
		}
	};

	// Buscar teses cadastradas localmente
	const buscarTesesLocalmente = async (q = "") => {
		try {
			const res = await axios.get(`/api/academic-theses?q=${encodeURIComponent(q)}`);
			setTesesCadastradas(res.data || []);
		} catch {
			setTesesCadastradas([]);
		}
	};

	useEffect(() => {
		buscarTesesLocalmente();
	}, []);

	return (
		<div className="max-w-xl mx-auto bg-white rounded-xl border border-gray-100 p-6 shadow">
			<h2 className="text-xl font-bold mb-4">Catalogar Tese</h2>
			<label className="block text-sm font-semibold text-gray-700 mb-2">Buscar Tese (OpenAlex)</label>
			<input
				type="text"
				value={query}
				onChange={handleChange}
				placeholder="Digite parte do título, autor, etc..."
				className="w-full px-4 py-2 border border-gray-300 rounded mb-2"
			/>
			{loading && <div className="text-gray-500 text-sm">Buscando...</div>}
			{sugestoes.length > 0 && (
				<ul className="border border-gray-200 rounded bg-white max-h-48 overflow-y-auto mb-2">
					{sugestoes.map((tese) => (
						<li
							key={tese.openAlexId}
							className="px-4 py-2 hover:bg-blue-50 cursor-pointer"
							onClick={() => handleSelectTese(tese)}
						>
							<strong>{tese.title}</strong><br />
							<span className="text-xs text-gray-600">{tese.authors?.join(", ")} ({tese.year})</span>
						</li>
					))}
				</ul>
			)}
			{teseSelecionada && (
				<div className="border border-green-200 bg-green-50 rounded p-3 mb-2">
					<div className="font-semibold">Selecionada:</div>
					<div><strong>{teseSelecionada.title}</strong></div>
					<div className="text-sm text-gray-700">{teseSelecionada.authors?.join(", ")} ({teseSelecionada.year})</div>
					<button
						onClick={handleCadastrarTese}
						className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
						disabled={loading}
					>Cadastrar Tese</button>
				</div>
			)}
			{feedback && <div className="text-green-700 bg-green-50 border border-green-200 rounded p-2 mb-2">{feedback}</div>}
			{erro && <div className="text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-2">{erro}</div>}
			<hr className="my-4" />
			<label className="block text-sm font-semibold text-gray-700 mb-2">Teses já cadastradas</label>
			<input
				type="text"
				value={buscaLocal}
				onChange={e => {
					setBuscaLocal(e.target.value);
					buscarTesesLocalmente(e.target.value);
				}}
				placeholder="Buscar localmente..."
				className="w-full px-4 py-2 border border-gray-300 rounded mb-2"
			/>
			<ul className="border border-gray-200 rounded bg-white max-h-48 overflow-y-auto">
				{tesesCadastradas.length === 0 && <li className="px-4 py-2 text-gray-500">Nenhuma tese cadastrada.</li>}
				{tesesCadastradas.map((tese) => (
					<li key={tese.openAlexId} className="px-4 py-2 border-b last:border-b-0">
						<strong>{tese.title}</strong><br />
						<span className="text-xs text-gray-600">{tese.authors?.join(", ")} ({tese.year})</span>
					</li>
				))}
			</ul>
		</div>
	);
}
