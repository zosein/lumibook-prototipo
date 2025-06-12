import { useState, useEffect } from 'react';
import StatsService from '../services/StatsService';

export function useUserStats(user, isLoggedIn, statsKey = 0) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchUserStats() {
      if (!isLoggedIn || !user) {
        setStats(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const userId = decodedToken.id;
        
        const statsData = await StatsService.getUserStats(userId, false);
        if (!statsData || typeof statsData !== 'object') {
          setError('Não foi possível carregar as estatísticas.');
          setStats(null);
        } else {
          setStats(statsData);
        }
      } catch (err) {
        setError(err.message || "Erro ao carregar estatísticas");
        setStats(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUserStats();
  }, [user, user?.id, user?.papel, isLoggedIn, statsKey]);

  return { stats, loading, error };
} 