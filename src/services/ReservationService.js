import api from "./api";

export const createReservation = async (dados, token) => {
  const res = await api.post("/reservas", dados, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const cancelReservation = async (reservaId, token) => {
  const res = await api.delete(`/reservas/${reservaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getActiveReservations = async (userId, token) => {
  const res = await api.get(`/reservas`, {
    params: { userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getReservationHistory = async (userId, token) => {
  const res = await api.get(`/reservas/historico`, {
    params: { userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 