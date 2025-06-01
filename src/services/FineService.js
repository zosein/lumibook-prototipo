import api from "./api";

export const getActiveFines = async (userId, token) => {
  const res = await api.get(`/multas`, {
    params: { userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const payFine = async (multaId, token) => {
  const res = await api.put(`/multas/${multaId}/pagar`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getFineHistory = async (userId, token) => {
  const res = await api.get(`/multas/historico`, {
    params: { userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 