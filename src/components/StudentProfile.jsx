import { useState, useEffect } from "react";
import {
	Book,
	Home,
	BookOpen,
	Undo2,
	CoinsIcon,
	Search,
	ArrowLeft,
	Loader2,
	Menu,
	Clock,
} from "lucide-react";
import * as ReservationService from '../services/ReservationService';
import FineService from '../services/FineService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as LoanService from '../services/LoanService';
import { getProfileTheme } from '../utils/themeUtils';
import { useUserStats } from '../hooks/useUserStats';
import { useUserProfile } from '../hooks/useUserProfile';

export default function StudentProfile({ user = { name: "ALUNO", avatar: null, papel: "aluno" }, setCurrentPage, isLoggedIn, showReservations = true }) {
	const theme = getProfileTheme(user.papel);
	const [statsKey, setStatsKey] = useState(0);
	const { stats, loading, error } = useUserStats(user, isLoggedIn, statsKey);
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

	// Estados para empréstimos
	const [loans, setLoans] = useState([]);
	const [loadingLoans, setLoadingLoans] = useState(true);
	const [returningId, setReturningId] = useState(null);
	const [borrowingId, setBorrowingId] = useState(null);

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
				const data = await ReservationService.getActiveReservations(user.id);
				setReservations(data);
			} catch (err) {
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

	// Buscar empréstimos ativos
	useEffect(() => {
		async function fetchLoans() {
			setLoadingLoans(true);
			try {
				const data = await LoanService.getActiveLoans(localStorage.getItem('authToken'));
				setLoans(Array.isArray(data) ? data : []);
			} catch {
				setLoans([]);
			} finally {
				setLoadingLoans(false);
			}
		}
		fetchLoans();
	}, []);

	useEffect(() => {
		const atualizar = () => setStatsKey(k => k + 1);
		window.addEventListener('atualizar-estatisticas', atualizar);
		return () => window.removeEventListener('atualizar-estatisticas', atualizar);
	}, []);

	// Handlers auxiliares
	const handleNavigation = (page) => setCurrentPage(page);
	const handleRefreshStats = () => setStatsKey(k => k + 1);

	const [cancelingId, setCancelingId] = useState(null);
	const [payingId, setPayingId] = useState(null);

	const handleCancelReservation = async (reservationId) => {
		setCancelingId(reservationId);
		try {
			await ReservationService.cancelReservation(reservationId);
			toast.success('Reserva cancelada!');
			setReservations(reservations.filter(r => r._id !== reservationId));
		} catch (err) {
			toast.error('Erro ao cancelar reserva: ' + (err.response?.data?.message || err.message));
		} finally {
			setCancelingId(null);
		}
	};

	const fetchReservationHistory = async () => {
		setLoadingReservationHistory(true);
		try {
			const data = await ReservationService.getReservationHistory(user.id);
			setReservationHistory(data);
			setShowReservationHistory(true);
		} catch (err) {
			setReservationHistory([]);
			setShowReservationHistory(true);
		} finally {
			setLoadingReservationHistory(false);
		}
	};

	const handlePayFine = async (fineId) => {
		setPayingId(fineId);
		try {
			await FineService.payFine(fineId);
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
			const data = await FineService.getFineHistory(user.id);
			setFineHistory(data);
			setShowFineHistory(true);
		} catch {
			setFineHistory([]);
			setShowFineHistory(true);
		} finally {
			setLoadingFineHistory(false);
		}
	};

	const handleReturn = async (loanId) => {
		try {
			setReturningId(loanId);
			await LoanService.returnLoan(loanId);
			toast.success('Livro devolvido com sucesso!');
			setLoans(loans.filter(loan => loan._id !== loanId));
		} catch (error) {
			toast.error(error.message || 'Erro ao devolver livro');
		} finally {
			setReturningId(null);
		}
	};

	// Renderização principal
	return (
		<div className="min-h-screen flex flex-col bg-[#f8fafc] animate-in fade-in duration-300">
			<ToastContainer position="top-right" autoClose={3000} hideProgressBar newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
			<header className={`w-full bg-blue-600 flex items-center justify-between px-8 py-6 shadow-xl rounded-b-3xl`}>
				<div className="flex items-center gap-4">
					<button className="sm:hidden flex items-center text-white p-2 mr-2" onClick={() => setMobileMenuOpen(true)} aria-label="Abrir menu">
						<Menu size={28} />
					</button>
					<button
						onClick={() => handleNavigation("home")}
						className="hidden sm:flex items-center gap-2 text-white hover:text-[#f472b6] transition-all duration-200 p-2 rounded-lg hover:bg-[#2563eb]/70 active:scale-95"
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
					<div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-4 border-[#f472b6] shadow-2xl">
						{theme.icon}
					</div>
					<span className="font-semibold text-lg text-white drop-shadow">{user.name || user.nome}</span>
				</div>
			</header>
			<MobileSidebar user={user} open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} handleNavigation={(page) => { setMobileMenuOpen(false); handleNavigation(page); }} />
			<div className="flex flex-1">
				<aside className="hidden sm:flex flex-col bg-blue-700 w-72 px-8 py-10 text-white shadow-2xl rounded-r-3xl">
					<div className="flex flex-col items-center mb-10">
						<div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-[#f472b6] shadow-xl">
							{theme.icon}
						</div>
						<span className="mt-4 text-lg font-bold">{user.name || user.nome}</span>
						<span className="text-xs text-[#fbbf24]">{user.email}</span>
					</div>
					<nav className="flex flex-col gap-2 mt-6">
						<span className="text-xs mb-1 text-[#fbbf24]">BIBLIOTECA</span>
						<NavItem icon={Home} label="Início" onClick={() => handleNavigation("home")} />
						<NavItem icon={Search} label="Pesquisar" onClick={() => handleNavigation("resultados")} />
						<NavItem icon={BookOpen} label="Empréstimos" onClick={() => handleNavigation("emprestimos")} />
						<NavItem icon={BookOpen} label="Reservas" onClick={() => handleNavigation("reservas")} />
					</nav>
				</aside>
				<main className="flex-1 p-4 sm:p-10 bg-[#f8fafc]">
					<div className="max-w-6xl mx-auto">
						<div className="mb-8">
							<h1 className="text-4xl font-extrabold text-[#1e293b] mb-2">Meu Perfil</h1>
							<p className="text-[#64748b] text-lg">{theme.frase}</p>
						</div>
						<StatsSection
							stats={stats}
							loading={loading || loadingLoans}
							error={error}
							userType={user.papel}
							onRefresh={handleRefreshStats}
							loans={loans}
						/>
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
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-xl font-semibold mb-4">Meus Empréstimos</h2>

							{/* Seção de Reservas Disponíveis para Empréstimo */}
							{reservations.length > 0 && (
								<div className="mb-8">
									<h3 className="text-lg font-medium mb-3">Reservas Disponíveis para Empréstimo</h3>
									<div className="space-y-4">
										{reservations.map((reservation) => (
											reservation.livro ? (
												<div key={reservation._id} className="border rounded-lg p-4 bg-blue-50">
													<div className="flex justify-between items-start">
														<div>
															<h4 className="font-medium">{reservation.livro?.title || reservation.livro?.titulo || reservation.tituloLivro || 'Título não disponível'}</h4>
															<p className="text-sm text-gray-600">
																Reservado em: {new Date(reservation.dataReserva).toLocaleDateString()}
															</p>
														</div>
														<button
															onClick={async () => {
																try {
																	setBorrowingId(reservation._id);
																	const token = localStorage.getItem('authToken');
																	await LoanService.createLoan({
																		usuarioId: user.id,
																		livroId: reservation.livro.id || reservation.livro._id,
																		tituloLivro: reservation.livro.title || reservation.livro.titulo || reservation.tituloLivro
																	}, token);
																	toast.success('Livro emprestado com sucesso!');
																	setCurrentPage('emprestimos');
																	window.dispatchEvent(new Event('atualizar-estatisticas'));
																} catch (err) {
																	toast.error('Erro ao realizar empréstimo: ' + (err.response?.data?.message || err.message));
																} finally {
																	setBorrowingId(null);
																}
															}}
															disabled={borrowingId === reservation._id}
															className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
														>
															{borrowingId === reservation._id ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																'Realizar Empréstimo'
															)}
														</button>
													</div>
												</div>
											) : (
												<div key={reservation._id} className="border rounded-lg p-4 bg-blue-50 text-gray-500">
													<div>Livro não disponível para esta reserva.</div>
												</div>
											)
										))}
									</div>
								</div>
							)}

							{/* Lista de Empréstimos Ativos */}
							{loadingLoans ? (
								<div className="flex justify-center items-center py-4">
									<Loader2 className="h-6 w-6 animate-spin text-blue-500" />
								</div>
							) : loans.length === 0 ? (
								<p className="text-gray-500 text-center py-4">Nenhum empréstimo ativo</p>
							) : (
								<div className="space-y-4">
									{loans.map((loan) => (
										loan.livro ? (
											<div key={loan._id} className="border rounded-lg p-4">
												<div className="flex justify-between items-start">
													<div>
														<h3 className="font-medium">{loan.livro?.title || loan.livro?.titulo || 'Título não disponível'}</h3>
														<p className="text-sm text-gray-600">
															Emprestado em: {new Date(loan.dataEmprestimo).toLocaleDateString()}
														</p>
														<p className="text-sm text-gray-600">
															Devolução prevista: {new Date(loan.dataPrevistaDevolucao).toLocaleDateString()}
														</p>
													</div>
													<button
														onClick={() => handleReturn(loan._id)}
														disabled={returningId === loan._id}
														className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
													>
														{returningId === loan._id ? (
															<Loader2 className="h-4 w-4 animate-spin" />
														) : (
															'Devolver'
														)}
													</button>
												</div>
											</div>
										) : (
											<div key={loan._id} className="border rounded-lg p-4 text-gray-500">
												<div>Livro não disponível para este empréstimo.</div>
											</div>
										)
									))}
								</div>
							)}
						</div>
					</div>
				</main>
			</div>
		</div>
	);
}

