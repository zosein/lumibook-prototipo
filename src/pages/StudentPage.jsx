import React, { useEffect, useState } from 'react';
import StatsService from '../services/StatsService';

const StudentPage = () => {
  const [userStats, setUserStats] = useState([]);

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        console.log('Usuário do localStorage:', user);
        if (user && user._id) {
          console.log('ID do usuário:', user._id);
          const stats = await StatsService.getUserStats(user._id);
          console.log('Estatísticas recebidas:', stats);
          setUserStats(stats);
        } else {
          console.error('Usuário não encontrado no localStorage ou sem ID');
        }
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    };

    fetchUserStats();
  }, []);

  return (
    <div>
      {/* Renderização do componente com base nos dados do usuário */}
    </div>
  );
};

export default StudentPage; 