// Regras de validação centralizadas
export const VALIDATION_RULES = {
  MATRICULA: {
    MIN_LENGTH: 7,
    PATTERN: /^\d{7,}$/ // Mínimo 7 números (atualizado)
  },
  SENHA: {
    MIN_LENGTH: 6, // Atualizado para 6 caracteres
    PATTERN: /^(?=.*[A-Z])(?=.*\d).{6,}$/ // Mín 6 chars, 1 maiúscula, 1 número
  },
  EMAIL_INSTITUCIONAL: {
    PATTERN: /@universitas\.edu\.br\s*$/i
  },
  TELEFONE: {
    PATTERN: /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/
  },
  NOME: {
    MIN_LENGTH: 2,
    PATTERN: /^[a-zA-ZÀ-ÿ\s]{2,}$/ // Apenas letras e espaços, mín 2 caracteres
  }
};

// Validadores específicos
export const validators = {
  // Validar email institucional (usando a função existente)
  isEmailInstitucional: (email) => {
    if (!email) return false;
    return VALIDATION_RULES.EMAIL_INSTITUCIONAL.PATTERN.test(email);
  },
  
  // Validar matrícula (atualizado para mín 7 números)
  isMatriculaValida: (matricula) => {
    if (!matricula) return false;
    return VALIDATION_RULES.MATRICULA.PATTERN.test(matricula);
  },
  
  // Validar senha forte (atualizado para mín 6 chars)
  isSenhaForte: (senha) => {
    if (!senha) return false;
    return senha.length >= VALIDATION_RULES.SENHA.MIN_LENGTH && 
           /[A-Z]/.test(senha) && 
           /[0-9]/.test(senha);
  },
  
  // Validar telefone (usando a função existente)
  isTelefoneValido: (telefone) => {
    if (!telefone) return false;
    return VALIDATION_RULES.TELEFONE.PATTERN.test(telefone);
  },
  
  // Validar nome
  isNomeValido: (nome) => {
    if (!nome) return false;
    return nome.trim().length >= VALIDATION_RULES.NOME.MIN_LENGTH;
  },
  
  // Verificar força da senha com detalhes (compatível com o código existente)
  getPasswordStrength: (senha) => [
    { 
      test: senha && senha.length >= VALIDATION_RULES.SENHA.MIN_LENGTH, 
      label: `Mínimo ${VALIDATION_RULES.SENHA.MIN_LENGTH} caracteres` 
    },
    { 
      test: senha && /[A-Z]/.test(senha), 
      label: "Uma letra maiúscula" 
    },
    { 
      test: senha && /[0-9]/.test(senha), 
      label: "Um número" 
    }
  ],
  
  // Validar se campo está preenchido
  isRequired: (value) => {
    return value && value.toString().trim().length > 0;
  },
  
  // Validar papel/role
  isPapelValido: (papel, validRoles = ['aluno', 'professor']) => {
    return papel && validRoles.includes(papel);
  }
};

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
  // Mensagens gerais
  REQUIRED: (field) => `${field} é obrigatório.`,
  
  // Email
  EMAIL_REQUIRED: "Email institucional é obrigatório.",
  EMAIL_INSTITUCIONAL: "Use seu email institucional (@universitas.edu.br).",
  
  // Matrícula (atualizado)
  MATRICULA_REQUIRED: "Matrícula é obrigatória.",
  MATRICULA_INVALIDA: `Matrícula deve ter no mínimo ${VALIDATION_RULES.MATRICULA.MIN_LENGTH} números.`,
  MATRICULA_PROFESSOR: "Informe a matrícula do professor.",
  
  // Senha (atualizado)
  SENHA_REQUIRED: "Senha é obrigatória.",
  SENHA_FRACA: `Senha deve ter no mínimo ${VALIDATION_RULES.SENHA.MIN_LENGTH} caracteres, 1 maiúscula e 1 número.`,
  SENHA_MIN_LENGTH: `Senha deve ter no mínimo ${VALIDATION_RULES.SENHA.MIN_LENGTH} caracteres.`,
  
  // Outros campos
  NOME_REQUIRED: "Nome completo é obrigatório.",
  NOME_INVALIDO: "Nome deve ter no mínimo 2 caracteres.",
  TELEFONE_REQUIRED: "Telefone é obrigatório.",
  TELEFONE_INVALIDO: "Telefone inválido. Use formato (XX) XXXXX-XXXX.",
  PAPEL_REQUIRED: "Selecione seu papel.",
  PAPEL_INVALIDO: "Papel selecionado é inválido.",
  
  // Login específico
  USUARIO_REQUIRED: "Email ou matrícula é obrigatório.",
  USUARIO_INVALIDO: "Email institucional inválido ou matrícula deve ter no mínimo 7 números."
};

// Validador principal - código limpo sem múltiplos if-else
export const createValidator = (rules) => {
  return (formData) => {
    const errors = {};
    
    Object.entries(rules).forEach(([field, fieldRules]) => {
      const value = formData[field];
      
      // Encontra a primeira regra que falha
      const failedRule = fieldRules.find(rule => {
        try {
          return !rule.validator(value, formData);
        } catch (error) {
          console.warn(`Erro na validação do campo ${field}:`, error);
          return true; // Considera como falha se houver erro
        }
      });
      
      if (failedRule) {
        // Se a mensagem é uma função, chama com o valor
        errors[field] = typeof failedRule.message === 'function' 
          ? failedRule.message(value, formData)
          : failedRule.message;
      }
    });
    
    return errors;
  };
};

