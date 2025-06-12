import { useState, useEffect, useRef } from 'react';
import { FileText, BarChart3, Plus, Edit3, Activity, RefreshCw, Loader2 } from 'lucide-react';
import AdminProfile from "../components/AdminProfile";
import { registerBibliotecario } from '../services/UserService';
import CatalogService from '../services/CatalogService';
import React from 'react';
import { useCatalogacao } from '../hooks/useCatalogacao';
import { buscarLivroPorISBN } from '../utils/buscaLivroPorISBN';
import StatsService from '../services/StatsService';
import { Navigate } from 'react-router-dom';

// Array global para registrar req/res
window._frontReqResLog = window._frontReqResLog || [];

export default function AdminProfilePage({ setCurrentPage, user, isLoggedIn, onLogout }) {
  // Hooks devem estar no topo
  const [showModal, setShowModal] = useState(false);
  const [bibForm, setBibForm] = useState({ nome: '', email: '', senha: '' });
  const [bibMsg, setBibMsg] = useState('');
  const [bibLoading, setBibLoading] = useState(false);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user._id) {
          const stats = await StatsService.getUserStats(user._id);
          console.log('Estatísticas carregadas:', stats);
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchUserStats();
  }, []);

  // Protege a rota: só permite acesso se for admin autenticado
  if (!isLoggedIn || !user || (user.papel !== 'admin' && user.papel !== 'bibliotecario')) {
    return <Navigate to="/login" />;
  }

  // Prepara dados do admin para o componente principal
  const adminData = {
    nome: user.nome || user.usuario || "ADMINISTRADOR",
    avatar: null, // Avatar será buscado dinamicamente pela API via UserService
    email: user.email,
    papel: user.papel,
    tipoLogin: user.tipoLogin,
    id: user.id
  };

  return (
    <>
      {/* Modal de cadastro de bibliotecário */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Novo Bibliotecário</h2>
            <form onSubmit={async e => {
              e.preventDefault();
              setBibLoading(true);
              setBibMsg('');
              try {
                const res = await registerBibliotecario(bibForm, localStorage.getItem('authToken'));
                window._frontReqResLog.push({
                  endpoint: '/api/bibliotecarios',
                  method: 'POST',
                  req: { body: bibForm, headers: { Authorization: 'Bearer ...' } },
                  res
                });
                setBibMsg('Bibliotecário cadastrado com sucesso!');
                setBibForm({ nome: '', email: '', senha: '' });
              } catch (err) {
                if (err?.response?.status === 403) {
                  setBibMsg('Apenas administradores podem cadastrar bibliotecários.');
                } else {
                  setBibMsg(err?.response?.data?.message || 'Erro ao cadastrar bibliotecário.');
                }
              } finally {
                setBibLoading(false);
              }
            }} className="space-y-4">
              <input type="text" placeholder="Nome" required className="w-full border rounded px-3 py-2" value={bibForm.nome} onChange={e => setBibForm(f => ({ ...f, nome: e.target.value }))} />
              <input type="email" placeholder="Email" required className="w-full border rounded px-3 py-2" value={bibForm.email} onChange={e => setBibForm(f => ({ ...f, email: e.target.value }))} />
              <input type="password" placeholder="Senha" required className="w-full border rounded px-3 py-2" value={bibForm.senha} onChange={e => setBibForm(f => ({ ...f, senha: e.target.value }))} />
              <div className="flex gap-2">
                <button type="submit" disabled={bibLoading} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex-1">{bibLoading ? 'Cadastrando...' : 'Cadastrar'}</button>
                <button type="button" onClick={() => { setShowModal(false); setBibMsg(''); }} className="bg-gray-300 px-4 py-2 rounded flex-1">Cancelar</button>
              </div>
              {bibMsg && <div className="text-center text-sm mt-2 text-blue-700">{bibMsg}</div>}
            </form>
          </div>
        </div>
      )}
  
      <AdminProfile 
        user={adminData}
        setCurrentPage={setCurrentPage}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
      />
    </>
  );
}

