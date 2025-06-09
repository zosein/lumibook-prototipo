// Constantes de validação
const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    INSTITUTIONAL_PATTERN: /^[a-zA-Z0-9._%+-]+@universitas\.edu\.br$/,
    INSTITUTIONAL_DOMAIN: '@universitas.edu.br'
  },
  
  // NOVO: Email específico para admin
  ADMIN_EMAIL: {
    PATTERN: /^admin@(universitas\.edu\.br|instituicao\.edu)$/,
    DOMAIN: '@universitas.edu.br'
  },

  MATRICULA: {
    PATTERN: /^\d{7,}$/,
    MIN_LENGTH: 7,
    MAX_LENGTH: 15
  },

  SENHA: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: true,
    SPECIAL_CHARS: /[!@#$%^&*(),.?":{}|<>]/
  },

  NOME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-ZÀ-ÿ\s]+$/
  }
};

// Objeto validators com todas as funções
export const validators = {
  // Validação de email geral
  isEmailValido: (email) => {
    if (!email) return false;
    return VALIDATION_RULES.EMAIL.PATTERN.test(email);
  },

  // Validação de email institucional para professores
  isEmailInstitucional: (email) => {
    if (!email) return false;
    return VALIDATION_RULES.EMAIL.INSTITUTIONAL_PATTERN.test(email);
  },

  // NOVO: Validação de email específico para admin
  isEmailAdmin: (email) => {
    if (!email) return false;
    return VALIDATION_RULES.ADMIN_EMAIL.PATTERN.test(email);
  },

  // Validação de matrícula
  isMatriculaValida: (matricula) => {
    if (!matricula) return false;
    const matriculaStr = String(matricula);
    return VALIDATION_RULES.MATRICULA.PATTERN.test(matriculaStr) &&
           matriculaStr.length >= VALIDATION_RULES.MATRICULA.MIN_LENGTH &&
           matriculaStr.length <= VALIDATION_RULES.MATRICULA.MAX_LENGTH;
  },

  // Validação de senha
  isSenhaValida: (senha) => {
    if (!senha || senha.length < VALIDATION_RULES.SENHA.MIN_LENGTH) {
      return false;
    }

    const hasUppercase = /[A-Z]/.test(senha);
    const hasLowercase = /[a-z]/.test(senha);
    const hasNumber = /\d/.test(senha);
    const hasSpecial = VALIDATION_RULES.SENHA.SPECIAL_CHARS.test(senha);

    return hasUppercase && hasLowercase && hasNumber && hasSpecial;
  },

  // Validação de nome
  isNomeValido: (nome) => {
    if (!nome) return false;
    const nomeStr = String(nome).trim();
    return nomeStr.length >= VALIDATION_RULES.NOME.MIN_LENGTH &&
           nomeStr.length <= VALIDATION_RULES.NOME.MAX_LENGTH &&
           VALIDATION_RULES.NOME.PATTERN.test(nomeStr);
  },

  // Validação de papel/role
  isPapelValido: (papel, validRoles = ['aluno', 'professor', 'admin']) => {
    return papel && validRoles.includes(papel);
  },

  // ATUALIZADA: Função para determinar tipo de usuário no login
  determinarTipoUsuarioLogin: (inputUsuario) => {
    if (!inputUsuario) return null;
    
    const isEmail = inputUsuario.includes('@');
    const isMatricula = /^\d{7,}$/.test(inputUsuario);
    
    // Verificar se é email de admin (PRIMEIRO para ter precedência)
    if (isEmail && validators.isEmailAdmin(inputUsuario)) {
      return { 
        tipoInput: 'email', 
        tipoUsuario: 'admin',
        identificadorAPI: inputUsuario
      };
    }
    
    // Verificar se é email institucional (professor)
    if (isEmail && validators.isEmailInstitucional(inputUsuario)) {
      return { 
        tipoInput: 'email', 
        tipoUsuario: 'professor',
        identificadorAPI: inputUsuario
      };
    }
    
    // Verificar se é matrícula (aluno)
    if (isMatricula && validators.isMatriculaValida(inputUsuario)) {
      return { 
        tipoInput: 'matricula', 
        tipoUsuario: 'aluno',
        identificadorAPI: inputUsuario
      };
    }
    
    return null;
  },

  // Função auxiliar para obter detalhes de senha inválida
  getDetalhesErroSenha: (senha) => {
    const errors = [];
    
    if (!senha) {
      errors.push('Senha é obrigatória');
      return errors;
    }

    if (senha.length < VALIDATION_RULES.SENHA.MIN_LENGTH) {
      errors.push(`Mínimo de ${VALIDATION_RULES.SENHA.MIN_LENGTH} caracteres`);
    }

    if (!/[A-Z]/.test(senha)) {
      errors.push('Pelo menos uma letra maiúscula');
    }

    if (!/[a-z]/.test(senha)) {
      errors.push('Pelo menos uma letra minúscula');
    }

    if (!/\d/.test(senha)) {
      errors.push('Pelo menos um número');
    }

    if (!VALIDATION_RULES.SENHA.SPECIAL_CHARS.test(senha)) {
      errors.push('Pelo menos um caractere especial (!@#$%^&*(),.?":{}|<>)');
    }

    return errors;
  }
};

