import { useState, useEffect } from "react";
import {
	Book,
	Home,
	BookOpen,
	Undo2,
	CoinsIcon,
	Search,
	ArrowLeft,
	AlertTriangle,
	Users,
	Loader2,
	Menu,
} from "lucide-react";
import StatsService from "../services/StatsService";
import { getUserById } from "../services/UserService";
import { getAuthToken } from "../services/UserService";
import { getUserAvatar } from "../services/avatarService";
import * as ReservationService from '../services/ReservationService';
import FineService from '../services/FineService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Hook para buscar estatísticas do usuário
function useUserStats(user, isLoggedIn) {
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		async function fetchUserStats() {
			if (!isLoggedIn || !user) {
				setStats(null);
				setLoading(false);
				return;
			}
			setLoading(true);
			setError(null);
			try {
				const statsData = await StatsService.getUserStats(user, false);
				if (!statsData || typeof statsData !== 'object' || !('livrosDisponiveis' in statsData)) {
					setError('Não foi possível carregar as estatísticas.');
					setStats(null);
				} else {
					setStats(statsData);
				}
			} catch (err) {
				setError(err.message || "Erro ao carregar estatísticas");
				setStats(null);
			} finally {
				setLoading(false);
			}
		}
		fetchUserStats();
	}, [user, user?.id, user?.papel, isLoggedIn]);
	return { stats, loading, error };
}

// Hook para buscar dados do perfil do usuário
function useUserProfile(user, isLoggedIn) {
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchUserProfile() {
			if (!isLoggedIn || !user || !user.id) {
				setProfile(null);
				setLoading(false);
				return;
			}
			try {
				const profileData = await getUserById(user.id, getAuthToken());
				setProfile(profileData);
			} catch (error) {
				setProfile({
					avatar: await getUserAvatar(user.id, getAuthToken()),
					statusConta: "ativa",
					membroDesde: "Janeiro 2024",
					tipoLogin: user.papel === "aluno" ? "matrícula" : "email",
				});
			} finally {
				setLoading(false);
			}
		}
		fetchUserProfile();
	}, [user, user?.id, user?.papel, isLoggedIn]);
	return { profile, loading };
}

