import { useState, useEffect } from 'react';
import { Book } from 'lucide-react';

export default function HomeContent({ setCurrentPage }) {
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentBooks = async () => {
      try {
        // Buscar livros recentes da API
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/livros/recentes?limit=3`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const books = await response.json();
          setRecentBooks(books);
        } else {
          console.error('Erro ao buscar livros recentes');
          setRecentBooks([]);
        }
      } catch (error) {
        console.error('Erro de conexão ao buscar livros recentes:', error);
        setRecentBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentBooks();
  }, []);

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-lg font-medium mb-2">Categorias</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Livros', 'Periódicos', 'E-books', 'Teses e Dissertações'].map((categoria) => (
            <div 
              key={categoria} 
              className="bg-white border border-gray-200 rounded-md p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50"
              onClick={() => setCurrentPage('resultados')}
            >
              <Book size={24} className="text-blue-600 mb-2" />
              <span>{categoria}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-medium mb-2">Acervo Recente</h2>
        <div className="bg-white border border-gray-200 rounded-md">
          {loading ? (
            <div className="p-4 text-center text-gray-500">
              Carregando livros recentes...
            </div>
          ) : recentBooks.length > 0 ? (
            recentBooks.map((item) => (
              <div 
                key={item.id} 
                className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                onClick={() => setCurrentPage('detalhes')}
              >
                <div className="flex justify-between">
                  <h3 className="font-medium">{item.titulo}</h3>
                  <span className={`text-sm px-2 py-0.5 rounded ${item.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {item.disponivel ? 'Disponível' : 'Indisponível'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{item.autor}, {item.ano}</p>
                <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full mt-1">{item.tipo}</span>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              Nenhum livro encontrado. Verifique a conexão com a API.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}