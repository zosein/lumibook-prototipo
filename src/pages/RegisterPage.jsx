import { useState } from 'react';
import { BookOpen, Eye, EyeOff, User, Mail, Phone, Loader2, ArrowLeft, Check, X, Hash, AlertCircle } from 'lucide-react';
import { validateRegister } from '../utils/Validation';

const USER_ROLES = [
  { value: 'aluno', label: 'Aluno' },
  { value: 'professor', label: 'Professor' },
];

export default function RegisterPage({ setCurrentPage, onRegisterSuccess }) {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    papel: '',
    matricula: '',
    senha: '',
    confirmarSenha: '',
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    setSuccess('');
    
    // Limpar matrícula se mudar de aluno para professor
    if (name === 'papel' && value === 'professor') {
      setForm(prev => ({ ...prev, matricula: '' }));
    }
  };

  const handleBlur = () => {
    const validationErrors = validateRegister(form);
    setErrors(prev => ({ ...prev, ...validationErrors }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validateRegister(form);
    
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setSuccess('');
      return;
    }
    
    setSubmitting(true);
    setErrors({});
    
    try {
      // Preparar dados para API - garantir todos os campos necessários
      const dadosAPI = {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone || "",
        papel: form.papel || "",
        senha: form.senha,
        matricula: form.papel === 'aluno' ? (form.matricula || "") : ""
      };
      // Simulação de cadastro - substituir pela chamada real da API
      // const resposta = await UserService.register(dadosAPI); // Exemplo real
      const resposta = { success: true }; // Simulação
      if (resposta.success === false || resposta.message) {
        setErrors({ geral: resposta.message || "Erro ao cadastrar. Tente novamente mais tarde." });
      } else {
        setSuccess("Cadastro realizado com sucesso! Redirecionando para o login...");
        setTimeout(() => {
          onRegisterSuccess();
        }, 1500);
      }
    } catch (error) {
      setErrors({ geral: "Erro ao cadastrar. Tente novamente mais tarde." });
    } finally {
      setSubmitting(false);
    }
  };

  const getPasswordStrength = () => {
    const senha = form.senha || '';
    const checks = [
      { label: 'Mínimo de 8 caracteres', test: senha.length >= 8 },
      { label: 'Letra maiúscula', test: /[A-Z]/.test(senha) },
      { label: 'Letra minúscula', test: /[a-z]/.test(senha) },
      { label: 'Número', test: /\d/.test(senha) },
      { label: 'Caractere especial', test: /[!@#$%^&*(),.?":{}|<>]/.test(senha) },
    ];
    return checks;
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
              <p className="text-blue-100 text-lg">Crie sua conta</p>
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

              {/* Campo nome */}
              <div className="space-y-2">
                <label htmlFor="nome" className="text-gray-700 text-sm font-medium">
                  Nome completo<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="nome"
                    name="nome"
                    value={form.nome}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 pl-10 border rounded-lg transition-all duration-200 ${
                      errors.nome 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Digite seu nome completo"
                    required
                  />
                  <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.nome && <p className="text-red-500 text-xs">{errors.nome}</p>}
              </div>

              {/* Campo email */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-gray-700 text-sm font-medium">
                  Email institucional<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 pl-10 border rounded-lg transition-all duration-200 ${
                      errors.email 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    } focus:outline-none focus:ring-2`}
                    placeholder="nome@universitas.edu.br"
                    required
                  />
                  <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
              </div>

              {/* Campo telefone */}
              <div className="space-y-2">
                <label htmlFor="telefone" className="text-gray-700 text-sm font-medium">
                  Telefone<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    value={form.telefone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 pl-10 border rounded-lg transition-all duration-200 ${
                      errors.telefone 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    } focus:outline-none focus:ring-2`}
                    placeholder="(XX) XXXXX-XXXX"
                    required
                  />
                  <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                {errors.telefone && <p className="text-red-500 text-xs">{errors.telefone}</p>}
              </div>

              {/* Campo papel */}
              <div className="space-y-2">
                <label htmlFor="papel" className="text-gray-700 text-sm font-medium">
                  Você é...<span className="text-red-500 ml-1">*</span>
                </label>
                <select
                  id="papel"
                  name="papel"
                  value={form.papel}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 ${
                    errors.papel 
                      ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                  } focus:outline-none focus:ring-2`}
                  required
                >
                  <option value="">Selecione</option>
                  {USER_ROLES.map(role => (
                    <option key={role.value} value={role.value}>{role.label}</option>
                  ))}
                </select>
                {errors.papel && <p className="text-red-500 text-xs">{errors.papel}</p>}
              </div>

              {/* Campo matrícula - APENAS para ALUNOS */}
              {form.papel === 'aluno' && (
                <div className="space-y-2 animate-in slide-in-from-top duration-300">
                  <label htmlFor="matricula" className="text-gray-700 text-sm font-medium">
                    Matrícula<span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="matricula"
                      name="matricula"
                      value={form.matricula}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 pl-10 border rounded-lg transition-all duration-200 ${
                        errors.matricula 
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      } focus:outline-none focus:ring-2`}
                      placeholder="Digite sua matrícula (mín. 7 números)"
                      required
                    />
                    <Hash size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  </div>
                  {errors.matricula && <p className="text-red-500 text-xs">{errors.matricula}</p>}
                  {/* NOVA INFORMAÇÃO IMPORTANTE */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-amber-700">
                      <p className="font-semibold mb-1">⚠️ Importante sobre o login:</p>
                      <p>Alunos fazem login <strong>APENAS com a matrícula</strong> (não com email). Guarde bem seu número!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Informação sobre login para professores */}
              {form.papel === 'professor' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 animate-in slide-in-from-top duration-300">
                  <div className="flex items-start gap-2">
                    <Mail size={16} className="text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-700">
                      <p className="font-semibold mb-1">ℹ️ Informação sobre login:</p>
                      <p>Professores fazem login <strong>APENAS com email institucional</strong> (o mesmo usado no cadastro).</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Campo senha com indicadores */}
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
                    placeholder="Digite uma senha forte"
                    required
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
                
                {/* Indicadores de força da senha */}
                {form.senha && (
                  <div className="space-y-1">
                    {getPasswordStrength().map((check, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {check.test ? (
                          <Check size={12} className="text-green-500" />
                        ) : (
                          <X size={12} className="text-gray-300" />
                        )}
                        <span className={`text-xs ${check.test ? 'text-green-600' : 'text-gray-400'}`}>
                          {check.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                {errors.senha && <p className="text-red-500 text-xs">{errors.senha}</p>}
              </div>

              {/* Campo confirmar senha */}
              <div className="space-y-2">
                <label htmlFor="confirmarSenha" className="text-gray-700 text-sm font-medium">
                  Confirmar senha<span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <input
                    id="confirmarSenha"
                    name="confirmarSenha"
                    type={showPassword ? "text" : "password"}
                    value={form.confirmarSenha}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 pl-10 border rounded-lg transition-all duration-200 ${
                      errors.confirmarSenha 
                        ? "border-red-300 focus:border-red-500 focus:ring-red-200" 
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                    } focus:outline-none focus:ring-2`}
                    placeholder="Repita sua senha"
                    required
                  />
                </div>
                {errors.confirmarSenha && <p className="text-red-500 text-xs">{errors.confirmarSenha}</p>}
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
                    Cadastrando...
                  </>
                ) : (
                  'Criar conta'
                )}
              </button>

              {/* Link para login */}
              <div className="text-center pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setCurrentPage('login')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors hover:underline"
                >
                  Já tem conta? <span className="font-semibold">Faça login aqui</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}