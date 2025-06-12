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
      const res = await LoanService.returnLoan(loanId, undefined, token);
      if (res && res.success) {
        alert('Devolução realizada com sucesso!');
        fetchLoans();
        window.dispatchEvent(new Event('atualizar-estatisticas'));
      } else if (res && res.message) {
        alert(res.message);
        fetchLoans();
      } else {
        alert('Erro ao devolver empréstimo.');
        fetchLoans();
      }
    } catch (err) {
      alert('Erro ao devolver empréstimo: ' + (err.response?.data?.message || err.message));
      fetchLoans();
    } finally {
      setReturningId(null);
    }
  };

  const handleRenew = async (loanId) => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await LoanService.renewLoan(loanId, token);
      if (res && res.success) {
        alert('Renovação realizada com sucesso!');
        fetchLoans();
      } else if (res && res.message) {
        alert(res.message);
        fetchLoans();
      } else {
        alert('Erro ao renovar empréstimo.');
        fetchLoans();
      }
    } catch (err) {
      alert('Erro ao renovar empréstimo: ' + (err.response?.data?.message || err.message));
      fetchLoans();
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
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col sm:flex-row gap-6 items-center w-full max-w-2xl mx-auto mb-6 transition hover:shadow-md">
        <img
          src={loan.capa || `https://covers.openlibrary.org/b/isbn/${loan.isbn}-L.jpg`}
          alt={loan.tituloLivro || loan.titulo || 'Livro'}
          className="w-20 h-28 object-cover rounded-2xl border border-gray-200 bg-gray-50"
          onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=Livro&background=E5E7EB&color=374151&size=128'; }}
        />
        <div className="flex-1 flex flex-col justify-between w-full gap-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{loan.tituloLivro || loan.titulo || 'Livro'}</h3>
            <p className="text-xs text-gray-500 mb-1">{loan.autor}</p>
            <p className="text-xs text-gray-400">Empréstimo: {loan.dataEmprestimo ? new Date(loan.dataEmprestimo).toLocaleDateString() : '-'}</p>
            <p className="text-xs text-gray-400">Devolução: {loan.dataPrevistaDevolucao ? new Date(loan.dataPrevistaDevolucao).toLocaleDateString() : '-'}</p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 ${diasRestantes < 0 ? 'bg-red-50 text-red-500' : diasRestantes === 0 ? 'bg-yellow-50 text-yellow-500' : ''}`}>
              {diasRestantes < 0 ? 'Atrasado' : diasRestantes === 0 ? 'Devolve hoje' : 'Em dia'}
            </span>
            {multa > 0 && (
              <span className="ml-2 text-xs text-red-400 font-medium">Multa: R$ {multa.toFixed(2)}</span>
            )}
            {loan.renovacoes < 2 && (
              <button className="ml-2 flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition text-xs shadow-none border-none" onClick={() => handleRenew(loan._id || loan.id)} title="Renovar">
                <Undo2 size={16} />
              </button>
            )}
            <button
              className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition text-xs shadow-none border-none"
              onClick={() => handleReturn(loan._id || loan.id)}
              disabled={returningId === (loan._id || loan.id)}
              title="Devolver"
            >
              <ArrowLeft size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Foco no input ao abrir pesquisa
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Resumo fixo no topo */}
      <header className="w-full bg-white flex flex-col items-center gap-2 px-4 py-4 shadow-none border-b border-gray-100 sticky top-0 z-20">
        <div className="flex items-center w-full max-w-3xl mx-auto">
          <button onClick={() => setCurrentPage('perfil')} className="text-gray-400 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 mr-2">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 flex items-center justify-center gap-3">
            <BookOpen size={32} className="text-blue-400" />
            <h1 className="text-2xl font-semibold text-gray-800 tracking-tight">Meus Empréstimos</h1>
          </div>
        </div>
        <div className="flex gap-4 mt-2 justify-center w-full max-w-3xl">
          <div className="bg-gray-50 rounded-2xl px-6 py-3 flex flex-col items-center shadow-none border border-gray-100">
            <BookOpen size={24} className="text-blue-400 mb-1" />
            <span className="text-xs text-gray-400">Total</span>
            <span className="text-lg font-semibold text-gray-700">{total}</span>
          </div>
          <div className="bg-gray-50 rounded-2xl px-6 py-3 flex flex-col items-center shadow-none border border-gray-100">
            <AlertTriangle size={24} className="text-red-400 mb-1" />
            <span className="text-xs text-gray-400">Atrasados</span>
            <span className="text-lg font-semibold text-red-400">{atrasados}</span>
          </div>
          <div className="bg-gray-50 rounded-2xl px-6 py-3 flex flex-col items-center shadow-none border border-gray-100">
            <Clock size={24} className="text-yellow-400 mb-1" />
            <span className="text-xs text-gray-400">Devolve hoje</span>
            <span className="text-lg font-semibold text-yellow-400">{devolveHoje}</span>
          </div>
        </div>
        {/* Barra de pesquisa minimalista integrada */}
        <div className="relative mt-3 w-full max-w-3xl flex justify-end mx-auto">
          <div className="flex items-center w-full bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 shadow-none">
            <SearchIcon size={20} className="text-gray-400 mr-2" />
            <input
              ref={searchInputRef}
              type="text"
              className="flex-1 bg-transparent outline-none border-none text-base text-gray-700 placeholder-gray-400"
              placeholder="Buscar nos meus empréstimos..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </header>
      <main className="flex-1 px-2 py-4 w-full flex flex-col items-center bg-white">
        {loading ? (
          <div className="text-center text-blue-400 mt-16 text-lg font-medium">Carregando empréstimos...</div>
        ) : error ? (
          <div className="text-red-400 mb-2 text-center mt-16 text-base">{error}</div>
        ) : filteredLoans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 w-full">
            <div className="w-24 h-24 mb-4 flex items-center justify-center bg-gray-50 rounded-full">
              <BookOpen size={48} className="text-blue-200 opacity-60" />
            </div>
            <div className="text-lg text-gray-600 mb-2 text-center font-medium">Sua estante está vazia!</div>
            <div className="text-sm text-gray-400 mb-6 text-center">Que tal pegar um livro emprestado?</div>
            <button
              className="px-6 py-2 bg-blue-100 hover:bg-blue-200 text-blue-600 font-medium rounded-xl shadow-none border-none transition-all"
              onClick={() => setCurrentPage('home')}
            >
              <BookOpen size={18} className="inline mr-2" />Explorar Catálogo
            </button>
          </div>
        ) : (
          <div className="w-full max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pb-8 justify-items-center mt-4">
            {filteredLoans.map((loan) => (
              <LoanCard key={loan._id || loan.id} loan={loan} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
} 