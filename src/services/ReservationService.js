import api from "./api";
// import { normalizeReservation } from '../utils/normalizeUtils'; // Removido pois não é usado

// Serviço responsável por operações de reserva de livros
const ReservationService = {
  // Cria uma nova reserva para um livro e usuário
  async createReservation({ usuarioId, livroId }) {
    return api.post('/api/reservations', { usuarioId, livroId });
  },

  // Busca todas as reservas de um usuário
  async getUserReservations(userId) {
    return api.get(`/api/reservations/user/${userId}`);
  },

  // Cancela uma reserva existente
  async cancelReservation(reservationId) {
    return api.delete(`/api/reservations/${reservationId}`);
  },

  // Busca reservas pendentes para um livro específico
  async getBookReservations(bookId) {
    return api.get(`/api/reservations/book/${bookId}`);
  },

  // Atualiza o status de uma reserva (não existe PATCH no JSON, então removido)

  // Retira um livro reservado (efetiva o empréstimo)
  async retirarReserva(reservationId) {
    const res = await api.post(`/api/reservations/${reservationId}/retirar`);
    if (res.data && res.data.success) {
      return res.data.data;
    } else {
      throw new Error(res.data?.error || 'Erro ao retirar reserva');
    }
  },
};

export default ReservationService;

export const createReservation = async (dados, token) => {
  const res = await api.post("/api/reservations", dados, {
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
  const res = await api.delete(`/api/reservations/${reservaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const result = res.data;
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error || 'Erro ao cancelar reserva');
  }
};

export const getActiveReservations = async (userId) => {
  const token = localStorage.getItem('authToken');
  const res = await api.get(`/api/users/${userId}/reservas-ativas`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getReservationHistory = async (userId) => {
  const token = localStorage.getItem('authToken');
  const res = await api.get(`/api/users/${userId}/reservas-historico`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const retirarReserva = async (reservationId) => {
  const token = localStorage.getItem('authToken');
  const res = await api.post(`/api/reservations/${reservationId}/retirar`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.data && res.data.success) {
    return res.data.data;
  } else {
    throw new Error(res.data?.error || 'Erro ao retirar reserva');
  }
}; 