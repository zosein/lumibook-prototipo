import { useState, useEffect } from 'react';
import { BookOpen, Eye, EyeOff, Mail, Hash, Loader2, ArrowLeft, AlertCircle, Shield } from 'lucide-react';
import { validateLogin, validators, getApiErrorMessage } from '../utils/Validation';

export default function LoginPage({ setCurrentPage, onLogin }) {
  const [form, setForm] = useState({ usuario: '', senha: '' });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Informações sobre o input do usuário
  const [inputInfo, setInputInfo] = useState(null);

  // Função para obter informações sobre o tipo de input
  const getInputInfo = (input) => {
    if (!input?.trim()) return null;
    
    try {
      const tipoInfo = validators.determinarTipoUsuarioLogin(input.trim());
      return tipoInfo;
    } catch (error) {
      console.error('Erro ao determinar tipo de usuário:', error);
      return null;
    }
  };

  // Efeito para atualizar informações do input
  useEffect(() => {
    const info = getInputInfo(form.usuario);
    setInputInfo(info);
  }, [form.usuario]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setSuccess('');
  };

  const handleBlur = () => {
    const validationErrors = validateLogin(form);
    setErrors(prev => ({ ...prev, ...validationErrors }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validateLogin(form);
    
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setSuccess('');
      return;
    }
    
    setSubmitting(true);
    setErrors({});
    
    try {
      // Determinar tipo de usuário baseado no input (RESTRITIVO)
      const tipoInfo = validators.determinarTipoUsuarioLogin(form.usuario);
      
      if (!tipoInfo) {
        setErrors({ geral: "Formato de login inválido. Use matrícula (alunos), email institucional (professores) ou admin@universitas.edu.br (administrador)." });
        return;
      }
      
      // Preparar dados para API com tipo de usuário determinístico
      const dadosAPI = {
        identificador: tipoInfo.identificadorAPI,
        tipoInput: tipoInfo.tipoInput,
        tipoUsuarioEsperado: tipoInfo.tipoUsuario,
        senha: form.senha
      };
      
      console.log('Dados para API de login:', dadosAPI);
      await new Promise(res => setTimeout(res, 1000));
      
      // Simular resposta da API baseada no tipo de usuário
      let userData;
      
      if (tipoInfo.tipoUsuario === 'admin') {
        userData = {
          usuario: form.usuario,
          nome: 'Bibliotecário Principal',
          email: form.usuario,
          papel: 'admin',
          tipoLogin: 'email',
          id: 'admin123'
        };
        console.log('Login como ADMIN:', userData); // DEBUG
      } else if (tipoInfo.tipoUsuario === 'aluno') {
        userData = {
          usuario: form.usuario,
          nome: 'João Silva',
          email: `${form.usuario}@universitas.edu.br`,
          papel: 'aluno',
          tipoLogin: 'matricula',
          matricula: form.usuario,
          id: 'user123'
        };
        console.log('Login como ALUNO:', userData); // DEBUG
      } else {
        userData = {
          usuario: form.usuario,
          nome: 'Prof. Maria Santos',
          email: form.usuario,
          papel: 'professor',
          tipoLogin: 'email',
          id: 'prof123'
        };
        console.log('Login como PROFESSOR:', userData); // DEBUG
      }
      
      setSuccess("Login realizado! Redirecionando...");
      setTimeout(() => onLogin(userData), 1200);
      
    } catch (error) {
      setErrors({ geral: getApiErrorMessage(error) });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 animate-in fade-in duration-300">
      {/* Header simplificado */}
      <div className="w-full h-20 bg-blue-600 flex items-center px-8 shadow-lg">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center gap-2 text-white hover:text-blue-200 transition-all duration-200 p-2 rounded-lg hover:bg-blue-500 active:scale-95"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline font-medium">Voltar</span>
          </button>
          <div className="flex items-center gap-2 text-white text-2xl font-bold">
            LUMIBOOK <BookOpen size={28} />
          </div>
        </div>
      </div>

      {/* Container principal */}
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] p-4">
        <div className="w-full max-w-md">
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
                <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-center text-sm animate-pulse flex items-center gap-2">
                  <AlertCircle size={16} />
                  {errors.geral}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-center text-sm flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  {success}
                </div>
              )}

              {/* Informações sobre tipos de login - ATUALIZADA */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
                <h3 className="font-semibold text-blue-900 mb-2">Como fazer login:</h3>
                <div className="space-y-2 text-blue-700">
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-green-600" />
                    <span><strong>Alunos:</strong> Digite apenas sua matrícula</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-blue-600" />
                    <span><strong>Professores:</strong> Digite seu email institucional</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield size={14} className="text-red-600" />
                    <span><strong>Admin:</strong> admin@universitas.edu.br</span>
                  </div>
                </div>
              </div>

              {/* Campo usuário */}
              <div className="space-y-2">
                <label htmlFor="usuario" className="text-gray-700 text-sm font-medium">
                  Matrícula ou Email Institucional<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="usuario"
                    name="usuario"
                    value={form.usuario}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 pr-10 border rounded-lg transition-all duration-200 ${
                      errors.usuario 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Digite seu email ou matrícula"
                    required
                  />
                  {inputInfo && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {inputInfo.tipoInput === 'email' ? (
                        <Mail size={16} className="text-blue-500" />
                      ) : (
                        <Hash size={16} className="text-green-500" />
                      )}
                    </div>
                  )}
                </div>
                {errors.usuario && <p className="text-red-500 text-xs">{errors.usuario}</p>}
                
                {/* Informação sobre o tipo de usuário detectado - ATUALIZADA */}
                {inputInfo && (
                  <div className={`border rounded-lg p-3 animate-in slide-in-from-top duration-200 ${
                    inputInfo.tipoUsuario === 'aluno' 
                      ? 'bg-green-50 border-green-200' 
                      : inputInfo.tipoUsuario === 'admin'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}>
                    <p className={`text-xs font-medium flex items-center gap-2 ${
                      inputInfo.tipoUsuario === 'aluno' 
                        ? 'text-green-700' 
                        : inputInfo.tipoUsuario === 'admin'
                        ? 'text-red-700'
                        : 'text-blue-700'
                    }`}>
                      {inputInfo.tipoUsuario === 'admin' ? (
                        <>
                          <Shield size={12} />
                          <span className="font-semibold">Login como Administrador</span> • Acesso total ao sistema
                        </>
                      ) : inputInfo.tipoInput === 'email' ? (
                        <>
                          <Mail size={12} />
                          <span className="font-semibold">Login como Professor</span> • Email institucional detectado
                        </>
                      ) : (
                        <>
                          <Hash size={12} />
                          <span className="font-semibold">Login como Aluno</span> • Matrícula detectada
                        </>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Campo senha */}
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
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200 active:scale-95"
                    aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
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