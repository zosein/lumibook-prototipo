import { useState } from 'react';
import { User, Database, UserPlus, FileText, BarChart3, Clock, BookOpen,Plus,
Edit3, TrendingUp, Activity} from 'lucide-react';
import AdminProfile from "../components/AdminProfile";
import { registerBibliotecario, exportFrontReqResLog } from '../services/UserService';

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
      {/* Botão para abrir modal de cadastro de bibliotecário */}
      {user.papel === 'admin' && (
        <button
          className="bg-orange-600 text-white px-4 py-2 rounded-lg mb-4 hover:bg-orange-700"
          onClick={() => setShowModal(true)}
        >
          Cadastrar Bibliotecário
        </button>
      )}
      <button
        className="bg-gray-600 text-white px-4 py-2 rounded-lg mb-4 hover:bg-gray-700 ml-2"
        onClick={exportFrontReqResLog}
      >
        Exportar Log de Req/Res
      </button>
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
      {/* Resto do conteúdo do admin */}
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
  // Dados mockados para exibição visual do dashboard
  const statsData = [
    { 
      title: 'Total de Obras', 
      value: '15.247', 
      icon: BookOpen, 
      color: 'blue', 
      change: '+5.2%',
      trend: 'up'
    },
    { 
      title: 'Usuários Ativos', 
      value: '2.438', 
      icon: User, 
      color: 'green', 
      change: '+12.3%',
      trend: 'up'
    },
    { 
      title: 'Empréstimos Hoje', 
      value: '89', 
      icon: Clock, 
      color: 'orange', 
      change: '+2.1%',
      trend: 'up'
    },
    { 
      title: 'Obras Disponíveis', 
      value: '12.891', 
      icon: Database, 
      color: 'purple', 
      change: '-1.8%',
      trend: 'down'
    }
  ];

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
        {statsData.map((stat, index) => (
          <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 p-6 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                <stat.icon size={24} className={`text-${stat.color}-600`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp size={14} className={stat.trend === 'down' ? 'rotate-180' : ''} />
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
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

  return (
    <div className="p-6 space-y-6">
      {/* Header da seção de catalogação */}
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Plus size={24} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Catalogar Nova Obra</h2>
            <p className="text-gray-600">Adicione novas obras ao acervo da biblioteca</p>
          </div>
        </div>
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
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Edit3 size={24} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciar Acervo</h2>
            <p className="text-gray-600">Editar, remover e organizar obras do acervo</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 p-12 text-center">
        <div className="p-4 bg-purple-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <Edit3 size={32} className="text-purple-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Funcionalidade em Desenvolvimento</h3>
        <p className="text-gray-600">Esta seção estará disponível em breve</p>
      </div>
    </div>
  );
}

export function UsuariosContent() {
  return (
    <div className="p-6 space-y-6">
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <UserPlus size={24} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h2>
            <p className="text-gray-600">Visualizar e gerenciar usuários do sistema</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-100 p-12 text-center">
        <div className="p-4 bg-orange-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
          <UserPlus size={32} className="text-orange-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Funcionalidade em Desenvolvimento</h3>
        <p className="text-gray-600">Esta seção estará disponível em breve</p>
      </div>
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

