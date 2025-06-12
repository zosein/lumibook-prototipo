import { useState, useEffect } from 'react';
import { Book, Info } from 'lucide-react';
import CatalogService from '../services/CatalogService';
import * as ReservationService from '../services/ReservationService';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function BookDetails({ setCurrentPage, bookId, navigateToDetails }) {
  const [livro, setLivro] = useState(null);
  const [obrasRelacionadas, setObrasRelacionadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const bookData = await CatalogService.getBookById(bookId);
        setLivro(bookData);
        // Só busca relacionados se o livro existe
        try {
          const relatedBooks = await CatalogService.getRelatedBooks(bookId);
          setObrasRelacionadas(Array.isArray(relatedBooks) ? relatedBooks : []);
        } catch (relatedErr) {
          setObrasRelacionadas([]);
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Livro não encontrado. Ele pode ter sido removido do acervo.');
        } else {
          setError('Erro ao carregar livro.');
        }
        setLivro(null);
        setObrasRelacionadas([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [bookId]);

  // Função para atualizar detalhes do livro após operação
  const atualizarLivro = async () => {
    try {
      const bookData = await CatalogService.getBookById(bookId);
      setLivro(bookData);
    } catch {}
  };

  // Função de empréstimo
  const handleLoan = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('userData'));
      
      // Primeiro, criar uma reserva
      const reservationPayload = {
        usuarioId: user.id,
        livroId: livro.id,
        tituloLivro: livro.titulo
      };
      
      const reservationRes = await ReservationService.createReservation(reservationPayload, token);
      
      if (reservationRes.success) {
        toast.success('Livro reservado com sucesso! Redirecionando para suas reservas...');
        if (typeof setCurrentPage === 'function') setCurrentPage('reservas');
      } else {
        toast.error(reservationRes.message || 'Erro ao reservar livro.');
      }
    } catch (err) {
      if (err.message && err.message.includes('Não há exemplares disponíveis')) {
        toast.info('Não há exemplares disponíveis. Você pode reservar este livro.');
        atualizarLivro();
      } else {
        toast.error('Erro ao reservar livro: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Função de reserva
  const handleReserve = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const user = JSON.parse(localStorage.getItem('userData'));
      
      const payload = {
        usuarioId: user.id,
        livroId: livro.id,
        tituloLivro: livro.titulo
      };
      
      const res = await ReservationService.createReservation(payload, token);
      
      if (res.success) {
        toast.success('Livro reservado com sucesso! Redirecionando para suas reservas...');
        if (typeof setCurrentPage === 'function') setCurrentPage('reservas');
        // Atualizar estatísticas
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('atualizar-estatisticas'));
        }
      }
    } catch (err) {
      console.error('Erro na reserva:', err);
      toast.error('Erro ao reservar livro: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="font-medium text-gray-600">Carregando detalhes...</p>
        </div>
      </div>
    );
  }

  if (error || !livro) {
    return (
      <div className="p-4">
        <button 
          className="mb-4 flex items-center gap-1 text-blue-600" 
          onClick={() => setCurrentPage('resultados')}
        >
          ← Voltar aos resultados
        </button>
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
          <Info size={40} className="mx-auto mb-2 text-red-400" />
          <p className="font-medium text-red-600">Erro ao carregar livro</p>
          <p className="text-sm text-gray-500 mt-1">{error || 'Livro não encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <button 
        className="mb-4 flex items-center gap-1 text-blue-600" 
        onClick={() => setCurrentPage('resultados')}
      >
        ← Voltar aos resultados
      </button>
      <div className="bg-white border border-gray-200 rounded-md p-4">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/4 flex justify-center">
            <div className="w-56 h-80 bg-gray-200 rounded overflow-hidden p-0 m-0 flex items-center justify-center">
              <img
                src={livro.capa || `https://covers.openlibrary.org/b/isbn/${livro.isbn}-L.jpg`}
                alt={livro.titulo}
                className="object-contain w-full h-full rounded-none p-0 m-0"
                onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Livro&background=3B82F6&color=fff&size=128'; }}
              />
            </div>
          </div>
          <div className="md:w-3/4">
            <h1 className="text-xl font-bold mb-1">{livro.titulo}</h1>
            <p className="text-gray-600 mb-3">
              {(livro.autor || (Array.isArray(livro.autores) ? livro.autores[0] : '')) || 'Autor desconhecido'}, {livro.ano}
            </p>
            <div className="flex gap-2 mb-4">
              <span className={`text-sm px-2 py-0.5 rounded ${livro.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {livro.disponivel ? 'Disponível' : 'Indisponível'}
              </span>
              <span className="bg-blue-100 text-blue-800 text-sm px-2 py-0.5 rounded">
                {livro.tipo}
              </span>
            </div>
            <div className="mb-4">
              <h2 className="font-medium mb-2">Resumo</h2>
              <p className="text-gray-700">{livro.resumo || 'Resumo não disponível.'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-6">
              <div>
                <h3 className="font-medium text-sm text-gray-600">ISBN</h3>
                <p>{livro.isbn || 'Não informado'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Edição</h3>
                <p>{livro.edicao || 'Não informado'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Editora</h3>
                <p>{livro.editora || 'Não informado'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Idioma</h3>
                <p>{livro.idioma || 'Não informado'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Páginas</h3>
                <p>{livro.paginas || 'Não informado'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Categoria</h3>
                <p>{livro.categoria || 'Não informado'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Localização</h3>
                <p>{livro.localizacao || 'Não informado'}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Exemplares</h3>
                {(Number(livro.exemplares?.disponiveis) === 0 && Number(livro.exemplares?.total) === 0) ? (
                  <p>Nenhum exemplar disponível</p>
                ) : (
                  <p>{livro.exemplares?.disponiveis ?? 0} disponível{Number(livro.exemplares?.disponiveis) !== 1 ? 's' : ''} ({livro.exemplares?.total ?? 0} total)</p>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              {/* Botão de Reserva: sempre disponível */}
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition" 
                onClick={handleReserve}
              >
                Reservar
              </button>
              {livro.tipo === "E-book" && (
                <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded">Download (E-book)</button>
              )}
              <button className="px-4 py-2 border border-gray-300 rounded flex items-center gap-1">
                <Info size={16} /> Solicitar ajuda
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-medium mb-2">Obras relacionadas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {obrasRelacionadas.map((item, idx) => (
            <div 
              key={item.id || item._id || `relacionado-${idx}`} 
              className="bg-white border border-gray-200 rounded-md p-3 hover:shadow-md cursor-pointer"
              onClick={() => navigateToDetails(item.id)}
            >
              <div className="flex justify-center mb-2">
                <div className="bg-gray-200 p-3 rounded">
                  <Book size={30} className="text-gray-500" />
                </div>
              </div>
              <h3 className="font-medium text-center text-sm mb-1">{item.titulo}</h3>
              <p className="text-xs text-center text-gray-600">{item.autor}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}