// Dashboard de estatísticas e atividades do sistema
export function DashboardContent() {
  // Removido: dados mockados para exibição visual do dashboard
  // const statsData = [...];

  return (
    <div className="p-6 space-y-6">
      {/* Header do dashboard com ícone e título */}
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 size={24} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Visão geral do sistema bibliotecário</p>
          </div>
        </div>
      </div>
      {/* Cards de estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Integração futura: UserService.getSystemActivities() */}
        <div className="text-center py-4">
          <p className="text-gray-500">Atividades carregadas dinamicamente da API</p>
          <p className="text-sm text-gray-400 mt-1">Integração com UserService.getSystemActivities()</p>
        </div>
      </div>
      {/* Atividades recentes (exemplo visual) */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity size={20} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Atividades Recentes</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {/* Integração futura: UserService.getSystemActivities() */}
            <div className="text-center py-4">
              <p className="text-gray-500">Atividades carregadas dinamicamente da API</p>
              <p className="text-sm text-gray-400 mt-1">Integração com UserService.getSystemActivities()</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Formulário de catalogação de obras
export function CatalogacaoContent({ setCurrentPage }) {
  const {
    formData,
    setFormData,
    capaUrl,
    limparFormulario,
  } = useCatalogacao();

  const [isbnInput, setIsbnInput] = useState('');
  const [isbnSuggestions, setIsbnSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef();
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    CatalogService.getCategoriasFixas().then(setCategorias);
  }, []);

  // Atualizar visibilidade do formulário ao preencher ISBN
  useEffect(() => {
    if (isbnInput && isbnInput.replace(/[-\s]/g, '').length >= 10 && formData.titulo) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [isbnInput, formData.titulo]);

  // Função para buscar sugestões de ISBN
  const handleISBNChange = async (e) => {
    const value = e.target.value;
    setIsbnInput(value);
    setFormData(prev => ({ ...prev, isbn: value }));
    if (value.replace(/[-\s]/g, '').length >= 3) {
      setLoadingSuggestions(true);
      try {
        // Busca sugestões na OpenLibrary/Google Books
        // Aqui, para exemplo, só busca o ISBN digitado (poderia ser uma API de sugestões)
        const livro = await buscarLivroPorISBN(value);
        if (livro && livro.titulo) {
          setIsbnSuggestions([{ ...livro, isbn: value.replace(/[-\s]/g, '') }]);
        } else {
          setIsbnSuggestions([]);
        }
      } catch {
        setIsbnSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
        setShowSuggestions(true);
      }
    } else {
      setIsbnSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Selecionar sugestão do autocomplete
  const handleSelectSuggestion = async (suggestion) => {
    setShowSuggestions(false);
    setIsbnInput(suggestion.isbn_13 || suggestion.isbn_10 || suggestion.isbn);
    // Preencher com dados do OpenLibrary
    let newFormData = {
      ...formData,
      isbn: suggestion.isbn_13 || suggestion.isbn_10 || suggestion.isbn,
      titulo: suggestion.titulo || '',
      autor: (Array.isArray(suggestion.authors) && suggestion.authors.length > 0) ? suggestion.authors.map(a => a.name).join(', ') : (suggestion.autor || ''),
      autores: (Array.isArray(suggestion.authors) && suggestion.authors.length > 0) ? suggestion.authors.map(a => a.name) : (suggestion.autores || []),
      editora: (suggestion.editora || (suggestion.publishers && suggestion.publishers[0]?.name) || ''),
      editoras: suggestion.editoras || [],
      ano: suggestion.ano || '',
      idioma: suggestion.idioma || '',
      paginas: suggestion.paginas || '',
      resumo: suggestion.resumo || '',
      categoria: suggestion.categoria || '',
      capa: suggestion.capa || '',
      edicao: suggestion.edicao || '',
      isbn_10: suggestion.isbn_10 || '',
      isbn_13: suggestion.isbn_13 || '',
      urlOpenLibrary: suggestion.urlOpenLibrary || '',
      keyOpenLibrary: suggestion.keyOpenLibrary || '',
      ebook: suggestion.ebook || null,
    };
    setFormData(newFormData);

    // Fallback: buscar no Google Books apenas para campos vazios
    const isbn = suggestion.isbn_13 || suggestion.isbn_10 || suggestion.isbn;
    if (isbn) {
      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
          const volume = data.items[0].volumeInfo;
          // Só preencher campos que estão vazios
          setFormData(prev => ({
            ...prev,
            titulo: prev.titulo || volume.title || '',
            autor: prev.autor || (volume.authors ? volume.authors.join(', ') : ''),
            editora: prev.editora || volume.publisher || '',
            ano: prev.ano || (volume.publishedDate ? volume.publishedDate.substring(0, 4) : ''),
            idioma: prev.idioma || volume.language || '',
            paginas: prev.paginas || volume.pageCount || '',
            resumo: prev.resumo || volume.description || '',
            capa: prev.capa || (volume.imageLinks ? volume.imageLinks.thumbnail : ''),
            edicao: prev.edicao || '', // Google Books geralmente não traz edição
          }));
        }
      } catch (e) {
        // Silenciosamente ignora erros de fallback
      }
    }
  };

  // Limpar formulário e autocomplete
  const handleLimparFormulario = () => {
    limparFormulario();
    setIsbnInput('');
    setIsbnSuggestions([]);
    setShowSuggestions(false);
  };

  // Submissão do formulário (integração futura com API)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validar campos obrigatórios
      if (!formData.nome || !formData.email || !formData.password) {
        throw new Error('Por favor, preencha todos os campos obrigatórios');
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('Por favor, insira um email válido');
      }

      // Validar senha
      if (formData.password.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres');
      }

      // Criar payload com papel fixo como 'aluno' e adicionar matricula
      const userData = {
        nome: formData.nome,
        email: formData.email,
        password: formData.password,
        papel: 'aluno',
        matricula: formData.matricula || ''
      };

      const response = await fetch('http://localhost:3000/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar usuário');
      }

      const data = await response.json();
      console.log('Usuário criado:', data);
      setSuccess('Usuário criado com sucesso!');
      setFormData({
        nome: '',
        email: '',
        password: '',
        papel: 'aluno',
        matricula: ''
      });

      // Redirecionar para a tela de perfil
      setTimeout(() => {
        setCurrentPage('profile');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* Capa ao lado do formulário */}
        <div className="md:w-1/3 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-8">
          {capaUrl ? (
            <img src={capaUrl} alt="Capa do livro" className="w-48 h-auto rounded-xl shadow mb-4 border border-gray-200" />
          ) : (
            <div className="w-48 h-72 flex items-center justify-center bg-gray-100 rounded-xl text-gray-400 text-sm border border-dashed border-gray-200">Capa do livro</div>
          )}
        </div>
        <div className="md:w-2/3 w-full p-8 flex flex-col justify-center">
          <div className="pb-4 flex items-center gap-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Plus size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Catalogar Nova Obra</h2>
              <p className="text-gray-600">Adicione novas obras ao acervo da biblioteca</p>
            </div>
            <button onClick={handleLimparFormulario} className="ml-auto p-2 rounded-full hover:bg-green-100 transition" title="Limpar formulário">
              <RefreshCw size={22} className="text-green-600" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campo ISBN com autocomplete */}
              <div className="md:col-span-2 relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">ISBN</label>
                <input
                  type="text"
                  value={isbnInput}
                  onChange={handleISBNChange}
                  onFocus={() => setShowSuggestions(isbnSuggestions.length > 0)}
                  ref={inputRef}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 bg-white"
                  placeholder="978-XX-XXXX-XXX-X"
                  autoComplete="off"
                />
                {loadingSuggestions && <div className="absolute left-0 mt-1 text-xs text-gray-500">Buscando sugestões...</div>}
                {showSuggestions && isbnSuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {isbnSuggestions.map((s, idx) => (
                      <li
                        key={s.isbn + idx}
                        className="flex items-center gap-3 px-4 py-2 hover:bg-blue-50 cursor-pointer"
                        onClick={() => handleSelectSuggestion(s)}
                      >
                        {s.capa && <img src={s.capa} alt="Capa" className="w-10 h-14 object-cover rounded mr-2" />}
                        <div>
                          <div className="font-semibold text-sm">{s.titulo}</div>
                          <div className="text-xs text-gray-600">{s.autor} {s.ano && `(${s.ano})`}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Campos principais em grid */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Título*</label>
                <input type="text" required value={formData.titulo} onChange={e => setFormData(prev => ({ ...prev, titulo: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200" placeholder="Título completo" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Autor*</label>
                <input type="text" required value={formData.autor} onChange={e => setFormData(prev => ({ ...prev, autor: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200" placeholder="Nome do autor" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Editora</label>
                <input type="text" value={formData.editora} onChange={e => setFormData(prev => ({ ...prev, editora: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200" placeholder="Nome da editora" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ano</label>
                <input type="text" value={formData.ano} onChange={e => setFormData(prev => ({ ...prev, ano: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200" placeholder="Ano de publicação" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Idioma</label>
                <input type="text" value={formData.idioma} onChange={e => setFormData(prev => ({ ...prev, idioma: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200" placeholder="Idioma original" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Páginas</label>
                <input type="text" value={formData.paginas} onChange={e => setFormData(prev => ({ ...prev, paginas: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200" placeholder="Número de páginas" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Resumo</label>
                <textarea value={formData.resumo} onChange={e => setFormData(prev => ({ ...prev, resumo: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200" placeholder="Resumo da obra" rows="3" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
                <select value={formData.categoria} onChange={e => setFormData(prev => ({ ...prev, categoria: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200">
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Edição</label>
                <input type="text" value={formData.edicao} onChange={e => setFormData(prev => ({ ...prev, edicao: e.target.value }))} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200" placeholder="Número da edição" />
              </div>
            </div>
            {/* Botão de submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Cadastrando...
                </>
              ) : (
                "Cadastrar obra"
              )}
            </button>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-center text-sm animate-pulse">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-center text-sm flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {success}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

// Componentes placeholder padronizados
export function GerenciarAcervoContent() {
  const [livros, setLivros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [busca, setBusca] = useState('');
  const [livroSelecionado, setLivroSelecionado] = useState(null); // livro selecionado para modal
  const [editData, setEditData] = useState({});
  const [deletando, setDeletando] = useState(false);
  const [msg, setMsg] = useState('');
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    CatalogService.getCategoriasFixas().then(setCategorias);
  }, []);

  // Buscar livros
  const fetchLivros = React.useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
      const data = await CatalogService.getBooks(busca ? { search: busca } : {});
      setLivros(Array.isArray(data) ? data : []);
    } catch (e) {
      setErro('Erro ao buscar livros.');
      setLivros([]);
    } finally {
      setLoading(false);
    }
  }, [busca]);

  useEffect(() => { fetchLivros(); }, [fetchLivros]);

  // Abrir modal de edição
  const handleOpenModal = (livro) => {
    setLivroSelecionado(livro);
    setEditData({ ...livro });
    setMsg('');
    setDeletando(false);
  };
  // Fechar modal
  const handleCloseModal = () => {
    setLivroSelecionado(null);
    setEditData({});
    setMsg('');
    setDeletando(false);
  };
  // Salvar edição
  const handleEditSave = async () => {
    try {
      const payload = {
        title: editData.titulo,
        authors: editData.autores,
        isbn: editData.isbn,
        ano: editData.ano,
        tipo: editData.tipo,
        category: editData.categoria,
        publisher: editData.editora,
        stock: Number(editData.stock),
        disponivel: editData.disponivel,
        resumo: editData.resumo,
        capa: editData.capa,
        paginas: editData.paginas,
        localizacao: editData.localizacao,
        idioma: editData.idioma,
      };
      await CatalogService.updateBook(livroSelecionado.id, payload, localStorage.getItem('authToken'));
      setMsg('Livro atualizado!');
      setLivroSelecionado(null);
      fetchLivros();
    } catch {
      setMsg('Erro ao salvar alterações.');
    }
  };
  // Deletar livro
  const handleDelete = async () => {
    try {
      await CatalogService.deleteBook(livroSelecionado.id, localStorage.getItem('authToken'));
      setMsg('Livro removido!');
      setLivroSelecionado(null);
      setDeletando(false);
      fetchLivros();
    } catch {
      setMsg('Erro ao remover livro.');
    }
  };

  // Adicionar função de refresh
  const handleRefresh = () => fetchLivros();

  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-100 pb-4 flex items-center gap-4">
        <div className="p-2 bg-purple-100 rounded-lg"><Edit3 size={24} className="text-purple-600" /></div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Acervo</h2>
          <p className="text-gray-600">Clique em um livro para editar ou remover</p>
        </div>
        <button onClick={handleRefresh} className="ml-auto p-2 rounded-full hover:bg-purple-100 transition" title="Atualizar acervo">
          <RefreshCw size={22} className="text-purple-600" />
        </button>
        <input
          type="text"
          className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-100 focus:outline-none"
          placeholder="Buscar por título, autor, ISBN..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>
      {msg && <div className="text-center text-green-700 font-medium">{msg}</div>}
      {erro && <div className="text-center text-red-600 font-medium">{erro}</div>}
      {loading ? (
        <div className="p-8 text-center text-gray-500">Carregando catálogo...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-xl shadow-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2">Título</th>
                <th className="px-4 py-2">Autores</th>
                <th className="px-4 py-2">Estoque</th>
                <th className="px-4 py-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {livros.map(livro => (
                <tr key={livro.id} className="border-b hover:bg-purple-50 cursor-pointer transition" onClick={() => handleOpenModal(livro)}>
                  <td className="px-4 py-2 font-medium max-w-xs truncate">{livro.titulo}</td>
                  <td className="px-4 py-2 max-w-xs truncate">{
                    Array.isArray(livro.authors)
                      ? livro.authors.map(a => typeof a === 'string' ? a : (a?.nome || a)).join(', ')
                      : Array.isArray(livro.autores)
                        ? livro.autores.map(a => typeof a === 'string' ? a : (a?.nome || a)).join(', ')
                        : livro.autor || ''
                  }</td>
                  <td className="px-4 py-2 text-center">{livro.stock ?? livro.exemplares ?? 0}</td>
                  <td className="px-4 py-2 text-center">
                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={e => { e.stopPropagation(); handleOpenModal(livro); }}>Gerenciar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal de edição/remoção */}
      {livroSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Gerenciar Livro</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Título</label>
                <input type="text" value={editData.titulo || ''} onChange={e => setEditData(d => ({ ...d, titulo: e.target.value }))} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Autores</label>
                <input
                  type="text"
                  value={Array.isArray(editData.authors)
                    ? editData.authors.map(a => a.nome).join(', ')
                    : Array.isArray(editData.autores)
                      ? editData.autores.map(a => typeof a === 'string' ? a : (a?.nome || a)).join(', ')
                      : editData.autor || ''}
                  onChange={e => setEditData(d => ({
                    ...d,
                    authors: e.target.value.split(',').map(s => ({ nome: s.trim() })).filter(a => a.nome.length > 0),
                    autores: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  }))}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">ISBN</label>
                <input type="text" value={editData.isbn || ''} onChange={e => setEditData(d => ({ ...d, isbn: e.target.value }))} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Categoria</label>
                <select value={editData.categoria || ''} onChange={e => setEditData(d => ({ ...d, categoria: e.target.value }))} className="w-full border rounded px-2 py-1">
                  <option value="">Selecione a categoria</option>
                  {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Editora</label>
                <input
                  type="text"
                  value={editData.editora?.nome || editData.editora || ''}
                  onChange={e => setEditData(d => ({
                    ...d,
                    editora: { nome: e.target.value }
                  }))}
                  className="w-full border rounded px-2 py-1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ano</label>
                <input type="number" value={editData.ano || ''} onChange={e => setEditData(d => ({ ...d, ano: e.target.value }))} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Estoque</label>
                <input type="number" value={editData.stock || editData.exemplares || ''} onChange={e => setEditData(d => ({ ...d, stock: e.target.value }))} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Localização</label>
                <input type="text" value={editData.localizacao || ''} onChange={e => setEditData(d => ({ ...d, localizacao: e.target.value }))} className="w-full border rounded px-2 py-1" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1">Resumo</label>
              <textarea rows={3} value={editData.resumo || ''} onChange={e => setEditData(d => ({ ...d, resumo: e.target.value }))} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="flex gap-2 justify-end mt-4">
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleEditSave}>Salvar</button>
              <button className="bg-gray-300 px-4 py-2 rounded" onClick={handleCloseModal}>Cancelar</button>
              <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => setDeletando(true)}>Remover</button>
            </div>
            {/* Confirmação de deleção */}
            {deletando && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <p className="mb-2 text-red-700">Tem certeza que deseja remover este livro do acervo?</p>
                <div className="flex gap-2 justify-end">
                  <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleDelete}>Remover</button>
                  <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setDeletando(false)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function RelatoriosContent() {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <FileText size={24} className="text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Relatórios</h2>
            <p className="text-gray-600">Gerar relatórios e estatísticas do sistema</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 p-12 text-center">
        <div className="p-4 bg-indigo-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <FileText size={32} className="text-indigo-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Funcionalidade em Desenvolvimento</h3>
        <p className="text-gray-600">Esta seção estará disponível em breve</p>
      </div>
    </div>
  );
}