// Mensagens de erro padronizadas
export const ERROR_MESSAGES = {
  // Campos obrigatórios
  CAMPO_OBRIGATORIO: "Este campo é obrigatório.",
  
  // Email
  EMAIL_INVALIDO: "Por favor, insira um email válido.",
  EMAIL_INSTITUCIONAL_REQUIRED: "Use seu email institucional (@universitas.edu.br).",
  EMAIL_INSTITUCIONAL_INVALIDO: "Email deve ter o domínio @universitas.edu.br.",
  
  // NOVOS para admin
  ADMIN_EMAIL_REQUIRED: "Email de administrador é obrigatório.",
  ADMIN_EMAIL_INVALIDO: "Use o email específico de administrador (admin@universitas.edu.br).",
  ADMIN_ACESSO_NEGADO: "Acesso restrito apenas para administradores.",
  
  // Matrícula
  MATRICULA_REQUIRED: "Matrícula é obrigatória.",
  MATRICULA_INVALIDA: "Matrícula deve ter pelo menos 7 dígitos numéricos.",
  
  // Senha
  SENHA_REQUIRED: "Senha é obrigatória.",
  SENHA_INVALIDA: "Senha deve ter pelo menos 8 caracteres, incluindo maiúscula, minúscula, número e caractere especial.",
  SENHAS_NAO_COINCIDEM: "As senhas não coincidem.",
  
  // Nome
  NOME_REQUIRED: "Nome é obrigatório.",
  NOME_INVALIDO: "Nome deve ter entre 2-100 caracteres e conter apenas letras.",
  
  // Papel
  PAPEL_REQUIRED: "Selecione seu papel no sistema.",
  PAPEL_INVALIDO: "Papel selecionado é inválido.",
  
  // Login
  LOGIN_INVALIDO: "Email/matrícula ou senha incorretos.",
  LOGIN_FORMATO_INVALIDO: "Formato inválido. Use matrícula (alunos), email institucional (professores) ou admin@universitas.edu.br (administrador).",
  
  // Registro
  USUARIO_JA_EXISTE: "Este usuário já está cadastrado.",
  REGISTRO_ERRO: "Erro ao realizar cadastro. Tente novamente.",
  
  // Gerais
  ERRO_INESPERADO: "Ocorreu um erro inesperado. Tente novamente.",
  ERRO_CONEXAO: "Erro de conexão. Verifique sua internet."
};

// Funções utilitárias para validação de formulários e regras de negócio

