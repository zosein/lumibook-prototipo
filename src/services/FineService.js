import api from "./api";
import { normalizeFine } from '../utils/normalizeUtils';

// Serviço responsável por operações relacionadas a multas de usuários
const FineService = {
  // Busca todas as multas de um usuário
  async getUserFines(userId) {
    const res = await api.get(`/fines/user/${userId}`);
    return Array.isArray(res.data) ? res.data.map(normalizeFine) : [];
  },

  // Paga uma multa específica
  async payFine(fineId) {
    // Regra: só pode pagar multas em aberto
    return api.post(`/fines/${fineId}/pay`);
  },

  // Cria uma nova multa para um usuário (ex: atraso na devolução)
  async createFine({ userId, value, reason }) {
    const res = await api.post('/fines', { userId, value, reason });
    return normalizeFine(res.data);
  },

  // Busca histórico de multas de um usuário
  async getFineHistory(userId) {
    const res = await api.get(`/fines/history/${userId}`);
    return Array.isArray(res.data) ? res.data.map(normalizeFine) : [];
  },
};

export default FineService; 