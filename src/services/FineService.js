import api from "./api";
import { normalizeFine } from '../utils/normalizeUtils';

// Serviço responsável por operações relacionadas a multas de usuários
const FineService = {
  // Busca todas as multas de um usuário
  async getUserFines(userId) {
    const token = localStorage.getItem('authToken');
    const res = await api.get(`/api/fines/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(res.data) ? res.data.map(normalizeFine) : [];
  },

  // Paga uma multa específica
  async payFine(fineId) {
    const token = localStorage.getItem('authToken');
    return api.post(`/api/fines/${fineId}/pay`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  // Cria uma nova multa para um usuário (ex: atraso na devolução)
  async createFine({ usuarioId, valor, motivo }) {
    const token = localStorage.getItem('authToken');
    const res = await api.post('/api/fines', { usuarioId, valor, motivo }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeFine(res.data);
  },

  // Busca histórico de multas de um usuário
  async getFineHistory(userId) {
    const token = localStorage.getItem('authToken');
    const res = await api.get(`/api/fines/history/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return Array.isArray(res.data) ? res.data.map(normalizeFine) : [];
  },
};

export default FineService; 