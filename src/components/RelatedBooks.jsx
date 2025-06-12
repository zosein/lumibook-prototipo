import React from 'react';
import { Book, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RelatedBooks({ books, loading }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!books || books.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Book className="h-5 w-5 text-blue-500" />
        Livros Relacionados
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <div
            key={book._id}
            onClick={() => navigate(`/book/${book._id}`)}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          >
            <div className="aspect-[3/4] relative">
              {book.capa ? (
                <img
                  src={book.capa}
                  alt={`Capa de ${book.title}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <Book className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-medium text-gray-900 line-clamp-2 mb-1">
                {book.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-1">
                {book.author}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {book.available ? 'Disponível' : 'Indisponível'}
                </span>
                <span className="text-sm font-medium text-blue-600">
                  Ver detalhes
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 