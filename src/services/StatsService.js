// Serviço para comunicação com API de estatísticas

import StatsCache from '../utils/StatsCache';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export class StatsService {
  
  // Buscar estatísticas do usuário
  static async getUserStats(user, forceRefresh = false) {
    if (!user || !user.id) {
      throw new Error('Usuário inválido');
    }

    // Verificar cache primeiro (se não for refresh forçado)
    if (!forceRefresh) {
      const cachedStats = StatsCache.get(user.id);
      if (cachedStats) {
        console.log('Estatísticas carregadas do cache');
        return cachedStats;
      }
    }

    try {
      // Determinar endpoint baseado no tipo de usuário
      const endpoint = user.papel === 'professor' 
        ? `${API_BASE_URL}/api/professores/${user.id}/estatisticas`
        : `${API_BASE_URL}/api/alunos/${user.id}/estatisticas`;

      // Headers com autenticação
      const headers = {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json',
        'X-User-Type': user.papel,
        'X-User-ID': user.id
      };

      console.log(`[API] Buscando estatísticas: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers,
        // Adicionar timeout
        signal: AbortSignal.timeout(10000) // 10 segundos
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const statsData = await response.json();

      // Validar estrutura dos dados
      const validatedStats = StatsService.validateStatsData(statsData, user.papel);

      // Salvar no cache
      StatsCache.set(user.id, validatedStats);

      return validatedStats;

    } catch (error) {
      console.error('Erro ao buscar estatísticas da API:', error);
      
      // Tentar fallback do cache em caso de erro
      const cachedStats = StatsCache.get(user.id);
      if (cachedStats) {
        console.log('Usando cache como fallback');
        return { ...cachedStats, fonte: 'cache_fallback' };
      }
      
      throw error;
    }
  }

  // Validar estrutura dos dados vindos da API - ATUALIZADO com cálculo correto
  static validateStatsData(data, userType) {
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
  }

  // Atualizar uma estatística específica (para uso em tempo real)
  static async updateStat(userId, statKey, newValue) {
    try {
      const endpoint = `${API_BASE_URL}/api/usuarios/${userId}/estatisticas/${statKey}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: newValue })
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar estatística: ${response.statusText}`);
      }

      // Limpar cache para forçar refresh na próxima consulta
      StatsCache.remove(userId);

      return await response.json();

    } catch (error) {
      console.error('Erro ao atualizar estatística:', error);
      throw error;
    }
  }

  // Simular empréstimo de livro (para teste)
  static async simularEmprestimo(userId, userType) {
    try {
      const currentStats = StatsCache.get(userId);
      if (!currentStats) {
        throw new Error('Estatísticas não encontradas no cache');
      }

      // Verificar se pode emprestar mais livros
      if (currentStats.livrosDisponiveis <= 0) {
        throw new Error(`Limite de empréstimos atingido (${currentStats.limiteConcorrente})`);
      }

      // Simular atualizações
      const newStats = {
        ...currentStats,
        livrosEmprestados: currentStats.livrosEmprestados + 1,
        livrosDisponiveis: currentStats.livrosDisponiveis - 1,
        ultimaAtualizacao: new Date().toISOString()
      };

      // Atualizar cache
      StatsCache.set(userId, newStats);

      console.log(`📚 Empréstimo simulado para ${userType}:`, {
        antes: { emprestados: currentStats.livrosEmprestados, disponíveis: currentStats.livrosDisponiveis },
        depois: { emprestados: newStats.livrosEmprestados, disponíveis: newStats.livrosDisponiveis }
      });

      return newStats;

    } catch (error) {
      console.error('Erro ao simular empréstimo:', error);
      throw error;
    }
  }

  // Simular devolução de livro (para teste)
  static async simularDevolucao(userId, userType) {
    try {
      const currentStats = StatsCache.get(userId);
      if (!currentStats) {
        throw new Error('Estatísticas não encontradas no cache');
      }

      // Verificar se tem livros para devolver
      if (currentStats.livrosEmprestados <= 0) {
        throw new Error('Nenhum livro para devolver');
      }

      // Simular atualizações
      const newStats = {
        ...currentStats,
        livrosEmprestados: currentStats.livrosEmprestados - 1,
        livrosDisponiveis: currentStats.livrosDisponiveis + 1,
        ultimaAtualizacao: new Date().toISOString()
      };

      // Atualizar cache
      StatsCache.set(userId, newStats);

      console.log(`📖 Devolução simulada para ${userType}:`, {
        antes: { emprestados: currentStats.livrosEmprestados, disponíveis: currentStats.livrosDisponiveis },
        depois: { emprestados: newStats.livrosEmprestados, disponíveis: newStats.livrosDisponiveis }
      });

      return newStats;

    } catch (error) {
      console.error('Erro ao simular devolução:', error);
      throw error;
    }
  }

  // Buscar histórico de empréstimos
  static async getUserHistory(userId, userType, page = 1, limit = 10) {
    try {
      const endpoint = `${API_BASE_URL}/api/${userType}s/${userId}/historico-emprestimos`;
      
      const response = await fetch(`${endpoint}?page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar histórico: ${response.statusText}`);
      }

      return await response.json();

    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      throw error;
    }
  }

  // Calcular limites e disponibilidade para diferentes tipos de usuário
  static calculateUserLimits(userType, currentLoans = 0) {
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
}

export default StatsService;