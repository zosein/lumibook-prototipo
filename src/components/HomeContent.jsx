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
        // Busca sempre os 4 mais recentes
        const books = await CatalogService.getRecentBooks();
        setRecentBooks(Array.isArray(books) ? books.slice(0, 4) : []);
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
    'Livros': 'Book',
    'Periódicos': 'Periodical',
    'E-books': 'E-book',
    'Teses e Dissertações': 'Thesis',
  };

  // Função para buscar livros por categoria
  const fetchCatalogByCategory = async (categoria) => {
    setCatalogLoading(true);
    setShowCatalog(true);
    setCatalogTitle(categoria);
    try {
      const token = localStorage.getItem('authToken');
      const params = { q: categoriaParaMaterialType[categoria] };
      let books = await CatalogService.searchBooks(params, token);
      books = Array.isArray(books) ? books : [];

      // Debug: ver o que chega do backend
      console.log('Livros recebidos:', books);

      // Filtro extra por tipo de material
      const tipoEsperado = categoriaParaMaterialType[categoria];
      books = books.filter(book => {
        console.log('Tipo do livro:', book.tipo, '| Tipo esperado:', tipoEsperado);
        if (tipoEsperado === 'Livro') {
          // Excluir E-book, Tese, Periódico
          return book.tipo === 'Livro';
        }
        return book.tipo === tipoEsperado;
      });

      setCatalogBooks(books);
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
    <div className="min-h-screen flex flex-col bg-white animate-in fade-in duration-300">
      <main className="flex-1 p-4 sm:p-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Categorias</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Livros', 'Periódicos', 'E-books', 'Teses e Dissertações'].map((categoria) => (
                <div 
                  key={categoria} 
                  className="bg-white border border-blue-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:shadow-md transition-all duration-200 group"
                  onClick={() => handleCategoriaClick(categoria)}
                >
                  <Book size={24} className="text-blue-600 mb-2 group-hover:text-blue-700 transition-colors" />
                  <span className="font-medium text-blue-900 group-hover:text-blue-700 transition-colors">{categoria}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Catálogo visual estilo Netflix */}
          {showCatalog && (
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-bold text-blue-900">{catalogTitle}</h2>
                <button className="text-blue-600 hover:underline" onClick={handleCloseCatalog}>Fechar catálogo</button>
              </div>
              <CatalogGrid books={catalogBooks} loading={catalogLoading} onBookClick={navigateToDetails} />
            </div>
          )}
          {/* Só mostra acervo recente se o catálogo não estiver aberto */}
          {!showCatalog && (
            <div>
              <h2 className="text-lg font-medium mb-2 text-blue-900">Acervo Recente</h2>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                {loading ? (
                  <div className="p-4 text-center text-gray-500">
                    Carregando livros recentes...
                  </div>
                ) : recentBooks.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                    {recentBooks.map((item) => (
                      <div 
                        key={item.id} 
                        className="bg-white border border-blue-100 rounded-lg shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center p-3 transition-transform hover:scale-105"
                        onClick={() => navigateToDetails(item.id)}
                      >
                        <div className="w-28 h-40 bg-gray-200 rounded mb-2 flex items-center justify-center overflow-hidden">
                          <img
                            src={item.capa || `https://covers.openlibrary.org/b/isbn/${item.isbn}-L.jpg`}
                            alt={item.titulo}
                            className="object-cover w-full h-full"
                            loading="lazy"
                            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Livro&background=3B82F6&color=fff&size=128'; }}
                          />
                        </div>
                        <h3 className="font-medium text-center text-sm mb-1 line-clamp-2 text-blue-900">{item.titulo}</h3>
                        <p className="text-xs text-center text-gray-600 mb-1">{item.autor}</p>
                        <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mb-1">{item.tipo}</span>
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
      </main>
    </div>
  );
}