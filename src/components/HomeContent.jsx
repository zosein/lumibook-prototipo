import { useState, useEffect } from 'react';
import { Book } from 'lucide-react';
import CatalogService from '../services/CatalogService';
import CatalogGrid from './CatalogGrid';

export default function HomeContent({ setCurrentPage, navigateToDetails }) {
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCatalog, setShowCatalog] = useState(false);
  const [catalogBooks, setCatalogBooks] = useState([]);
  const [catalogTitle, setCatalogTitle] = useState('');
  const [catalogLoading, setCatalogLoading] = useState(false);

  useEffect(() => {
    const fetchRecentBooks = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const books = await CatalogService.getRecentBooks(token);
        // Buscar detalhes completos de cada livro
        const detailedBooks = await Promise.all(
          (Array.isArray(books) ? books : []).map(async (b) => {
            try {
              return await CatalogService.getBookById(b.id, token);
            } catch {
              return b; // fallback para dados básicos se falhar
            }
          })
        );
        setRecentBooks(detailedBooks);
      } catch (error) {
        setRecentBooks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentBooks();
  }, []);

  // Função para mapear categoria para o filtro correto
  const categoriaParaMaterialType = {
    'Livros': 'Livro',
    'Periódicos': 'Periódico',
    'E-books': 'E-book',
    'Teses e Dissertações': 'Tese',
  };

  // Função para buscar livros por categoria
  const fetchCatalogByCategory = async (categoria) => {
    setCatalogLoading(true);
    setShowCatalog(true);
    setCatalogTitle(categoria);
    try {
      const token = localStorage.getItem('authToken');
      const params = { tipo: categoriaParaMaterialType[categoria] };
      const books = await CatalogService.searchBooks(params, token);
      setCatalogBooks(Array.isArray(books) ? books : []);
    } catch (error) {
      setCatalogBooks([]);
    } finally {
      setCatalogLoading(false);
    }
  };

  // Função para disparar busca por categoria
  const handleCategoriaClick = (categoria) => {
    fetchCatalogByCategory(categoria);
  };

  // Função para fechar catálogo visual
  const handleCloseCatalog = () => {
    setShowCatalog(false);
    setCatalogBooks([]);
    setCatalogTitle('');
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Categorias</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Livros', 'Periódicos', 'E-books', 'Teses e Dissertações'].map((categoria) => (
            <div 
              key={categoria} 
              className="bg-white border border-gray-200 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50"
              onClick={() => handleCategoriaClick(categoria)}
            >
              <Book size={24} className="text-blue-600 mb-2" />
              <span>{categoria}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Catálogo visual estilo Netflix */}
      {showCatalog && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold">{catalogTitle}</h2>
            <button className="text-blue-600 hover:underline" onClick={handleCloseCatalog}>Fechar catálogo</button>
          </div>
          <CatalogGrid books={catalogBooks} loading={catalogLoading} onBookClick={navigateToDetails} />
        </div>
      )}

      {/* Só mostra acervo recente se o catálogo não estiver aberto */}
      {!showCatalog && (
        <div>
          <h2 className="text-lg font-medium mb-2">Acervo Recente</h2>
          <div className="bg-white border border-gray-200 rounded-md">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Carregando livros recentes...
              </div>
            ) : recentBooks.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                {recentBooks.map((item) => (
                  <div 
                    key={item.id} 
                    className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center p-3"
                    onClick={() => navigateToDetails(item.id)}
                  >
                    <div className="w-28 h-40 bg-gray-200 rounded mb-2 flex items-center justify-center overflow-hidden">
                      {item.capa ? (
                        <img src={item.capa} alt={item.titulo} className="object-cover w-full h-full" />
                      ) : (
                        <Book size={48} className="text-gray-400" />
                      )}
                    </div>
                    <h3 className="font-medium text-center text-sm mb-1 line-clamp-2">{item.titulo}</h3>
                    <p className="text-xs text-center text-gray-600 mb-1">{item.autor}</p>
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full mb-1">{item.tipo}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${item.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.disponivel ? 'Disponível' : 'Indisponível'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                Nenhum livro encontrado. Verifique a conexão com a API.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}