// Valida dados do formulário de cadastro
export function validateRegister(form) {
  const errors = {};
  const allowedRoles = ['aluno', 'professor'];

  // Papel
  if (!form.papel) {
    errors.papel = 'Selecione o tipo de usuário (Aluno ou Professor).';
  } else if (!allowedRoles.includes(form.papel)) {
    errors.papel = 'Tipo de usuário inválido.';
  }

  // Nome
  if (!form.nome || form.nome.trim().length === 0) {
    errors.nome = 'O nome é obrigatório.';
  } else if (form.nome.length < 3) {
    errors.nome = 'O nome deve ter pelo menos 3 caracteres.';
  } else if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(form.nome)) {
    errors.nome = 'O nome deve conter apenas letras e espaços.';
  }

  // Email obrigatório para todos
  if (!form.email || form.email.trim().length === 0) {
    errors.email = 'O email é obrigatório.';
  } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(form.email)) {
    errors.email = 'O email informado não é válido.';
  } else if (form.papel === 'professor') {
    if (!form.email.endsWith('@universitas.edu.br') && !form.email.endsWith('@instituicao.edu')) {
      errors.email = 'Professores devem usar email institucional (@universitas.edu.br ou @instituicao.edu).';
    }
  } else if (form.papel === 'aluno') {
    if (form.email.endsWith('@universitas.edu.br') || form.email.endsWith('@instituicao.edu')) {
      errors.email = 'Alunos não podem usar email institucional. Use um email pessoal.';
    }
  }

  // Matrícula
  if (form.papel === 'aluno') {
    if (!form.matricula || form.matricula.trim().length === 0) {
      errors.matricula = 'A matrícula é obrigatória para alunos.';
    } else if (!/^\d{7,}$/.test(form.matricula)) {
      errors.matricula = 'A matrícula deve conter pelo menos 7 dígitos numéricos.';
    }
  }

  // Telefone
  if (!form.telefone || form.telefone.trim().length === 0) {
    errors.telefone = 'O telefone é obrigatório.';
  } else if (form.telefone.replace(/\D/g, '').length < 10) {
    errors.telefone = 'O telefone deve ter pelo menos 10 dígitos.';
  }

  // Senha
  if (!form.senha) {
    errors.senha = 'A senha é obrigatória.';
  } else {
    const detalhesSenha = validators.getDetalhesErroSenha(form.senha);
    if (detalhesSenha.length > 0) {
      errors.senha = detalhesSenha.join(' | ');
    }
  }

  // Confirmação de senha
  if (!form.confirmarSenha) {
    errors.confirmarSenha = 'Confirme a senha.';
  } else if (form.senha !== form.confirmarSenha) {
    errors.confirmarSenha = 'As senhas não coincidem.';
  }

  return errors;
}

// Valida login (aceita matrícula ou email institucional)
export function validateLogin({ login, senha }) {
  const errors = {};
  if (!login) {
    errors.login = 'Informe matrícula ou email institucional';
  }
  if (!senha) {
    errors.senha = 'Informe a senha';
  }
  return errors;
}

// Configurações de tipos de usuário
export const USER_ROLES = [
  { value: 'aluno', label: 'Aluno' },
  { value: 'professor', label: 'Professor' },
  { value: 'admin', label: 'Bibliotecário/Admin' }
];

// Função auxiliar para obter mensagem de erro da API
export const getApiErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  return ERROR_MESSAGES.ERRO_INESPERADO;
};

// Função auxiliar para debug
export const debugValidation = (input, expectedType) => {
  console.log('=== DEBUG VALIDATION ===');
  console.log('Input:', input);
  console.log('Expected Type:', expectedType);
  
  const result = validators.determinarTipoUsuarioLogin(input);
  console.log('Validation Result:', result);
  
  if (input?.includes('@')) {
    console.log('Is Admin Email:', validators.isEmailAdmin(input));
    console.log('Is Institutional Email:', validators.isEmailInstitucional(input));
  } else {
    console.log('Is Valid Matricula:', validators.isMatriculaValida(input));
  }
  
  console.log('========================');
  return result;
};