export default function StudentProfile({ user = { name: "ALUNO", avatar: null }, setCurrentPage, isLoggedIn, showReservations = true }) {
	const { stats, loading, error } = useUserStats(user, isLoggedIn);
	const { profile } = useUserProfile(user, isLoggedIn);

	// Estado do menu mobile
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Estados para reservas
	const [reservations, setReservations] = useState([]);
	const [loadingReservations, setLoadingReservations] = useState(true);
	const [reservationHistory, setReservationHistory] = useState([]);
	const [loadingReservationHistory, setLoadingReservationHistory] = useState(false);
	const [showReservationHistory, setShowReservationHistory] = useState(false);

	// Estados para multas
	const [fines, setFines] = useState([]);
	const [loadingFines, setLoadingFines] = useState(true);
	const [fineHistory, setFineHistory] = useState([]);
	const [loadingFineHistory, setLoadingFineHistory] = useState(false);
	const [showFineHistory, setShowFineHistory] = useState(false);

	// Segurança: redireciona se não estiver logado
	useEffect(() => {
		if (!isLoggedIn || !user) {
			setTimeout(() => setCurrentPage("login"), 0);
		}
	}, [isLoggedIn, user, setCurrentPage]);

	// Buscar reservas
	useEffect(() => {
		async function fetchReservations() {
			setLoadingReservations(true);
			try {
				const token = localStorage.getItem('authToken');
				const data = await ReservationService.getActiveReservations(user.id, token);
				setReservations(data);
			} catch {
				setReservations([]);
			} finally {
				setLoadingReservations(false);
			}
		}
		fetchReservations();
	}, [user.id]);

	// Buscar multas
	useEffect(() => {
		async function fetchFines() {
			setLoadingFines(true);
			try {
				const data = await FineService.getUserFines(user.id);
				setFines(data);
			} catch {
				setFines([]);
			} finally {
				setLoadingFines(false);
			}
		}
		fetchFines();
	}, [user.id]);

	// Garantir nome correto
	const displayName = user.name || user.nome || "ALUNO";

	// Handlers auxiliares
	const handleNavigation = (page) => setCurrentPage(page);
	const handleRefreshStats = () => window.location.reload();

	const [cancelingId, setCancelingId] = useState(null);
	const [payingId, setPayingId] = useState(null);

	const handleCancelReservation = async (reservationId) => {
		setCancelingId(reservationId);
		try {
			const token = localStorage.getItem('authToken');
			await ReservationService.cancelReservation(reservationId, token);
			toast.success('Reserva cancelada!');
			setReservations(reservations.filter(r => r.id !== reservationId));
		} catch (err) {
			toast.error('Erro ao cancelar reserva: ' + (err.response?.data?.message || err.message));
		} finally {
			setCancelingId(null);
		}
	};

	const fetchReservationHistory = async () => {
		setLoadingReservationHistory(true);
		try {
			const token = localStorage.getItem('authToken');
			const data = await ReservationService.getReservationHistory(user.id, token);
			setReservationHistory(data);
			setShowReservationHistory(true);
		} catch {
			setReservationHistory([]);
			setShowReservationHistory(true);
		} finally {
			setLoadingReservationHistory(false);
		}
	};

	const handlePayFine = async (fineId) => {
		setPayingId(fineId);
		try {
			const token = localStorage.getItem('authToken');
			await FineService.payFine(fineId, token);
			toast.success('Multa paga!');
			setFines(fines.filter(f => f.id !== fineId));
		} catch (err) {
			toast.error('Erro ao pagar multa: ' + (err.response?.data?.message || err.message));
		} finally {
			setPayingId(null);
		}
	};

	const fetchFineHistory = async () => {
		setLoadingFineHistory(true);
		try {
			const token = localStorage.getItem('authToken');
			const data = await FineService.getFineHistory(user.id, token);
			setFineHistory(data);
			setShowFineHistory(true);
		} catch {
			setFineHistory([]);
			setShowFineHistory(true);
		} finally {
			setLoadingFineHistory(false);
		}
	};

	// Renderização principal
	return (
		<div className="min-h-screen flex flex-col bg-white animate-in fade-in duration-300">
			<ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
			<HeaderSection user={user} profile={profile} handleNavigation={handleNavigation} onOpenMenu={() => setMobileMenuOpen(true)} />
			<MobileSidebar user={user} open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} handleNavigation={(page) => { setMobileMenuOpen(false); handleNavigation(page); }} />
			<div className="flex flex-1">
				<Sidebar user={user} handleNavigation={handleNavigation} />
				<main className="flex-1 p-4 sm:p-8 bg-gray-50">
					<div className="max-w-6xl mx-auto">
						<PageHeader user={user} />
						<StatsSection stats={stats} loading={loading} error={error} userType={user.papel} onRefresh={handleRefreshStats} />
						<QuickActions handleNavigation={handleNavigation} />
						<ProfileInfo user={user} profile={profile} />
						{showReservations && (
							<ReservationsSection
								reservations={reservations}
								loading={loadingReservations}
								history={reservationHistory}
								loadingHistory={loadingReservationHistory}
								showHistory={showReservationHistory}
								onCancel={handleCancelReservation}
								onFetchHistory={fetchReservationHistory}
								cancelingId={cancelingId}
							/>
						)}
						<FinesSection
							fines={fines}
							loading={loadingFines}
							history={fineHistory}
							loadingHistory={loadingFineHistory}
							showHistory={showFineHistory}
							onPay={handlePayFine}
							onFetchHistory={fetchFineHistory}
							payingId={payingId}
						/>
					</div>
				</main>
			</div>
		</div>
	);
}

