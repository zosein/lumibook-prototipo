import api from "./api";

// Serviço responsável por operações relacionadas a multas de usuários
const FineService = {
  // Busca todas as multas de um usuário
  async getUserFines(userId) {
    return api.get(`/fines/user/${userId}`);
  },

  // Paga uma multa específica
  async payFine(fineId) {
    // Regra: só pode pagar multas em aberto
    return api.post(`/fines/${fineId}/pay`);
  },

  // Cria uma nova multa para um usuário (ex: atraso na devolução)
  async createFine({ userId, value, reason }) {
    // Regra: só cria multa se houver infração (ex: atraso, dano)
    return api.post('/fines', { userId, value, reason });
  },

  // Busca histórico de multas de um usuário
  async getFineHistory(userId) {
    return api.get(`/fines/history/${userId}`);
  },
};

export default FineService; 