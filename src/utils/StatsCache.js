// Utilitário para cache de estatísticas do usuário (usado para evitar requisições desnecessárias à API)

const CACHE_KEY_PREFIX = 'lumibook_stats_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const StatsCache = {
  // Salva estatísticas no cache localStorage
  set: (userId, stats) => {
    const cacheData = {
      data: stats,
      timestamp: Date.now(),
      userId
    };
    try {
      localStorage.setItem(
        `${CACHE_KEY_PREFIX}${userId}`, 
        JSON.stringify(cacheData)
      );
    } catch (error) {
      console.warn('Erro ao salvar cache de estatísticas:', error);
    }
  },

  // Busca estatísticas do cache, se ainda estiverem válidas
  get: (userId) => {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
      if (!cached) return null;
      const cacheData = JSON.parse(cached);
      const now = Date.now();
      // Só retorna se o cache não expirou
      if (now - cacheData.timestamp > CACHE_DURATION) {
        StatsCache.remove(userId);
        return null;
      }
      return cacheData.data;
    } catch (error) {
      console.warn('Erro ao ler cache de estatísticas:', error);
      return null;
    }
  },

  // Remove estatísticas do cache para um usuário
  remove: (userId) => {
    try {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${userId}`);
    } catch (error) {
      console.warn('Erro ao remover cache de estatísticas:', error);
    }
  },

  // Limpa todo o cache de estatísticas do sistema
  clear: () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEY_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Erro ao limpar cache de estatísticas:', error);
    }
  }
};

export default StatsCache;