// Componentes auxiliares extraídos para clareza
function HeaderSection({ user, profile, handleNavigation, onOpenMenu }) {
	const avatarUrl = profile?.avatar || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Usuário')}&background=3B82F6&color=fff&size=128`;
	return (
		<header className="w-full bg-blue-600 flex items-center justify-between px-4 sm:px-8 py-3 shadow-lg">
			<div className="flex items-center gap-4">
				<button className="sm:hidden flex items-center text-white p-2 mr-2" onClick={onOpenMenu} aria-label="Abrir menu">
					<Menu size={28} />
				</button>
				<button
					onClick={() => handleNavigation("home")}
					className="hidden sm:flex items-center gap-2 text-white hover:text-blue-200 transition-all duration-200 p-2 rounded-lg hover:bg-blue-500 active:scale-95"
				>
					<ArrowLeft size={20} />
					<span className="hidden sm:inline font-medium">Voltar</span>
				</button>
				<span className="font-bold text-xl text-white tracking-widest flex items-center">
					LUMIBOOK
					<Book size={24} className="ml-2 text-white-400" aria-hidden="true" />
				</span>
			</div>
			<div className="flex items-center gap-3">
				<img
					src={avatarUrl}
					alt="Avatar"
					className="w-8 h-8 rounded-full border-2 border-white"
				/>
				<span className="font-medium text-white">{user.name}</span>
				<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
			</div>
		</header>
	);
}

function Sidebar({ user, handleNavigation }) {
	const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Usuário')}&background=3B82F6&color=fff&size=128`;
	return (
		<aside className="hidden sm:flex flex-col bg-blue-700 w-64 px-6 py-5 text-white shadow-lg">
			<div className="mb-6">
				<span className="text-2xl font-bold">
					{user.papel === "professor" ? "PROFESSOR" : "ESTUDANTE"}
				</span>
				<div className="text-xs text-blue-200 mt-1 flex items-center gap-1">
					<div className="w-1 h-1 bg-green-400 rounded-full"></div>
					Online
				</div>
			</div>
			<div className="flex flex-col items-center mb-6">
				<img
					src={avatarUrl}
					alt="Avatar do usuário"
					className="w-16 h-16 rounded-full border-2 border-white"
				/>
				<span className="mt-3 text-sm">Bem-vindo(a)</span>
				<span className="font-semibold">{user.name}</span>
				{user.matricula && <span className="text-xs text-blue-200 mt-1">Mat: {user.matricula}</span>}
				{user.email && <span className="text-xs text-blue-200 mt-1">{user.email}</span>}
			</div>
			<nav className="flex flex-col gap-2 mt-6">
				<span className="text-xs mb-1 text-blue-200">BIBLIOTECA</span>
				<NavItem icon={Home} label="Início" onClick={() => handleNavigation("home")} />
				<NavItem icon={Search} label="Pesquisar" onClick={() => handleNavigation("resultados")} />
				<NavItem icon={BookOpen} label="Empréstimos" onClick={() => handleNavigation("reservas")} />
			</nav>
		</aside>
	);
}

function PageHeader({ user }) {
	return (
		<div className="mb-6">
			<h1 className="text-3xl font-bold text-gray-900 mb-2">Meu Perfil</h1>
			<p className="text-gray-600">
				{user.papel === "professor"
					? "Gerencie seus empréstimos e acompanhe suas atividades na biblioteca"
					: "Acompanhe seus empréstimos, reservas e histórico de leitura"}
			</p>
		</div>
	);
}

function StatsSection({ stats, loading, error, userType, onRefresh }) {
	return (
		<div className="mb-8">
			<div className="flex justify-between items-center mb-4">
				<h2 className="text-xl font-semibold text-gray-900">Suas Estatísticas</h2>
				{stats && (
					<div className="flex items-center gap-2 text-sm text-gray-500">
						{stats.fonte === "offline" && (
							<div className="flex items-center gap-1 text-amber-600">
								<AlertTriangle size={14} />
								<span>Dados offline</span>
							</div>
						)}
						{stats.ultimaAtualizacao && (
							<span>Atualizado: {new Date(stats.ultimaAtualizacao).toLocaleTimeString()}</span>
						)}
						<button onClick={onRefresh} className="text-blue-600 hover:text-blue-700 ml-2">Atualizar</button>
					</div>
				)}
			</div>
			{loading ? <StatsLoadingGrid /> : error && !stats ? <StatsErrorState error={error} onRetry={onRefresh} /> : <StatsGrid stats={stats} userType={userType} />}
		</div>
	);
}

