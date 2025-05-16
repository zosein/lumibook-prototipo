import { BookOpen, Info } from 'lucide-react';
import { resultados } from '../data/sampleData';

export default function BookDetails({ setCurrentPage, bookId }) {
  // Se não houver ID, use o primeiro livro como padrão ou um ID específico
  const id = bookId || 6; // ID 6 é "Análise de Dados com Python" nos dados atualizados
  
  // Encontre o livro pelos dados
  const livro = resultados.find(item => item.id === id) || resultados[0];
  
  // Obras relacionadas (excluindo o livro atual)
  const obrasRelacionadas = resultados
    .filter(item => item.id !== id)
    .slice(0, 4);

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
            <div className="bg-gray-200 p-6 rounded flex items-center justify-center">
              <BookOpen size={80} className="text-gray-500" />
            </div>
          </div>
          
          <div className="md:w-3/4">
            <h1 className="text-xl font-bold mb-1">{livro.titulo}</h1>
            <p className="text-gray-600 mb-3">{livro.autor}, {livro.ano}</p>
            
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
              <p className="text-gray-700">{livro.resumo}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-6">
              <div>
                <h3 className="font-medium text-sm text-gray-600">ISBN</h3>
                <p>{livro.isbn}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Edição</h3>
                <p>{livro.edicao}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Editora</h3>
                <p>{livro.editora}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Idioma</h3>
                <p>{livro.idioma}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Páginas</h3>
                <p>{livro.paginas}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Categoria</h3>
                <p>{livro.categoria}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Localização</h3>
                <p>{livro.localizacao}</p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-gray-600">Exemplares</h3>
                <p>{livro.exemplares.disponiveis} disponíveis ({livro.exemplares.total} total)</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {livro.disponivel && (
                <button className="px-4 py-2 bg-green-600 text-white rounded">Reservar</button>
              )}
              {livro.tipo === "E-book" && (
                <button className="px-4 py-2 bg-blue-600 text-white rounded">Download (E-book)</button>
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
          {obrasRelacionadas.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-gray-200 rounded-md p-3 hover:shadow-md cursor-pointer"
              onClick={() => {
                // Navegar para os detalhes do livro relacionado
                setCurrentPage('detalhes');
                // Precisamos implementar isso no componente pai
                // Essa parte será capturada no próximo arquivo
              }}
            >
              <div className="flex justify-center mb-2">
                <div className="bg-gray-200 p-3 rounded">
                  <BookOpen size={30} className="text-gray-500" />
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