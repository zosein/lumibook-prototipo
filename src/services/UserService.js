/**
 * 
 * Responsável por gerenciar dados de usuário incluindo:
 * - Avatar dinâmico
 * - Informações de perfil (status, data de criação, permissões)
 * - Configurações de conta
 * - Autenticação e login
 * 
 * Este serviço substitui todos os dados hardcoded de usuário por dados reais da API
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export class UserService {

  // ========== MÉTODOS DE AUTENTICAÇÃO ==========

  /**
   * Realizar login do usuário
   * @param {Object} credentials - Credenciais de login
   * @param {string} credentials.identificador - Email ou matrícula
   * @param {string} credentials.senha - Senha do usuário
   * @param {string} credentials.tipoInput - 'email' ou 'matricula'
   * @param {string} credentials.tipoUsuarioEsperado - 'aluno', 'professor' ou 'admin'
   * @returns {Promise<Object>} Dados do usuário autenticado
   */
  static async login(credentials) {
    try {
      const endpoint = `${API_BASE_URL}/api/auth/login`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identificador: credentials.identificador,
          senha: credentials.senha,
          tipoInput: credentials.tipoInput,
          tipoUsuarioEsperado: credentials.tipoUsuarioEsperado
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Erro de autenticação: ${response.status}`);
      }

      const authData = await response.json();
      
      // Salvar token de autenticação
      if (authData.token) {
        localStorage.setItem('authToken', authData.token);
      }

      // Normalizar dados do usuário
      const userData = {
        id: authData.usuario.id,
        usuario: authData.usuario.usuario || authData.usuario.email || authData.usuario.matricula,
        nome: authData.usuario.nome,
        email: authData.usuario.email,
        papel: authData.usuario.papel,
        tipoLogin: authData.usuario.tipoLogin,
        matricula: authData.usuario.matricula || null
      };

      return userData;

    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  /**
   * Realizar logout do usuário
   */
  static async logout() {
    try {
      const endpoint = `${API_BASE_URL}/api/auth/logout`;
      
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        }
      });

    } catch (error) {
      console.warn('Erro ao fazer logout na API:', error);
    } finally {
      // Sempre limpar dados locais
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Verificar se o usuário está autenticado
   * @returns {boolean} Se possui token válido
   */
  static isAuthenticated() {
    const token = localStorage.getItem('authToken');
    return !!token;
  }

  /**
   * Obter token de autenticação atual
   * @returns {string|null} Token JWT
   */
  static getAuthToken() {
    return localStorage.getItem('authToken');
  }

  // ========== MÉTODOS DE PERFIL E AVATAR ==========
  
  /**
   * Buscar avatar do usuário
   * @param {string} userId - ID do usuário
   * @param {string} userType - Tipo do usuário (aluno, professor, admin)
   * @returns {Promise<string>} URL do avatar
   */
  static async getUserAvatar(userId, userType = 'aluno') {
    try {
      const endpoint = `${API_BASE_URL}/api/usuarios/${userId}/avatar`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        // Se não encontrar avatar específico, retornar avatar padrão baseado no tipo
        return this.getDefaultAvatar(userType);
      }

      const data = await response.json();
      return data.avatarUrl || this.getDefaultAvatar(userType);

    } catch (error) {
      console.warn('Erro ao buscar avatar do usuário:', error);
      return this.getDefaultAvatar(userType);
    }
  }

  /**
   * Buscar informações completas do perfil do usuário
   * @param {string} userId - ID do usuário
   * @param {string} userType - Tipo do usuário
   * @returns {Promise<Object>} Dados completos do perfil
   */
  static async getUserProfile(userId, userType = 'aluno') {
    try {
      const endpoint = `${API_BASE_URL}/api/${userType}s/${userId}/perfil`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar perfil: ${response.statusText}`);
      }

      const profileData = await response.json();
      
      // Validar e normalizar dados do perfil
      return this.normalizeProfileData(profileData, userType);

    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      // Retornar dados padrão em caso de erro
      return this.getDefaultProfileData(userId, userType);
    }
  }

  /**
   * Atualizar status da conta do usuário
   * @param {string} userId - ID do usuário
   * @param {string} userType - Tipo do usuário
   * @param {string} status - Novo status (ativa, suspensa, inativa)
   * @returns {Promise<boolean>} Sucesso da operação
   */
  static async updateAccountStatus(userId, userType, status) {
    try {
      const endpoint = `${API_BASE_URL}/api/${userType}s/${userId}/status`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status })
      });

      return response.ok;

    } catch (error) {
      console.error('Erro ao atualizar status da conta:', error);
      return false;
    }
  }

  /**
   * Buscar logs de atividade do usuário
   * @param {string} userId - ID do usuário
   * @param {number} limit - Número máximo de atividades
   * @returns {Promise<Array>} Lista de atividades
   */
  static async getUserActivities(userId, limit = 10) {
    try {
      const endpoint = `${API_BASE_URL}/api/usuarios/${userId}/atividades?limit=${limit}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar atividades: ${response.statusText}`);
      }

      const activities = await response.json();
      return activities.map(activity => this.normalizeActivityData(activity));

    } catch (error) {
      console.error('Erro ao buscar atividades do usuário:', error);
      return [];
    }
  }

  /**
   * Buscar logs de atividade do sistema (admin)
   * @param {number} limit - Número máximo de atividades
   * @returns {Promise<Array>} Lista de atividades do sistema
   */
  static async getSystemActivities(limit = 10) {
    try {
      const endpoint = `${API_BASE_URL}/api/admin/atividades-sistema?limit=${limit}`;
      
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar atividades do sistema: ${response.statusText}`);
      }

      const activities = await response.json();
      return activities.map(activity => this.normalizeActivityData(activity));

    } catch (error) {
      console.error('Erro ao buscar atividades do sistema:', error);
      return [];
    }
  }

  // ========== MÉTODOS AUXILIARES ==========

  /**
   * Obter avatar padrão baseado no tipo de usuário
   */
  static getDefaultAvatar(userType) {
    const avatars = {
      'aluno': 'https://ui-avatars.com/api/?name=Aluno&background=3B82F6&color=fff&size=128',
      'professor': 'https://ui-avatars.com/api/?name=Professor&background=059669&color=fff&size=128',
      'admin': 'https://ui-avatars.com/api/?name=Admin&background=DC2626&color=fff&size=128'
    };
    
    return avatars[userType] || avatars['aluno'];
  }

  /**
   * Normalizar dados do perfil vindos da API
   */
  static normalizeProfileData(profileData, userType) {
    return {
      ...profileData,
      avatar: profileData.avatar || this.getDefaultAvatar(userType),
      statusConta: profileData.statusConta || 'ativa',
      membroDesde: profileData.dataCriacao ? new Date(profileData.dataCriacao).toLocaleDateString('pt-BR', { 
        year: 'numeric', 
        month: 'long' 
      }) : 'Data não disponível',
      tipoLogin: profileData.tipoLogin || (userType === 'aluno' ? 'matrícula' : 'email'),
      permissoes: profileData.permissoes || this.getDefaultPermissions(userType)
    };
  }

  /**
   * Obter dados padrão do perfil em caso de erro na API
   */
  static getDefaultProfileData(userId, userType) {
    return {
      id: userId,
      avatar: this.getDefaultAvatar(userType),
      statusConta: 'ativa',
      membroDesde: 'Data não disponível',
      tipoLogin: userType === 'aluno' ? 'matrícula' : 'email',
      permissoes: this.getDefaultPermissions(userType)
    };
  }

  /**
   * Obter permissões padrão baseadas no tipo de usuário
   */
  static getDefaultPermissions(userType) {
    const permissions = {
      'aluno': 'Acesso básico',
      'professor': 'Acesso professor',
      'admin': 'Acesso total'
    };
    
    return permissions[userType] || permissions['aluno'];
  }

  /**
   * Normalizar dados de atividade vindos da API
   */
  static normalizeActivityData(activity) {
    return {
      id: activity.id,
      action: activity.descricao || activity.action,
      details: activity.detalhes || activity.details,
      time: activity.dataHora ? this.formatTimeAgo(new Date(activity.dataHora)) : 'Recente',
      icon: activity.icon || 'Activity',
      color: activity.cor || 'blue',
      userId: activity.usuarioId
    };
  }

  /**
   * Formatar tempo relativo (ex: "2 min atrás")
   */
  static formatTimeAgo(date) {
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Agora';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min atrás`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else if (diffInDays < 7) {
      return `${diffInDays}d atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }

  /**
   * Verificar se o usuário tem permissão específica
   * @param {Object} user - Dados do usuário
   * @param {string} permission - Permissão a verificar
   * @returns {boolean} Se tem a permissão
   */
  static hasPermission(user, permission) {
    if (!user || !user.papel) return false;
    
    const rolePermissions = {
      'admin': ['read', 'write', 'delete', 'manage_users', 'manage_system'],
      'professor': ['read', 'write', 'manage_loans'],
      'aluno': ['read']
    };
    
    const userPermissions = rolePermissions[user.papel] || [];
    return userPermissions.includes(permission);
  }
}

export default UserService;
