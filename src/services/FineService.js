import api from "./api";
import { normalizeFine } from '../utils/normalizeUtils';

// Serviço responsável por operações relacionadas a multas de usuários
const FineService = {
  // Busca multas do usuário
  async getUserFines(userId) {
    const res = await api.get(`/api/fines/user/${userId}`);
    return res.data;
  },

  // Paga uma multa
  async payFine(fineId) {
    const res = await api.post(`/api/fines/${fineId}/pay`);
    return res.data;
  },

  // Cria uma nova multa para um usuário (ex: atraso na devolução)
  async createFine({ usuarioId, valor, motivo }) {
    const token = localStorage.getItem('authToken');
    const res = await api.post('/api/fines', { usuarioId, valor, motivo }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return normalizeFine(res.data);
  },

  // Busca histórico de multas
  async getFineHistory(userId) {
    const res = await api.get(`/api/fines/history/${userId}`);
    return res.data;
  },
};

export default FineService; 