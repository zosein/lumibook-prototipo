// Utilitário para cache de estatísticas do usuário

const CACHE_KEY_PREFIX = 'lumibook_stats_';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const StatsCache = {
  // Salvar estatísticas no cache
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

  // Buscar estatísticas do cache
  get: (userId) => {
    try {
      const cached = localStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      const now = Date.now();

      // Verificar se o cache ainda é válido
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

  // Remover estatísticas do cache
  remove: (userId) => {
    try {
      localStorage.removeItem(`${CACHE_KEY_PREFIX}${userId}`);
    } catch (error) {
      console.warn('Erro ao remover cache de estatísticas:', error);
    }
  },

  // Limpar todo o cache de estatísticas
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