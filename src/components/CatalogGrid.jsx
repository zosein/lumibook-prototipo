import { Book } from 'lucide-react';

export default function CatalogGrid({ books = [], loading = false, onBookClick }) {
  if (loading) {
    return <div className="p-8 text-center text-gray-500">Carregando catálogo...</div>;
  }
  if (!books || books.length === 0) {
    return <div className="p-8 text-center text-gray-500">Nenhum item encontrado.</div>;
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {books.map((item) => (
        <div
          key={item.id}
          className="bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md cursor-pointer flex flex-col items-center p-3 transition-transform hover:scale-105"
          onClick={() => onBookClick(item.id)}
        >
          <div className="w-28 h-40 bg-gray-200 rounded mb-2 flex items-center justify-center overflow-hidden">
            <img
              src={item.capa || `https://covers.openlibrary.org/b/isbn/${item.isbn}-L.jpg`}
              alt={item.titulo}
              className="object-cover w-full h-full"
              onError={e => { e.target.src = 'https://ui-avatars.com/api/?name=Livro&background=3B82F6&color=fff&size=128'; }}
            />
          </div>
          <h3 className="font-medium text-center text-xs mb-1 line-clamp-2">{item.titulo}</h3>
          <p className="text-xs text-center text-gray-600 mb-1 line-clamp-1">{item.autor}</p>
          <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full mb-1">{item.tipo}</span>
          <span className={`text-xs px-2 py-0.5 rounded ${item.disponivel ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.disponivel ? 'Disponível' : 'Indisponível'}</span>
        </div>
      ))}
    </div>
  );
} 