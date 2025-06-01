import { List, Grid, ChevronDown, BookOpen, AlertCircle } from 'lucide-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import CatalogService from '../services/CatalogService';
import * as ReservationService from '../services/ReservationService';

export default function ResultList({ 
  searchQuery, 
  currentInputQuery, 
  advancedFilters, 
  navigateToDetails, 
  isSearchTriggered 
}) {
  const [viewMode, setViewMode] = useState('lista');
  const [detailsOpen, setDetailsOpen] = useState(null);
  const [lastFilters, setLastFilters] = useState(advancedFilters);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Função para realizar busca na API
  const performSearch = useCallback(async () => {
    if (!isSearchTriggered || !searchQuery) {
      setSearchResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      const params = {
        q: searchQuery,
        tipo: lastFilters.materialType !== 'Todos' ? lastFilters.materialType : undefined,
        categoria: lastFilters.category !== 'Todas' ? lastFilters.category : undefined,
        disponivel: lastFilters.availability !== 'Todos' ? (lastFilters.availability === 'Disponível' ? 'true' : 'false') : undefined,
        ano: lastFilters.publicationYear !== 'Todos' ? lastFilters.publicationYear : undefined,
      };
      // Remove undefined
      Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
      const results = await CatalogService.searchBooks(params, token);
      setSearchResults(results);
    } catch (err) {
      setError('Erro ao realizar busca. Verifique a conexão com o servidor.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [isSearchTriggered, searchQuery, lastFilters]);

  // Atualiza os filtros armazenados apenas quando uma nova busca é disparada
  useEffect(() => {
    if (isSearchTriggered) {
      setLastFilters(advancedFilters);
      performSearch();
    }
  }, [isSearchTriggered, advancedFilters, searchQuery, performSearch]);

  // Usar resultados da API em vez de dados mockados
  const filteredResults = useMemo(() => {
    return searchResults;
  }, [searchResults]);

  // Reset dos detalhes expandidos quando os resultados mudam
  useEffect(() => {
    setDetailsOpen(null);
  }, [filteredResults]);

  const handleReserve = async (bookId) => {
    try {
      const token = localStorage.getItem('authToken');
      await ReservationService.createReservation({ livroId: bookId }, token);
      alert('Reserva realizada com sucesso!');
    } catch (err) {
      alert('Erro ao reservar livro: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-lg font-medium">
          Resultados da Pesquisa
          {searchQuery && isSearchTriggered && (
            <span className="text-sm font-normal ml-2 text-gray-600">
              para "{searchQuery}"
            </span>
          )}
        </h2>
        <div className="flex gap-2">
          <button 
            className={`p-1 ${viewMode === 'lista' ? 'bg-gray-200' : 'bg-white'} rounded`}
            onClick={() => setViewMode('lista')}
          >
            <List size={18} />
          </button>
          <button 
            className={`p-1 ${viewMode === 'grade' ? 'bg-gray-200' : 'bg-white'} rounded`}
            onClick={() => setViewMode('grade')}
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {!isSearchTriggered ? (
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
          <BookOpen size={40} className="mx-auto mb-2 text-gray-400" />
          <p className="font-medium text-gray-600">Faça uma pesquisa</p>
          <p className="text-sm text-gray-500 mt-1">
            Digite sua busca e pressione Enter ou clique no ícone de pesquisa
          </p>
        </div>
      ) : loading ? (
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="font-medium text-gray-600">Buscando...</p>
        </div>
      ) : error ? (
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
          <AlertCircle size={40} className="mx-auto mb-2 text-red-400" />
          <p className="font-medium text-red-600">Erro na busca</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button 
            onClick={performSearch}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-md p-8 text-center">
          <AlertCircle size={40} className="mx-auto mb-2 text-gray-400" />
          <p className="font-medium text-gray-600">Nenhum resultado encontrado</p>
          <p className="text-sm text-gray-500 mt-1">
            Tente modificar sua pesquisa ou os filtros aplicados
          </p>
        </div>
      ) : viewMode === 'lista' ? (
        <div className="bg-white border border-gray-200 rounded-md">
          {filteredResults.map((item) => (
            <div 
              key={item.id} 
              className="p-3 border-b last:border-b-0 hover:bg-gray-50"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{item.titulo}</h3>
                  <p className="text-sm text-gray-600">{item.autor}, {item.ano}</p>
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full mt-1">{item.tipo}</span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`text-sm px-2 py-0.5 rounded ${item.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.disponivel ? 'Disponível' : 'Indisponível'}
                  </span>
                  <button 
                    className="text-blue-600 text-sm flex items-center gap-1"
                    onClick={() => setDetailsOpen(detailsOpen === item.id ? null : item.id)}
                  >
                    Detalhes <ChevronDown size={14} />
                  </button>
                </div>
              </div>
              
              {detailsOpen === item.id && (
                <div className="mt-2 pt-2 border-t text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p><strong>Formato:</strong> {item.tipo}</p>
                      <p><strong>Edição:</strong> {item.edicao || '1ª edição'}</p>
                      <p><strong>Idioma:</strong> {item.idioma || 'Português'}</p>
                    </div>
                    <div>
                      <p><strong>ISBN:</strong> {item.isbn || '978-85-XXXXX-XX-X'}</p>
                      <p><strong>Localização:</strong> {item.localizacao || 'Estante B42'}</p>
                      <p><strong>Categoria:</strong> {item.categoria || 'Ciências Exatas'}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end gap-2">
                    <button 
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                      onClick={() => navigateToDetails(item.id)}
                    >
                      Ver completo
                    </button>
                    {item.disponivel && (
                      <button 
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                        onClick={() => handleReserve(item.id)}
                      >
                        Reservar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filteredResults.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-gray-200 rounded-md p-3 hover:shadow-md cursor-pointer"
              onClick={() => navigateToDetails(item.id)}
            >
              <div className="flex justify-center mb-2">
                <div className="bg-gray-200 p-4 rounded">
                  <BookOpen size={40} className="text-gray-500" />
                </div>
              </div>
              <h3 className="font-medium text-center mb-1">{item.titulo}</h3>
              <p className="text-sm text-center text-gray-600">{item.autor}</p>
              <p className="text-xs text-center text-gray-500">{item.ano} • {item.tipo}</p>
              <div className="mt-2 flex justify-center">
                <span className={`text-sm px-2 py-0.5 rounded ${item.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.disponivel ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
