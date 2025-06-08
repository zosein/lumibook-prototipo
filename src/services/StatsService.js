// Serviço para comunicação com API de estatísticas

import StatsCache from '../utils/StatsCache';
import api from "./api";

// Serviço responsável por operações de estatísticas do sistema
const StatsService = {
  // Buscar estatísticas do usuário
  async getUserStats(userId, userType = "aluno") {
    const response = await api.get(`/stats/user/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` }
    });
    const raw = response.data && response.data.data ? response.data.data : {};
    return StatsService.validateStatsData({
      livrosEmprestados: raw.livrosLidos || 0,
      reservasAtivas: raw.reservasRealizadas || 0,
      devolucoesPendentes: raw.atrasos || 0,
      // Outros campos podem ser adicionados aqui se necessário
    }, userType);
  },

  // Buscar estatísticas gerais do sistema (admin)
  async getSystemStats() {
    return api.get('/stats/system');
  },

  // Buscar estatísticas de uso de um livro
  async getBookStats(bookId) {
    return api.get(`/stats/book/${bookId}`);
  },

  // Validar estrutura dos dados vindos da API - ATUALIZADO com cálculo correto
  validateStatsData(data, userType) {
    // Determinar limite de empréstimos baseado no tipo de usuário
    const limiteConcorrente = userType === 'professor' ? 10 : 3;
    
    // Garantir que livrosEmprestados seja um número válido
    const livrosEmprestados = Math.max(0, parseInt(data.livrosEmprestados || 0));
    
    // CÁLCULO CORRETO: Livros disponíveis = Limite - Emprestados
    const livrosDisponiveis = Math.max(0, limiteConcorrente - livrosEmprestados);

    const baseStructure = {
      livrosEmprestados,
      livrosDisponiveis, // VALOR CALCULADO CORRETAMENTE
      limiteConcorrente,
      devolucoesPendentes: Math.max(0, parseInt(data.devolucoesPendentes || 0)),
      reservasAtivas: Math.max(0, parseInt(data.reservasAtivas || 0)),
      historicoEmprestimos: Math.max(0, parseInt(data.historicoEmprestimos || 0)),
      ultimaAtualizacao: data.ultimaAtualizacao || new Date().toISOString(),
      fonte: data.fonte || 'api',
      tipoUsuario: userType,
      ...data
    };

    // Validações específicas por tipo
    if (userType === 'professor') {
      baseStructure.multasPendentes = 0; // Professores não têm multa
      baseStructure.bibliografiasGerenciadas = Math.max(0, parseInt(data.bibliografiasGerenciadas || 0));
      baseStructure.turmasAtivas = Math.max(0, parseInt(data.turmasAtivas || 0));
      baseStructure.livrosSolicitados = Math.max(0, parseInt(data.livrosSolicitados || 0));
    } else {
      baseStructure.multasPendentes = Math.max(0, parseInt(data.multasPendentes || 0));
      baseStructure.pontosUsuario = Math.max(0, parseInt(data.pontosUsuario || 0));
    }

    // Validação de consistência: empréstimos não pode exceder limite
    if (baseStructure.livrosEmprestados > baseStructure.limiteConcorrente) {
      console.warn(`⚠️ Inconsistência detectada: ${baseStructure.livrosEmprestados} empréstimos excedem limite de ${baseStructure.limiteConcorrente}`);
      baseStructure.livrosEmprestados = baseStructure.limiteConcorrente;
      baseStructure.livrosDisponiveis = 0;
    }

    return baseStructure;
  },

  // Atualizar uma estatística específica do usuário
  async updateStat(userId, statKey, newValue) {
    const response = await api.put(
      `/stats/user/${userId}/${statKey}`,
      { value: newValue },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      }
    );
    StatsCache.remove(userId);
    return response.data;
  },
  // REMOVIDO: Funções de simulação de empréstimo e devolução
  // Agora use as APIs reais:
  // POST /api/emprestimos para criar empréstimos
  // PUT /api/emprestimos/:id/devolucao para devoluções

  // Buscar histórico de empréstimos
  async getUserHistory(userId, userType, page = 1, limit = 10) {
    try {
      let endpoint = '';
      if (userType === 'aluno' || userType === 'student') {
        endpoint = `/students/${userId}/loan-history`;
      } else if (userType === 'professor' || userType === 'teacher') {
        endpoint = `/teachers/${userId}/loan-history`;
      } else {
        throw new Error('Tipo de usuário inválido para histórico de empréstimos');
      }
      const response = await api.get(`${endpoint}?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          "Content-Type": "application/json",
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      throw error;
    }
  },

  // Calcular limites e disponibilidade para diferentes tipos de usuário
  calculateUserLimits(userType, currentLoans = 0) {
    const limits = {
      aluno: { 
        max: 3, 
        description: 'Alunos podem emprestar até 3 livros simultâneos' 
      },
      professor: { 
        max: 10, 
        description: 'Professores podem emprestar até 10 livros simultâneos' 
      },
      admin: { 
        max: 20, 
        description: 'Administradores têm limite especial' 
      }
    };

    const userLimit = limits[userType] || limits.aluno;
    const available = Math.max(0, userLimit.max - currentLoans);
    const percentage = (currentLoans / userLimit.max) * 100;

    return {
      maxConcorrente: userLimit.max,
      emprestadosAtual: currentLoans,
      disponivelParaEmprestimo: available,
      percentualUso: Math.round(percentage),
      description: userLimit.description,
      canBorrow: available > 0,
      isNearLimit: percentage >= 80,
      isAtLimit: percentage >= 100
    };
  },
};

export default StatsService;