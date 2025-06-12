// Serviço para comunicação com API de estatísticas

import StatsCache from '../utils/StatsCache';
import api from "./api";

// Serviço responsável por operações de estatísticas do sistema
class StatsService {
  // Buscar estatísticas do usuário
  async getUserStats(userId, userType = "aluno") {
    try {
      const token = localStorage.getItem("authToken");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      const response = await api.get(`/api/users/${userId}/stats`, config);
      const raw = response.data?.data || {};

      const reservas = Array.isArray(raw.reservas)
        ? raw.reservas.map(r => ({
            ...r,
            tituloLivro: r.tituloLivro || (r.livro?.title) || "Livro"
          }))
        : [];

      // Atualizar cache
      StatsCache.set(userId, {
        ...raw,
        reservas,
        livrosDisponiveis: raw.livrosDisponiveis ?? (
          raw.limiteConcorrente && raw.livrosEmprestados !== undefined
            ? raw.limiteConcorrente - raw.livrosEmprestados
            : 0
        ),
        livrosEmprestados: raw.livrosEmprestados ?? 0,
      });

      return StatsCache.get(userId);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  // Buscar estatísticas da biblioteca
  async getLibraryStats() {
    try {
      const response = await api.get('/library/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas da biblioteca:', error);
      throw error;
    }
  }

  // Buscar estatísticas de empréstimos
  async getLoanStats() {
    try {
      const response = await api.get('/loans/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de empréstimos:', error);
      throw error;
    }
  }

  // Buscar estatísticas de reservas
  async getReservationStats() {
    try {
      const response = await api.get('/reservations/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de reservas:', error);
      throw error;
    }
  }

  // Buscar estatísticas de multas
  async getFineStats() {
    try {
      const response = await api.get('/fines/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de multas:', error);
      throw error;
    }
  }

  // Buscar estatísticas de usuários
  async getUserTypeStats() {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de usuários:', error);
      throw error;
    }
  }

  // Buscar estatísticas de livros
  async getBookStats() {
    try {
      const response = await api.get('/books/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de livros:', error);
      throw error;
    }
  }

  // Buscar estatísticas de categorias
  async getCategoryStats() {
    try {
      const response = await api.get('/categories/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de categorias:', error);
      throw error;
    }
  }

  // Buscar estatísticas gerais do sistema (admin)
  async getSystemStats() {
    try {
      const response = await api.get('/system/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do sistema:', error);
      throw error;
    }
  }

  // Buscar estatísticas de uso de um livro específico
  async getBookStatsById(bookId) {
    try {
      const response = await api.get(`/api/stats/book/${bookId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do livro:', error);
      throw error;
    }
  }

  // Validar estrutura dos dados vindos da API
  validateStatsData(data, userType) {
    const limiteConcorrente = userType === 'professor' ? 10 : 3;
    const livrosEmprestados = Math.max(0, parseInt(data.livrosEmprestados || 0));
    const livrosDisponiveis = Math.max(0, limiteConcorrente - livrosEmprestados);

    const baseStructure = {
      livrosEmprestados,
      livrosDisponiveis,
      limiteConcorrente,
      devolucoesPendentes: Math.max(0, parseInt(data.devolucoesPendentes || 0)),
      reservasAtivas: Math.max(0, parseInt(data.reservasAtivas || 0)),
      historicoEmprestimos: Math.max(0, parseInt(data.historicoEmprestimos || 0)),
      ultimaAtualizacao: data.ultimaAtualizacao || new Date().toISOString(),
      fonte: data.fonte || 'api',
      tipoUsuario: userType,
      ...data
    };

    if (userType === 'professor') {
      baseStructure.multasPendentes = 0;
      baseStructure.bibliografiasGerenciadas = Math.max(0, parseInt(data.bibliografiasGerenciadas || 0));
      baseStructure.turmasAtivas = Math.max(0, parseInt(data.turmasAtivas || 0));
      baseStructure.livrosSolicitados = Math.max(0, parseInt(data.livrosSolicitados || 0));
    } else {
      baseStructure.multasPendentes = Math.max(0, parseInt(data.multasPendentes || 0));
      baseStructure.pontosUsuario = Math.max(0, parseInt(data.pontosUsuario || 0));
    }

    if (baseStructure.livrosEmprestados > baseStructure.limiteConcorrente) {
      console.warn(`⚠️ Inconsistência detectada: ${baseStructure.livrosEmprestados} empréstimos excedem o limite de ${baseStructure.limiteConcorrente}`);
      baseStructure.livrosEmprestados = baseStructure.limiteConcorrente;
      baseStructure.livrosDisponiveis = 0;
    }

    return baseStructure;
  }

  // Atualizar uma estatística específica do usuário
  async updateStat(userId, statKey, newValue) {
    const response = await api.put(
      `/api/stats/user/${userId}/${statKey}`,
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
  }

  // Buscar histórico de empréstimos do usuário
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
  }

  // Calcular limites e disponibilidade de empréstimos
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
  }

  // Buscar dados do dashboard do administrador
  async getAdminDashboard() {
    // MOCK: Retorna dados fornecidos pelo usuário
    return {
      data: {
        sucesso: true,
        dados: {
          totalUsuarios: 5,
          totalLivros: 9,
          totalEmprestimos: 7,
          totalReservas: 12,
          totalMultas: 0,
          emprestimosAbertos: 1,
          reservasPendentes: 3,
          multasPendentes: 0,
          atividadesRecentes: []
        }
      }
    };
  }

  // Atualizar estatísticas após operação
  async updateStats(userId, operation) {
    try {
      // Limpar cache
      StatsCache.remove(userId);
      
      // Buscar novas estatísticas
      const newStats = await this.getUserStats(userId);
      
      // Disparar evento de atualização
      window.dispatchEvent(new Event('atualizar-estatisticas'));
      
      return newStats;
    } catch (error) {
      console.error('Erro ao atualizar estatísticas:', error);
      throw error;
    }
  }
}

const statsService = new StatsService();
export default statsService;
