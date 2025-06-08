import api from "./api";

// Serviço responsável por operações de reserva de livros
const ReservationService = {
  // Cria uma nova reserva para um livro e usuário
  async createReservation({ userId, bookId }) {
    return api.post('/reservations', { userId, bookId });
  },

  // Busca todas as reservas de um usuário
  async getUserReservations(userId) {
    return api.get(`/reservations/user/${userId}`);
  },

  // Cancela uma reserva existente
  async cancelReservation(reservationId) {
    return api.delete(`/reservations/${reservationId}`);
  },

  // Busca reservas pendentes para um livro específico
  async getBookReservations(bookId) {
    return api.get(`/reservations/book/${bookId}`);
  },

  // Atualiza o status de uma reserva (ex: retirada, devolvida)
  async updateReservationStatus(reservationId, status) {
    return api.patch(`/reservations/${reservationId}`, { status });
  },
};

export default ReservationService;

export const createReservation = async (dados, token) => {
  const res = await api.post("/reservations", dados, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = res.data;
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error || 'Erro ao criar reserva');
  }
};

export const cancelReservation = async (reservaId, token) => {
  const res = await api.delete(`/reservations/${reservaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = res.data;
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error || 'Erro ao cancelar reserva');
  }
};

export const getActiveReservations = async (userId, token) => {
  const res = await api.get(`/reservations`, {
    params: { userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = res.data;
  if (result.success) {
    return (result.data || []).map(r => ({
      livroId: r.livroId || null,
      exemplarId: r.exemplarId || null,
      dataReserva: r.dataReserva || '',
      ...r
    }));
  } else {
    throw new Error(result.error || 'Erro ao buscar reservas ativas');
  }
};

export const getReservationHistory = async (userId, token) => {
  const res = await api.get(`/reservations/historico`, {
    params: { userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = res.data;
  if (result.success) {
    return (result.data || []).map(r => ({
      livroId: r.livroId || null,
      exemplarId: r.exemplarId || null,
      dataReserva: r.dataReserva || '',
      ...r
    }));
  } else {
    throw new Error(result.error || 'Erro ao buscar histórico de reservas');
  }
}; 