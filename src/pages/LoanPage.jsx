import { useEffect, useState, useRef } from 'react';
import { ArrowLeft, BookOpen, Undo2, Search as SearchIcon, AlertTriangle, Clock } from 'lucide-react';
import * as LoanService from '../services/LoanService';

export default function LoanPage({ setCurrentPage }) {
  console.log('LoanPage carregada!');
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef();

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await LoanService.getActiveLoans(localStorage.getItem('authToken'));
      setLoans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Erro ao buscar empréstimos.');
      setLoans([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId) => {
    setReturningId(loanId);
    try {
      const token = localStorage.getItem('authToken');
      await LoanService.returnLoan(loanId, token);
      fetchLoans();
      window.dispatchEvent(new Event('atualizar-estatisticas'));
    } catch (err) {
      setError('Erro ao devolver empréstimo.');
    } finally {
      setReturningId(null);
    }
  };

  const handleRenew = async (loanId) => {
  try {
    const token = localStorage.getItem('authToken');
    await LoanService.renewLoan(loanId, token);
    fetchLoans();
  } catch (err) {
    setError(err.message);
  }
};

  // Filtro de pesquisa
  const filteredLoans = loans.filter(loan => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      (loan.tituloLivro || loan.titulo || '').toLowerCase().includes(q) ||
      (loan.autor || '').toLowerCase().includes(q)
    );
  });

  // Resumo
  const total = filteredLoans.length;
  const atrasados = filteredLoans.filter(l => {
    const { diasRestantes } = calcularDiasEMulta(l.dataPrevistaDevolucao);
    return diasRestantes < 0;
  }).length;
  const devolveHoje = filteredLoans.filter(l => {
    const { diasRestantes } = calcularDiasEMulta(l.dataPrevistaDevolucao);
    return diasRestantes === 0;
  }).length;

  // Função para calcular dias restantes e multa
  function calcularDiasEMulta(dataPrevistaDevolucao) {
    if (!dataPrevistaDevolucao) return { diasRestantes: null, multa: 0 };
    const hoje = new Date();
    const devolucao = new Date(dataPrevistaDevolucao);
    const diff = Math.ceil((devolucao - hoje) / (1000 * 60 * 60 * 24));
    const diasRestantes = diff;
    const multa = diff < 0 ? Math.abs(diff) * 1 : 0; // R$1 por dia de atraso
    return { diasRestantes, multa };
  }

  // Novo Card Clean
  function LoanCard({ loan }) {
    const { diasRestantes, multa } = calcularDiasEMulta(loan.dataPrevistaDevolucao);
    return (
      <div className="bg-white rounded-xl shadow border p-4 flex flex-col sm:flex-row gap-4 items-center w-full max-w-xl mx-auto">
        <img
          src={loan.capa || `https://covers.openlibrary.org/b/isbn/${loan.isbn}-L.jpg`}
          alt={loan.tituloLivro || loan.titulo || 'Livro'}
          className="w-20 h-28 object-cover rounded border"
          onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=Livro&background=3B82F6&color=fff&size=128'; }}
        />
        <div className="flex-1 flex flex-col justify-between w-full">
          <div>
            <h3 className="text-base font-bold text-blue-900 mb-1">{loan.tituloLivro || loan.titulo || 'Livro'}</h3>
            <p className="text-xs text-gray-600 mb-1">{loan.autor}</p>
            <p className="text-xs text-gray-500">Empréstimo: {loan.dataEmprestimo ? new Date(loan.dataEmprestimo).toLocaleDateString() : '-'}</p>
            <p className="text-xs text-gray-500">Devolução: {loan.dataPrevistaDevolucao ? new Date(loan.dataPrevistaDevolucao).toLocaleDateString() : '-'}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold
              ${diasRestantes < 0 ? 'bg-red-100 text-red-800' : diasRestantes === 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
              {diasRestantes < 0 ? 'Atrasado' : diasRestantes === 0 ? 'Devolve hoje' : 'Em dia'}
            </span>
            {multa > 0 && (
              <span className="ml-2 text-xs text-red-600 font-semibold">Multa: R$ {multa.toFixed(2)}</span>
            )}
            {loan.renovacoes < 2 && (
              <button className='ml-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition text-xs' onClick={() => handleRenew(loan._id || loan.id)}>
                Renovar
              </button>
            )}
            <button
              className="ml-auto px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs"
              onClick={() => handleReturn(loan._id || loan.id)}
              disabled={returningId === (loan._id || loan.id)}
            >
              {returningId === (loan._id || loan.id) ? 'Devolvendo...' : 'Devolver'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Foco no input ao abrir pesquisa
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-900 via-blue-700 to-blue-100">
      {/* Resumo fixo no topo */}
      <header className="w-full bg-gradient-to-r from-blue-800 to-blue-600 flex flex-col items-center gap-2 px-4 py-6 shadow-lg sticky top-0 z-20">
        <div className="flex items-center w-full max-w-2xl">
          <button onClick={() => setCurrentPage('perfil')} className="text-white p-2 rounded hover:bg-blue-500 transition-all duration-200 mr-2">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 flex items-center justify-center gap-3">
            <BookOpen size={36} className="text-yellow-300 drop-shadow" />
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Meus Empréstimos</h1>
          </div>
        </div>
        <div className="flex gap-6 mt-4">
          <div className="bg-white/80 rounded-lg px-6 py-3 flex flex-col items-center shadow-lg">
            <BookOpen size={28} className="text-blue-700 mb-1" />
            <span className="text-xs text-gray-500">Total</span>
            <span className="text-lg font-bold text-blue-900">{total}</span>
          </div>
          <div className="bg-white/80 rounded-lg px-6 py-3 flex flex-col items-center shadow-lg">
            <AlertTriangle size={28} className="text-red-600 mb-1" />
            <span className="text-xs text-gray-500">Atrasados</span>
            <span className="text-lg font-bold text-red-600">{atrasados}</span>
          </div>
          <div className="bg-white/80 rounded-lg px-6 py-3 flex flex-col items-center shadow-lg">
            <Clock size={28} className="text-yellow-600 mb-1" />
            <span className="text-xs text-gray-500">Devolve hoje</span>
            <span className="text-lg font-bold text-yellow-600">{devolveHoje}</span>
          </div>
        </div>
        {/* Barra de pesquisa minimalista */}
        <div className="relative mt-4 w-full max-w-2xl flex justify-end">
          <button
            className={`bg-white/80 rounded-full p-2 shadow-lg border border-blue-200 transition-all duration-200 ${searchOpen ? 'ring-2 ring-blue-400' : ''}`}
            onClick={() => setSearchOpen(o => !o)}
            aria-label="Buscar empréstimo"
          >
            <SearchIcon size={22} className="text-blue-700" />
          </button>
          {searchOpen && (
            <input
              ref={searchInputRef}
              type="text"
              className="absolute right-0 top-0 w-64 p-2 rounded-lg border border-blue-300 shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-base bg-white z-10"
              placeholder="Buscar nos meus empréstimos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
            />
          )}
        </div>
      </header>
      <main className="flex-1 px-0 py-8 w-full">
        {loading ? (
          <div className="text-center text-blue-700 mt-16">Carregando empréstimos...</div>
        ) : error ? (
          <div className="text-red-600 mb-2 text-center mt-16">{error}</div>
        ) : filteredLoans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <img src="https://cdn.jsdelivr.net/gh/edent/SuperTinyIcons/images/svg/book.svg" alt="Estante vazia" className="w-24 h-24 mb-4 opacity-60" />
            <div className="text-lg text-gray-700 mb-2">Sua estante está vazia!</div>
            <div className="text-gray-500 mb-4">Que tal pegar um livro emprestado?</div>
            <button
              className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
              onClick={() => setCurrentPage('resultados')}
            >
              Explorar Catálogo
            </button>
          </div>
        ) : (
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-8">
            {filteredLoans.map((loan) => (
              <LoanCard key={loan._id || loan.id} loan={loan} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 