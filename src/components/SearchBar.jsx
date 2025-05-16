import { Search, Filter } from 'lucide-react';

export default function SearchBar({ searchQuery, setSearchQuery, filterOpen, setFilterOpen, advancedFilters, setAdvancedFilters, handleSearch }) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="p-4 bg-gray-100">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex flex-1 bg-white rounded-md border border-gray-300 overflow-hidden">
          <input
            type="text"
            placeholder="Pesquise por título, autor, assunto..."
            className="p-2 flex-1 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button 
            type="submit"
            className="bg-blue-600 text-white px-4 flex items-center"
          >
            <Search size={18} />
          </button>
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
              onClick={handleSearch} 
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              Aplicar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}