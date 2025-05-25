import { useState } from 'react';
import { BookOpen, Eye, EyeOff, Mail, Hash, Loader2, ArrowLeft } from 'lucide-react';

function isEmailInstitucional(email) {
  return /@universitas\.edu\.br\s*$/i.test(email);
}
function isMatricula(valor) {
  return /^\d{6,}$/.test(valor);
}

export default function LoginPage({ setCurrentPage, onLogin }) {
  const [form, setForm] = useState({ usuario: '', senha: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function validate() {
    const errs = {};
    if (!form.usuario) errs.usuario = "Informe email institucional ou matrícula.";
    else if (form.usuario.includes('@') && !isEmailInstitucional(form.usuario)) errs.usuario = "Use seu email institucional.";
    else if (!form.usuario.includes('@') && !isMatricula(form.usuario)) errs.usuario = "Matrícula inválida.";
    if (!form.senha) errs.senha = "Informe sua senha.";
    return errs;
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setSuccess('');
  };

  const handleBlur = e => {
    setErrors(prev => ({ ...prev, ...validate() }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      setSuccess('');
      return;
    }
    setSubmitting(true);
    setErrors({});
    try {
      // Simulação de login - chamada para a API
      await new Promise(res => setTimeout(res, 1000));
      
      // Verifica se é email ou matrícula
      const isEmail = form.usuario.includes('@');
      
      // Dados simulados do usuário que retornariam da API
      const userData = {
        usuario: form.usuario, // Mantém o valor original (email ou matrícula)
        email: isEmail ? form.usuario : `${form.usuario}@universitas.edu.br`, // Email completo sempre
        nome: 'Nome do Usuário', // Viria da API
        papel: 'aluno', // Viria da API
        tipoLogin: isEmail ? 'email' : 'matricula' // Nova propriedade para identificar o tipo
      };
      
      setSuccess("Login realizado! Redirecionando...");
      setTimeout(() => {
        onLogin(userData); // Passa os dados do usuário para o App
      }, 1200);
    } catch {
      setErrors({ geral: "Erro ao fazer login. Tente novamente." });
    } finally {
      setSubmitting(false);
    }
  };

  // Detectar tipo de input para mostrar ícone apropriado
  const getInputIcon = () => {
    if (!form.usuario) return null;
    return form.usuario.includes('@') ? 
      <Mail size={16} className="text-blue-500" /> : 
      <Hash size={16} className="text-green-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50">
      {/* Header simplificado */}
      <div className="w-full h-20 bg-blue-600 flex items-center px-8 shadow-lg">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-white hover:text-blue-200 transition-colors p-2 rounded-lg hover:bg-blue-500"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <div className="flex items-center gap-2 text-white text-2xl font-bold">
            LUMIBOOK <BookOpen size={28} />
          </div>
        </div>
      </div>

      {/* Container principal */}
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
        <div className="w-full max-w-md">
          {/* Card do formulário */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Header do card */}
            <div className="bg-gradient-to-r from-blue-600 to-sky-600 p-8 text-center">
              <div className="flex items-center justify-center gap-2 text-white text-3xl font-bold mb-2">
                <BookOpen size={32} />
                LUMIBOOK
              </div>
              <p className="text-blue-100 text-lg">Faça seu login</p>
            </div>

            {/* Formulário */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Mensagens de feedback */}
              {errors.geral && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-center text-sm animate-pulse">
                  {errors.geral}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-center text-sm flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  {success}
                </div>
              )}

              {/* Campo usuário com ícone dinâmico */}
              <div className="space-y-2">
                <label htmlFor="usuario" className="text-gray-700 text-sm font-medium">
                  Email institucional ou matrícula<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="usuario"
                    name="usuario"
                    value={form.usuario}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                      errors.usuario 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    } focus:outline-none focus:ring-2 ${form.usuario ? 'pr-10' : ''}`}
                    placeholder="Digite seu email ou matrícula"
                    required
                  />
                  {getInputIcon() && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {getInputIcon()}
                    </div>
                  )}
                </div>
                {errors.usuario && <p className="text-red-500 text-xs">{errors.usuario}</p>}
              </div>

              {/* Campo senha com toggle de visibilidade */}
              <div className="space-y-2">
                <label htmlFor="senha" className="text-gray-700 text-sm font-medium">
                  Senha<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="senha"
                    name="senha"
                    type={showPassword ? "text" : "password"}
                    value={form.senha}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 pr-10 border rounded-lg transition-all duration-200 ${
                      errors.senha 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Digite sua senha"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.senha && <p className="text-red-500 text-xs">{errors.senha}</p>}
              </div>

              {/* Botão de submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </button>

              {/* Link para cadastro */}
              <div className="text-center pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentPage('cadastro')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors hover:underline"
                >
                  Não tem conta? <span className="font-semibold">Cadastre-se aqui</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}