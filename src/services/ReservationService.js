import api from "./api";
// import { normalizeReservation } from '../utils/normalizeUtils'; // Removido pois não é usado

// Serviço responsável por operações de reserva de livros
const ReservationService = {
  // Cria uma nova reserva para um livro e usuário
  async createReservation({ usuarioId, livroId, tituloLivro }) {
    const res = await api.post('/api/reservations', { 
      usuarioId, 
      livroId,
      tituloLivro,
      status: 'pendente'
    });
    return res.data;
  },

  // Busca todas as reservas de um usuário
  async getUserReservations(userId) {
    const res = await api.get(`/api/reservations/user/${userId}`);
    return res.data;
  },

  // Cancela uma reserva existente
  async cancelReservation(reservationId) {
    const res = await api.patch(`/api/reservations/${reservationId}`, {
      status: 'cancelada'
    });
    return res.data;
  },

  // Busca reservas pendentes para um livro específico
  async getBookReservations(bookId) {
    const res = await api.get(`/api/reservations/book/${bookId}`);
    return res.data;
  },

  // Atualiza o status de uma reserva
  async updateReservationStatus(reservationId, status) {
    const res = await api.patch(`/api/reservations/${reservationId}`, { status });
    return res.data;
  }
};

export default ReservationService;

export const createReservation = async (dados, token) => {
  const res = await api.post("/api/reservations", {
    ...dados,
    status: 'pendente',
    dataReserva: new Date().toISOString()
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const cancelReservation = async (reservaId, token) => {
  const res = await api.patch(`/api/reservations/${reservaId}`, {
    status: 'cancelada'
  }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
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