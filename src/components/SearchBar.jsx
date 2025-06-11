import { useState, useRef } from 'react';
import { Search, Filter } from 'lucide-react';
import CatalogService from '../services/CatalogService';

export default function SearchBar({ searchQuery, setSearchQuery, filterOpen, setFilterOpen, advancedFilters, setAdvancedFilters, handleSearch }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef();

  const handleFilterChange = (field, value) => {
    setAdvancedFilters({ ...advancedFilters, [field]: value });
  };

  const clearFilters = () => {
    setAdvancedFilters({
      materialType: 'Todos',
      publicationYear: 'Todos',
      language: 'Todos',
      availability: 'Todos'
    });
  };

  // Autocomplete: busca sugestões conforme digitação
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    try {
      const params = { q: value };
      const books = await CatalogService.searchBooks(params);
      setSuggestions(books.slice(0, 7));
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Seleciona sugestão do autocomplete
  const handleSuggestionClick = (book) => {
    setSearchQuery(book.titulo);
    setSuggestions([]);
    setShowSuggestions(false);
    handleSearch(book.titulo);
    inputRef.current.blur();
  };

  // Submissão do formulário (Enter ou botão)
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    handleSearch(searchQuery);
  };

  // Fecha sugestões ao perder foco
  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className="p-4 bg-gray-100 relative">
      <form onSubmit={handleSubmit} className="flex gap-2 relative">
        <div className="flex flex-1 bg-white rounded-md border border-gray-300 overflow-hidden relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Pesquise por título, autor, assunto..."
            className="p-2 flex-1 outline-none"
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={handleInputChange}
            onBlur={handleBlur}
            autoComplete="off"
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 flex items-center"
          >
            <Search size={18} />
          </button>
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-10 left-0 right-0 top-12 bg-white border border-gray-200 rounded shadow-lg max-h-60 overflow-y-auto">
              {loadingSuggestions ? (
                <li className="p-2 text-gray-500">Carregando...</li>
              ) : suggestions.map(book => (
                <li
                  key={book.id}
                  className="p-2 hover:bg-blue-100 cursor-pointer text-sm"
                  onMouseDown={() => handleSuggestionClick(book)}
                >
                  <span className="font-medium">{book.titulo}</span>
                  {book.autor && <span className="text-gray-500 ml-2">{book.autor}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button 
          type="button"
          className="bg-gray-200 px-3 rounded-md flex items-center border border-gray-300"
          onClick={() => setFilterOpen(!filterOpen)}
        >
          <Filter size={18} />
        </button>
      </form>

      {filterOpen && (
        <div className="mt-2 bg-white p-3 rounded-md border border-gray-300 shadow-md">
          <h3 className="font-medium mb-2">Filtros Avançados</h3>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-sm text-gray-600">Tipo de Material</label>
              <select
                className="w-full p-2 border rounded"
                value={advancedFilters.materialType}
                onChange={(e) => handleFilterChange('materialType', e.target.value)}
              >
                <option>Todos</option>
                <option>Livro</option>
                <option>Periódico</option>
                <option>E-book</option>
                <option>Tese</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Ano de Publicação</label>
              <select
                className="w-full p-2 border rounded"
                value={advancedFilters.publicationYear}
                onChange={(e) => handleFilterChange('publicationYear', e.target.value)}
              >
                <option>Todos</option>
                <option>Últimos 5 anos</option>
                <option>Últimos 10 anos</option>
                <option>Personalizado</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-sm text-gray-600">Idioma</label>
              <select
                className="w-full p-2 border rounded"
                value={advancedFilters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
              >
                <option>Todos</option>
                <option>Português</option>
                <option>Inglês</option>
                <option>Espanhol</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600">Disponibilidade</label>
              <select
                className="w-full p-2 border rounded"
                value={advancedFilters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
              >
                <option>Todos</option>
                <option>Disponível</option>
                <option>Emprestado</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button 
              type="button" 
              onClick={clearFilters} 
              className="px-3 py-1 bg-gray-200 rounded text-sm">
              Limpar
            </button>
            <button 
              type="button"
              onClick={() => { setFilterOpen(false); handleSearch(searchQuery); }}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}