import { useState, useEffect } from 'react';
import { FileText, BarChart3, Plus, Edit3, Activity, RefreshCw } from 'lucide-react';
import AdminProfile from "../components/AdminProfile";
import { registerBibliotecario } from '../services/UserService';
import CatalogService from '../services/CatalogService';
import React from 'react';

// Array global para registrar req/res
window._frontReqResLog = window._frontReqResLog || [];

export default function AdminProfilePage({ setCurrentPage, user, isLoggedIn, onLogout }) {
  // Hooks devem estar no topo
  const [showModal, setShowModal] = useState(false);
  const [bibForm, setBibForm] = useState({ nome: '', email: '', senha: '' });
  const [bibMsg, setBibMsg] = useState('');
  const [bibLoading, setBibLoading] = useState(false);
  // Protege a rota: só permite acesso se for admin autenticado
  if (!isLoggedIn || !user || (user.papel !== 'admin' && user.papel !== 'bibliotecario')) {
    // Redireciona para login caso não autorizado
    setTimeout(() => setCurrentPage('login'), 0);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">Redirecionando para login...</p>
        </div>
      </div>
    );
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
export function CatalogacaoContent() {
  const [formData, setFormData] = useState({
    titulo: '',
    autor: '',
    isbn: '',
    ano: '',
    tipo: '',
    categoria: '',
    editora: '',
    idioma: 'Português',
    paginas: '',
    resumo: '',
    localizacao: '',
    exemplares: 1
  });

  // Tipos e categorias fixos para exemplo
  const tiposObra = [
    'Livro', 'E-book', 'Periódico', 'Tese', 'Dissertação', 'Artigo', 'Manual'
  ];
  const categorias = [
    'Ciência da Computação', 'Engenharia', 'Matemática', 'Física', 'Química',
    'Biologia', 'Literatura', 'História', 'Filosofia', 'Direito', 'Medicina'
  ];

  // Submissão do formulário (integração futura com API)
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Catalogar nova obra:', formData);
  };

  // Botão de atualizar (simula refresh dos dados do formulário)
  const handleRefresh = () => {
    setFormData({
      titulo: '', autor: '', isbn: '', ano: '', tipo: '', categoria: '', 
      editora: '', idioma: 'Português', paginas: '', resumo: '', 
      localizacao: '', exemplares: 1
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-100 pb-4 flex items-center gap-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <Plus size={24} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Catalogar Nova Obra</h2>
          <p className="text-gray-600">Adicione novas obras ao acervo da biblioteca</p>
        </div>
        <button onClick={handleRefresh} className="ml-auto p-2 rounded-full hover:bg-green-100 transition" title="Atualizar formulário">
          <RefreshCw size={22} className="text-green-600" />
        </button>
      </div>
      {/* Formulário de cadastro de obra */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campos do formulário: título, autor, etc. */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Título da Obra*
              </label>
              <input
                type="text"
                required
                value={formData.titulo}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                placeholder="Digite o título completo"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Autor*
              </label>
              <input
                type="text"
                required
                value={formData.autor}
                onChange={(e) => setFormData(prev => ({ ...prev, autor: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                placeholder="Nome do autor"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ISBN
              </label>
              <input
                type="text"
                value={formData.isbn}
                onChange={(e) => setFormData(prev => ({ ...prev, isbn: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                placeholder="978-XX-XXXX-XXX-X"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tipo de Obra*
              </label>
              <select
                required
                value={formData.tipo}
                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
              >
                <option value="">Selecione o tipo</option>
                {tiposObra.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Categoria*
              </label>
              <select
                required
                value={formData.categoria}
                onChange={(e) => setFormData(prev => ({ ...prev, categoria: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
              >
                <option value="">Selecione a categoria</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ano de Publicação*
              </label>
              <input
                type="number"
                required
                min="1800"
                max={new Date().getFullYear()}
                value={formData.ano}
                onChange={(e) => setFormData(prev => ({ ...prev, ano: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Editora
              </label>
              <input
                type="text"
                value={formData.editora}
                onChange={(e) => setFormData(prev => ({ ...prev, editora: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                placeholder="Nome da editora"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Número de Páginas
              </label>
              <input
                type="number"
                min="1"
                value={formData.paginas}
                onChange={(e) => setFormData(prev => ({ ...prev, paginas: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Localização*
              </label>
              <input
                type="text"
                required
                value={formData.localizacao}
                onChange={(e) => setFormData(prev => ({ ...prev, localizacao: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                placeholder="Ex: Estante A25, Prateleira 2"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantidade de Exemplares*
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.exemplares}
                onChange={(e) => setFormData(prev => ({ ...prev, exemplares: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Resumo
              </label>
              <textarea
                rows="4"
                value={formData.resumo}
                onChange={(e) => setFormData(prev => ({ ...prev, resumo: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200 resize-none"
                placeholder="Breve descrição da obra..."
              />
            </div>
          </div>
          {/* Botões de ação do formulário */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Plus size={18} />
              Catalogar Obra
            </button>
            <button
              type="button"
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              onClick={() => setFormData({
                titulo: '', autor: '', isbn: '', ano: '', tipo: '', categoria: '', 
                editora: '', idioma: 'Português', paginas: '', resumo: '', 
                localizacao: '', exemplares: 1
              })}
            >
              Limpar Formulário
            </button>
          </div>
        </form>
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
                <input type="text" value={editData.categoria || ''} onChange={e => setEditData(d => ({ ...d, categoria: e.target.value }))} className="w-full border rounded px-2 py-1" />
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

