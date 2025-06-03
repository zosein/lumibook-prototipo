import api from "./api";

// Serviço responsável por operações de reserva de livros
const ReservationService = {
  // Cria uma nova reserva para um livro e usuário
  async createReservation({ userId, bookId }) {
    // Regra: só permite reserva se o livro estiver disponível
    return api.post('/reservations', { userId, bookId });
  },

  // Busca todas as reservas de um usuário
  async getUserReservations(userId) {
    return api.get(`/reservations/user/${userId}`);
  },

  // Cancela uma reserva existente
  async cancelReservation(reservationId) {
    // Regra: só pode cancelar reservas que ainda não foram retiradas
    return api.delete(`/reservations/${reservationId}`);
  },

  // Busca reservas pendentes para um livro específico
  async getBookReservations(bookId) {
    return api.get(`/reservations/book/${bookId}`);
  },

  // Atualiza o status de uma reserva (ex: retirada, devolvida)
  async updateReservationStatus(reservationId, status) {
    // Status possíveis: 'pendente', 'retirada', 'devolvida', 'cancelada'
    return api.patch(`/reservations/${reservationId}`, { status });
  },
};

export default ReservationService;

export const createReservation = async (dados, token) => {
  const res = await api.post("/reservations", dados, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    livroId: res.data.livroId || null,
    exemplarId: res.data.exemplarId || null,
    dataReserva: res.data.dataReserva || '',
    ...res.data
  };
};

export const cancelReservation = async (reservaId, token) => {
  const res = await api.delete(`/reservations/${reservaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getActiveReservations = async (userId, token) => {
  const res = await api.get(`/reservations`, {
    params: { userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return (res.data || []).map(r => ({
    livroId: r.livroId || null,
    exemplarId: r.exemplarId || null,
    dataReserva: r.dataReserva || '',
    ...r
  }));
};

export const getReservationHistory = async (token) => {
  const res = await api.get(`/reservations/historico`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (res.data || []).map(r => ({
    livroId: r.livroId || null,
    exemplarId: r.exemplarId || null,
    dataReserva: r.dataReserva || '',
    ...r
  }));
}; 