// Componentes auxiliares extraídos para clareza
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
function StatsSection({ stats, loading }) {
	if (loading) {
		return (
			<div className="bg-white rounded-lg shadow p-6">
				<div className="flex justify-center items-center py-4">
					<Loader2 className="h-6 w-6 animate-spin text-blue-500" />
				</div>
			</div>
		);
	}

	if (!stats || !stats.user) {
		return (
			<div className="bg-white rounded-lg shadow p-6">
				<p className="text-gray-500 text-center py-4">Nenhuma estatística disponível</p>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h2 className="text-xl font-semibold mb-6">Estatísticas</h2>

			{/* Informações do Usuário */}
			<div className="mb-8">
				<h3 className="text-lg font-medium mb-4">Informações do Usuário</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="bg-gray-50 p-4 rounded-lg">
						<p className="text-sm text-gray-600">Nome</p>
						<p className="font-medium">{stats.user?.nome || 'N/A'}</p>
					</div>
					<div className="bg-gray-50 p-4 rounded-lg">
						<p className="text-sm text-gray-600">Papel</p>
						<p className="font-medium capitalize">{stats.user?.papel || 'N/A'}</p>
					</div>
					<div className="bg-gray-50 p-4 rounded-lg">
						<p className="text-sm text-gray-600">Membro desde</p>
						<p className="font-medium">{stats.user?.dataRegistro ? new Date(stats.user.dataRegistro).toLocaleDateString() : 'N/A'}</p>
					</div>
				</div>
			</div>

			{/* Empréstimos */}
			<div className="mb-8">
				<h3 className="text-lg font-medium mb-4">Empréstimos</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					<div className="bg-blue-50 p-4 rounded-lg">
						<p className="text-sm text-blue-600">Total de Empréstimos</p>
						<p className="text-2xl font-bold text-blue-700">{stats.emprestimos?.total || 0}</p>
					</div>
					<div className="bg-green-50 p-4 rounded-lg">
						<p className="text-sm text-green-600">Empréstimos Ativos</p>
						<p className="text-2xl font-bold text-green-700">{stats.emprestimos?.ativos || 0}</p>
					</div>
					<div className="bg-purple-50 p-4 rounded-lg">
						<p className="text-sm text-purple-600">Empréstimos Concluídos</p>
						<p className="text-2xl font-bold text-purple-700">{stats.emprestimos?.concluidos || 0}</p>
					</div>
					<div className="bg-red-50 p-4 rounded-lg">
						<p className="text-sm text-red-600">Empréstimos Atrasados</p>
						<p className="text-2xl font-bold text-red-700">{stats.emprestimos?.atrasados || 0}</p>
					</div>
					<div className="bg-yellow-50 p-4 rounded-lg">
						<p className="text-sm text-yellow-600">Tempo Médio (dias)</p>
						<p className="text-2xl font-bold text-yellow-700">{stats.emprestimos?.tempoMedio?.toFixed(1) || '0.0'}</p>
					</div>
				</div>
			</div>

			{/* Multas */}
			<div className="mb-8">
				<h3 className="text-lg font-medium mb-4">Multas</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div className="bg-red-50 p-4 rounded-lg">
						<p className="text-sm text-red-600">Total de Multas</p>
						<p className="text-2xl font-bold text-red-700">{stats.multas?.total || 0}</p>
					</div>
					<div className="bg-orange-50 p-4 rounded-lg">
						<p className="text-sm text-orange-600">Multas Pendentes</p>
						<p className="text-2xl font-bold text-orange-700">{stats.multas?.pendentes || 0}</p>
					</div>
					<div className="bg-green-50 p-4 rounded-lg">
						<p className="text-sm text-green-600">Multas Pagas</p>
						<p className="text-2xl font-bold text-green-700">{stats.multas?.pagas || 0}</p>
					</div>
					<div className="bg-yellow-50 p-4 rounded-lg">
						<p className="text-sm text-yellow-600">Valor Pendente</p>
						<p className="text-2xl font-bold text-yellow-700">R$ {stats.multas?.valorPendente?.toFixed(2) || '0.00'}</p>
					</div>
				</div>
			</div>

			{/* Reservas */}
			<div className="mb-8">
				<h3 className="text-lg font-medium mb-4">Reservas</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div className="bg-blue-50 p-4 rounded-lg">
						<p className="text-sm text-blue-600">Total de Reservas</p>
						<p className="text-2xl font-bold text-blue-700">{stats.reservas?.total || 0}</p>
					</div>
					<div className="bg-green-50 p-4 rounded-lg">
						<p className="text-sm text-green-600">Reservas Ativas</p>
						<p className="text-2xl font-bold text-green-700">{stats.reservas?.ativas || 0}</p>
					</div>
					<div className="bg-purple-50 p-4 rounded-lg">
						<p className="text-sm text-purple-600">Reservas Concluídas</p>
						<p className="text-2xl font-bold text-purple-700">{stats.reservas?.concluidas || 0}</p>
					</div>
					<div className="bg-red-50 p-4 rounded-lg">
						<p className="text-sm text-red-600">Reservas Canceladas</p>
						<p className="text-2xl font-bold text-red-700">{stats.reservas?.canceladas || 0}</p>
					</div>
				</div>
			</div>

			{/* Biblioteca */}
			<div>
				<h3 className="text-lg font-medium mb-4">Biblioteca</h3>
				<div className="bg-gray-50 p-4 rounded-lg">
					<p className="text-sm text-gray-600">Total de Livros Disponíveis</p>
					<p className="text-2xl font-bold text-gray-700">{stats.biblioteca?.livrosDisponiveis || 0}</p>
				</div>
			</div>
		</div>
	);
}

function QuickActions({ handleNavigation }) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
			<QuickAction icon={<Search size={24} />} title="Pesquisar Livros" description="Encontre livros no acervo" onClick={() => handleNavigation("resultados")}
				ariaLabel="Pesquisar livros" />
			<QuickAction icon={<BookOpen size={24} />} title="Meus Empréstimos" description="Veja suas obras emprestadas" onClick={() => handleNavigation("emprestimos")}
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
				<InfoCard label="Membro desde" value={profile?.membroDesde ? profile.membroDesde : "Desconhecido"} />
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
	const [borrowingId, setBorrowingId] = useState(null);

	const handleBorrow = async (reservationId) => {
		try {
			setBorrowingId(reservationId);
			await LoanService.createLoan(reservationId);
			toast.success('Livro emprestado com sucesso!');
			// Atualizar a lista de reservas
			onFetchHistory();
		} catch (error) {
			toast.error(error.message || 'Erro ao realizar empréstimo');
		} finally {
			setBorrowingId(null);
		}
	};

	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h2 className="text-xl font-semibold mb-4">Minhas Reservas</h2>
			
			{loading ? (
				<div className="flex justify-center items-center py-4">
					<Loader2 className="h-6 w-6 animate-spin text-blue-500" />
				</div>
			) : reservations.length === 0 ? (
				<p className="text-gray-500 text-center py-4">Nenhuma reserva ativa</p>
			) : (
				<div className="space-y-4">
					{reservations.map((reservation) => (
						<div key={reservation._id} className="border rounded-lg p-4">
							<div className="flex justify-between items-start">
								<div>
									<h3 className="font-medium">{reservation.livro?.title || reservation.livro?.titulo || reservation.tituloLivro || 'Título não disponível'}</h3>
									<p className="text-sm text-gray-600">
										Reservado em: {new Date(reservation.dataReserva).toLocaleDateString()}
									</p>
									<p className="text-sm text-gray-600">
										Status: {reservation.status}
									</p>
								</div>
								<div className="flex space-x-2">
									{reservation.status === 'disponivel' && (
										<button
											onClick={() => handleBorrow(reservation._id)}
											disabled={borrowingId === reservation._id}
											className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
										>
											{borrowingId === reservation._id ? (
												<Loader2 className="h-4 w-4 animate-spin" />
											) : (
												'Emprestar'
											)}
										</button>
									)}

									<button
										onClick={() => onCancel(reservation._id)}
										disabled={cancelingId === reservation._id}
										className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
									>
										{cancelingId === reservation._id ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											'Cancelar'
										)}
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Histórico de Reservas */}
			<div className="mt-6">
				<button
					onClick={onFetchHistory}
					className="text-blue-500 hover:text-blue-600 flex items-center"
				>
					<Clock className="h-4 w-4 mr-1" />
					{showHistory ? 'Ocultar Histórico' : 'Ver Histórico'}
				</button>

				{showHistory && (
					<div className="mt-4">
						{loadingHistory ? (
							<div className="flex justify-center items-center py-4">
								<Loader2 className="h-6 w-6 animate-spin text-blue-500" />
							</div>
						) : history.length === 0 ? (
							<p className="text-gray-500 text-center py-4">Nenhum histórico de reservas</p>
						) : (
							<div className="space-y-4">
								{history.map((reservation) => (
									<div key={reservation._id} className="border rounded-lg p-4">
										<h3 className="font-medium">{reservation.livro?.title || reservation.livro?.titulo || reservation.tituloLivro || 'Título não disponível'}</h3>
										<p className="text-sm text-gray-600">
											Reservado em: {new Date(reservation.dataReserva).toLocaleDateString()}
										</p>
										<p className="text-sm text-gray-600">
											Status: {reservation.status}
										</p>
									</div>
								))}
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}

// Atualizar FinesSection para usar Modal
function FinesSection({ fines, loading, history, loadingHistory, showHistory, onPay, onFetchHistory, payingId }) {
	const [modalOpen, setModalOpen] = useState(false);
	const finesSafe = Array.isArray(fines) ? fines : [];
	const historySafe = Array.isArray(history) ? history : [];
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
			<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
				<CoinsIcon size={24} /> Multas
			</h2>
			{loading ? (
				<div>Carregando multas...</div>
			) : finesSafe.length === 0 ? (
				<div>Nenhuma multa pendente.</div>
			) : (
				<ul className="divide-y">
					{finesSafe.map((fine) => (
						<li key={fine.id} className="py-2 flex justify-between items-center">
							<div>
								<span className="font-medium">R$ {fine.valor?.toFixed(2)}</span> <span className="text-sm text-gray-500">{fine.motivo}</span>
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
				) : historySafe.length === 0 ? (
					<div>Nenhuma multa anterior encontrada.</div>
				) : (
					<ul className="divide-y">
						{historySafe.map((fine) => (
							<li key={fine.id} className="py-2 flex justify-between items-center">
								<div>
									<span className="font-medium">R$ {fine.valor?.toFixed(2)}</span> <span className="text-sm text-gray-500">{fine.motivo}</span>
								</div>
							</li>
						))}
					</ul>
				)}
			</Modal>
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
					<NavItem icon={BookOpen} label="Empréstimos" onClick={() => handleNavigation("emprestimos")}/>
					<NavItem icon={BookOpen} label="Reservas" onClick={() => handleNavigation("reservas")}/>
				</nav>
				<button className="absolute top-2 right-2 text-white text-2xl" onClick={onClose} aria-label="Fechar menu">×</button>
			</aside>
		</div>
	);
}