// Regras de validação pré-configuradas para LOGIN
export const loginValidationRules = {
  usuario: [
    {
      validator: (value) => validators.isRequired(value),
      message: ERROR_MESSAGES.USUARIO_REQUIRED
    },
    {
      validator: (value) => {
        if (!value) return true; // já validado acima
        const isEmail = value.includes('@');
        return isEmail 
          ? validators.isEmailInstitucional(value) 
          : validators.isMatriculaValida(value);
      },
      message: (value) => {
        if (!value) return ERROR_MESSAGES.USUARIO_REQUIRED;
        return value.includes('@') 
          ? ERROR_MESSAGES.EMAIL_INSTITUCIONAL 
          : ERROR_MESSAGES.MATRICULA_INVALIDA;
      }
    }
  ],
  senha: [
    {
      validator: (value) => validators.isRequired(value),
      message: ERROR_MESSAGES.SENHA_REQUIRED
    },
    {
      validator: (value) => !value || value.length >= VALIDATION_RULES.SENHA.MIN_LENGTH,
      message: ERROR_MESSAGES.SENHA_MIN_LENGTH
    }
  ]
};

// Regras de validação pré-configuradas para CADASTRO
export const registerValidationRules = {
  nome: [
    {
      validator: (value) => validators.isRequired(value),
      message: ERROR_MESSAGES.NOME_REQUIRED
    },
    {
      validator: (value) => !value || validators.isNomeValido(value),
      message: ERROR_MESSAGES.NOME_INVALIDO
    }
  ],
  email: [
    {
      validator: (value) => validators.isRequired(value),
      message: ERROR_MESSAGES.EMAIL_REQUIRED
    },
    {
      validator: (value) => !value || validators.isEmailInstitucional(value),
      message: ERROR_MESSAGES.EMAIL_INSTITUCIONAL
    }
  ],
  telefone: [
    {
      validator: (value) => validators.isRequired(value),
      message: ERROR_MESSAGES.TELEFONE_REQUIRED
    },
    {
      validator: (value) => !value || validators.isTelefoneValido(value),
      message: ERROR_MESSAGES.TELEFONE_INVALIDO
    }
  ],
  papel: [
    {
      validator: (value) => validators.isRequired(value),
      message: ERROR_MESSAGES.PAPEL_REQUIRED
    },
    {
      validator: (value) => !value || validators.isPapelValido(value),
      message: ERROR_MESSAGES.PAPEL_INVALIDO
    }
  ],
  matricula: [
    {
      validator: (value, formData) => {
        // Só é obrigatório se o papel for professor
        return formData.papel !== 'professor' || validators.isRequired(value);
      },
      message: ERROR_MESSAGES.MATRICULA_PROFESSOR
    },
    {
      validator: (value, formData) => {
        // Só valida se for professor e tiver valor
        return formData.papel !== 'professor' || !value || validators.isMatriculaValida(value);
      },
      message: ERROR_MESSAGES.MATRICULA_INVALIDA
    }
  ],
  senha: [
    {
      validator: (value) => validators.isRequired(value),
      message: ERROR_MESSAGES.SENHA_REQUIRED
    },
    {
      validator: (value) => !value || validators.isSenhaForte(value),
      message: ERROR_MESSAGES.SENHA_FRACA
    }
  ]
};

// Validadores pré-configurados para uso direto
export const validateLogin = createValidator(loginValidationRules);
export const validateRegister = createValidator(registerValidationRules);

// Utilitários para tratamento de erros de API
export const API_ERROR_MESSAGES = {
  // Códigos de status HTTP comuns
  400: "Dados inválidos. Verifique as informações enviadas.",
  401: "Credenciais inválidas. Verifique email/matrícula e senha.",
  403: "Acesso negado. Você não tem permissão para esta ação.",
  404: "Recurso não encontrado.",
  409: "Conflito. Email ou matrícula já cadastrados.",
  422: "Dados não processáveis. Verifique os campos obrigatórios.",
  500: "Erro interno do servidor. Tente novamente mais tarde.",
  502: "Serviço temporariamente indisponível.",
  503: "Serviço em manutenção. Tente novamente mais tarde.",
  
  // Mensagem padrão
  DEFAULT: "Erro inesperado. Tente novamente."
};

// Função para mapear erros de API
export const getApiErrorMessage = (error) => {
  if (error?.response?.status) {
    return API_ERROR_MESSAGES[error.response.status] || API_ERROR_MESSAGES.DEFAULT;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return API_ERROR_MESSAGES.DEFAULT;
};

// Exportação padrão com todos os utilitários
const validationUtils = {
  VALIDATION_RULES,
  validators,
  ERROR_MESSAGES,
  API_ERROR_MESSAGES,
  createValidator,
  validateLogin,
  validateRegister,
  loginValidationRules,
  registerValidationRules,
  getApiErrorMessage
};

export default validationUtils;