function QuickActions({ handleNavigation }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
			<QuickAction icon={<Search size={24} />} title="Pesquisar Livros" description="Encontre livros no acervo" onClick={() => handleNavigation("resultados")}
				ariaLabel="Pesquisar livros" />
			<QuickAction icon={<BookOpen size={24} />} title="Meus Empréstimos" description="Veja suas obras emprestadas" onClick={() => handleNavigation("reservas")}
				ariaLabel="Ver meus empréstimos" />
			<QuickAction icon={<Undo2 size={24} />} title="Renovar Empréstimos" description="Renove o prazo das suas obras" onClick={null} disabled ariaLabel="Renovação indisponível" />
		</div>
	);
}

function QuickAction({ icon, title, description, onClick, disabled, ariaLabel }) {
	return (
		<button
			onClick={onClick}
			className={`bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md hover:border-blue-300 transition-all duration-200 group active:scale-95 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
			disabled={disabled}
			aria-label={ariaLabel}
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

function ProfileInfo({ user, profile }) {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
			<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<div className="w-2 h-2 bg-green-500 rounded-full"></div>
				Informações do Perfil
			</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<InfoCard label="Nome completo" value={user.name || user.nome} />
				<InfoCard label="Email" value={user.email} />
				{user.matricula && <InfoCard label="Matrícula" value={user.matricula} />}
				<InfoCard label="Tipo de usuário" value={user.papel === "professor" ? "Professor" : "Estudante"} valueColor={user.papel === "professor" ? "text-purple-600 font-medium" : "text-blue-600 font-medium"} />
				<InfoCard label="Status da conta" value={profile?.statusConta ? profile.statusConta : <Loader2 className="animate-spin inline w-4 h-4 text-gray-400" />} valueColor="text-green-600 font-medium" />
				<InfoCard label="Membro desde" value={profile?.membroDesde ? profile.membroDesde : <Loader2 className="animate-spin inline w-4 h-4 text-gray-400" />} />
			</div>
		</div>
	);
}

// Adicionar componente Modal simples
function Modal({ open, onClose, title, children }) {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
			<div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative animate-in fade-in duration-200">
				<button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={onClose} aria-label="Fechar modal">×</button>
				<h3 className="font-semibold mb-4 text-lg">{title}</h3>
				<div>{children}</div>
			</div>
		</div>
	);
}

// Atualizar ReservationsSection para usar Modal
function ReservationsSection({ reservations, loading, history, loadingHistory, showHistory, onCancel, onFetchHistory, cancelingId }) {
	const [modalOpen, setModalOpen] = useState(false);
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
			<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<BookOpen size={24} /> Reservas Ativas
			</h2>
			{loading ? (
				<div>Carregando reservas...</div>
			) : reservations.length === 0 ? (
				<div>Nenhuma reserva ativa.</div>
			) : (
				<ul className="divide-y">
					{reservations.map((res) => (
						<li key={res.id} className="py-2 flex justify-between items-center">
							<div>
								<span className="font-medium">{res.tituloLivro}</span> <span className="text-sm text-gray-500">({res.dataReserva})</span>
							</div>
							<button className="px-3 py-1 bg-red-600 text-white rounded text-sm" onClick={() => onCancel(res.id)} disabled={cancelingId === res.id}>
								{cancelingId === res.id ? 'Cancelando...' : 'Cancelar'}
							</button>
						</li>
					))}
				</ul>
			)}
			<button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => { onFetchHistory(); setModalOpen(true); }}>Ver histórico de reservas</button>
			<Modal open={modalOpen && showHistory} onClose={() => setModalOpen(false)} title="Histórico de Reservas">
				{loadingHistory ? (
					<div>Carregando histórico...</div>
				) : history.length === 0 ? (
					<div>Nenhuma reserva anterior encontrada.</div>
				) : (
					<ul className="divide-y">
						{history.map((res) => (
							<li key={res.id} className="py-2 flex justify-between items-center">
								<div>
									<span className="font-medium">{res.tituloLivro}</span> <span className="text-sm text-gray-500">({res.dataReserva} - {res.status})</span>
								</div>
							</li>
						))}
					</ul>
				)}
			</Modal>
		</div>
	);
}

// Atualizar FinesSection para usar Modal
function FinesSection({ fines, loading, history, loadingHistory, showHistory, onPay, onFetchHistory, payingId }) {
	const [modalOpen, setModalOpen] = useState(false);
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
			<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<CoinsIcon size={24} /> Multas Ativas
			</h2>
			{loading ? (
				<div>Carregando multas...</div>
			) : fines.length === 0 ? (
				<div>Nenhuma multa ativa.</div>
			) : (
				<ul className="divide-y">
					{fines.map((fine) => (
						<li key={fine.id} className="py-2 flex justify-between items-center">
							<div>
								<span className="font-medium">{fine.descricao}</span> <span className="text-sm text-gray-500">R$ {fine.valor}</span>
							</div>
							<button className="px-3 py-1 bg-green-600 text-white rounded text-sm" onClick={() => onPay(fine.id)} disabled={payingId === fine.id}>
								{payingId === fine.id ? 'Pagando...' : 'Pagar'}
							</button>
						</li>
					))}
				</ul>
			)}
			<button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => { onFetchHistory(); setModalOpen(true); }}>Ver histórico de multas</button>
			<Modal open={modalOpen && showHistory} onClose={() => setModalOpen(false)} title="Histórico de Multas">
				{loadingHistory ? (
					<div>Carregando histórico...</div>
				) : history.length === 0 ? (
					<div>Nenhuma multa anterior encontrada.</div>
				) : (
					<ul className="divide-y">
						{history.map((fine) => (
							<li key={fine.id} className="py-2 flex justify-between items-center">
								<div>
									<span className="font-medium">{fine.descricao}</span> <span className="text-sm text-gray-500">R$ {fine.valor} - {fine.status}</span>
								</div>
							</li>
						))}
					</ul>
				)}
			</Modal>
		</div>
	);
}

// Componentes utilitários
function NavItem({ icon: Icon, label, onClick }) {
	return (
		<button className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm w-full text-left group active:scale-95" onClick={onClick} aria-label={label}>
			<Icon size={18} className="text-blue-200 group-hover:text-white transition-colors duration-200" />
			<span className="group-hover:text-white transition-colors duration-200">{label}</span>
		</button>
	);
}

function InfoCard({ label, value, valueColor = "text-gray-900" }) {
	let displayValue = value;
	if (typeof value === 'object' && value !== null) {
		displayValue = '';
	}
	return (
		<div className="bg-gray-50 rounded-lg p-3">
			<span className="text-xs text-gray-600 uppercase tracking-wide">{label}</span>
			<p className={`font-medium mt-1 ${valueColor}`}>{displayValue}</p>
		</div>
	);
}

// Estatísticas
function StatsGrid({ stats, userType }) {
	if (!stats) return null;
	const getStatsCards = () => {
		const baseCards = [
			{
				key: "livrosDisponiveis",
				value: stats.livrosDisponiveis,
				label: "Disponível para você",
				desc: `Você ainda pode emprestar ${stats.livrosDisponiveis} livro${stats.livrosDisponiveis !== 1 ? "s" : ""} (limite: ${stats.limiteConcorrente})`,
				icon: <Book size={32} />,
				color: stats.livrosDisponiveis > 0 ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200",
				iconColor: stats.livrosDisponiveis > 0 ? "text-green-600" : "text-orange-600",
			},
			{
				key: "livrosEmprestados",
				value: stats.livrosEmprestados,
				label: "Emprestados",
				desc: `Seus empréstimos ativos`,
				icon: <BookOpen size={32} />,
				color: "bg-blue-50 border-blue-200",
				iconColor: "text-blue-600",
			},
			{
				key: "devolucoesPendentes",
				value: stats.devolucoesPendentes,
				label: "Devoluções",
				desc: "Pendências de devolução",
				icon: <Undo2 size={32} />,
				color: stats.devolucoesPendentes > 0 ? "bg-yellow-50 border-yellow-200" : "bg-gray-50 border-gray-200",
				iconColor: stats.devolucoesPendentes > 0 ? "text-yellow-600" : "text-gray-600",
			},
		];
		if (userType === "professor") {
			baseCards.push({
				key: "bibliografiasGerenciadas",
				value: stats.bibliografiasGerenciadas || 0,
				label: "Bibliografias",
				desc: "Listas gerenciadas por você",
				icon: <Users size={32} />,
				color: "bg-purple-50 border-purple-200",
				iconColor: "text-purple-600",
			});
		} else {
			baseCards.push({
				key: "multasPendentes",
				value: stats.multasPendentes,
				label: "Multas",
				desc: "Pendências financeiras",
				icon: <CoinsIcon size={32} />,
				color: stats.multasPendentes > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-200",
				iconColor: stats.multasPendentes > 0 ? "text-red-600" : "text-gray-600",
			});
		}
		return baseCards;
	};
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{getStatsCards().map(({ key, ...card }) => (
				<StatCard key={key} {...card} />
			))}
		</div>
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

function StatsErrorState({ error, onRetry }) {
	let msg = error;
	if (msg && msg.match(/duplicate key|E11000|stack|index|collection|Mongo/gi)) {
		msg = 'Erro ao carregar dados do perfil. Tente novamente.';
	}
	return (
		<div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
			<div className="flex items-center justify-center gap-2 text-red-600 mb-2">
				<AlertTriangle size={24} />
				<h3 className="font-semibold">Erro ao carregar estatísticas</h3>
			</div>
			<p className="text-red-700 text-sm mb-4">{msg}</p>
			<button onClick={onRetry} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">Tentar novamente</button>
		</div>
	);
}

// Novo componente MobileSidebar
function MobileSidebar({ user, open, onClose, handleNavigation }) {
	const avatarUrl = user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Usuário')}&background=3B82F6&color=fff&size=128`;
	return (
		<div className={`fixed inset-0 z-50 transition-all duration-300 ${open ? 'block' : 'pointer-events-none'}`}
			style={{ display: open ? 'block' : 'none' }}>
			{/* Overlay */}
			<div className="absolute inset-0 bg-black bg-opacity-40" onClick={onClose}></div>
			{/* Drawer */}
			<aside className={`absolute left-0 top-0 h-full w-64 bg-blue-700 text-white shadow-lg transform ${open ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300`}>
				<div className="flex flex-col items-center py-6">
					<img
						src={avatarUrl}
						alt="Avatar do usuário"
						className="w-16 h-16 rounded-full border-2 border-white mb-2"
					/>
					<span className="font-semibold text-lg mb-1">{user.name}</span>
					{user.matricula && <span className="text-xs text-blue-200">Mat: {user.matricula}</span>}
					{user.email && <span className="text-xs text-blue-200">{user.email}</span>}
				</div>
				<nav className="flex flex-col gap-2 px-6 mt-4">
					<span className="text-xs mb-1 text-blue-200">BIBLIOTECA</span>
					<NavItem icon={Home} label="Início" onClick={() => handleNavigation("home")}/>
					<NavItem icon={Search} label="Pesquisar" onClick={() => handleNavigation("resultados")}/>
					<NavItem icon={BookOpen} label="Empréstimos" onClick={() => handleNavigation("reservas")}/>
				</nav>
				<button className="absolute top-2 right-2 text-white text-2xl" onClick={onClose} aria-label="Fechar menu">×</button>
			</aside>
		</div>
	);
}
