import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { List, Grid, BookOpen, AlertCircle } from 'lucide-react';
import CatalogService from '../services/CatalogService';
import CatalogGrid from './CatalogGrid';

export default function ResultList({ 
  searchQuery, 
  currentInputQuery, 
  advancedFilters, 
  navigateToDetails, 
  isSearchTriggered 
}) {
  const [viewMode, setViewMode] = useState('lista');
  const [lastFilters, setLastFilters] = useState(advancedFilters);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const performSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      let results = [];
      if (!isSearchTriggered || !searchQuery) {
        // Busca todos os livros do banco
        const response = await CatalogService.getBooks();
        results = response.data || response;
      } else {
        // Busca com filtros
        const params = {
          q: searchQuery,
          tipo: lastFilters.materialType !== 'Todos' ? lastFilters.materialType : undefined,
          categoria: lastFilters.category !== 'Todas' ? lastFilters.category : undefined,
          disponivel: lastFilters.availability !== 'Todos' ? (lastFilters.availability === 'Disponível' ? 'true' : 'false') : undefined,
          ano: lastFilters.publicationYear !== 'Todos' ? lastFilters.publicationYear : undefined,
        };
        Object.keys(params).forEach(key => params[key] === undefined && delete params[key]);
        results = await CatalogService.searchBooks(params, token);
      }
      setSearchResults(results);
    } catch (err) {
      setError('Erro ao realizar busca. Verifique a conexão com o servidor.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, [isSearchTriggered, searchQuery, lastFilters]);

  useEffect(() => {
    if (isSearchTriggered) {
      setLastFilters(advancedFilters);
      performSearch();
    }
  }, [isSearchTriggered, advancedFilters, searchQuery, performSearch]);

  const filteredResults = useMemo(() => {
    if (!Array.isArray(searchResults)) return [];
    return searchResults.map(item => ({
      ...item,
      id: item.id || item._id,
      // Fallback para disponibilidade se não vier do backend
      _isDisponivel: item.disponivel !== undefined ? item.disponivel : (item.exemplares > 0)
    }));
  }, [searchResults]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <button
            className={`px-3 py-1 rounded ${viewMode === 'lista' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('lista')}
          >
            <List size={18} className="inline mr-1" /> Lista
          </button>
          <button
            className={`px-3 py-1 rounded ${viewMode === 'grade' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('grade')}
          >
            <Grid size={18} className="inline mr-1" /> Grade
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
      ) : viewMode === 'grade' ? (
        <CatalogGrid books={filteredResults} onBookClick={navigateToDetails} />
      ) : (
        <div className="divide-y">
          {filteredResults.map((item) => (
            <div
              key={item.id}
              className="p-3 hover:bg-gray-50 cursor-pointer"
              onClick={() => navigateToDetails(item.id)}
            >
              <div className="flex gap-4 items-center">
                <div className="w-16 h-24 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                  <img
                    src={item.capa || `https://covers.openlibrary.org/b/isbn/${item.isbn}-L.jpg`}
                    alt={item.titulo}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Livro&background=3B82F6&color=fff&size=128'; }}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{item.titulo}</h3>
                    <span className={`text-sm px-2 py-0.5 rounded ${item._isDisponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item._isDisponivel ? 'Disponível' : 'Indisponível'}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.autor}, {item.ano}</p>
                  <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full mt-1">{item.tipo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
