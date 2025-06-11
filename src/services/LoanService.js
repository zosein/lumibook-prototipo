import api from "./api";

export const createLoan = async (dados, token) => {
  const res = await api.post("/api/loans", dados, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const returnLoan = async (emprestimoId, token) => {
  const res = await api.put(`/emprestimos/${emprestimoId}/devolucao`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getActiveLoans = async (token) => {
  const res = await api.get(`/api/loans/ativos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getLoanById = async (id) => {
  const res = await api.get(`/api/loans/${id}`);
  return res.data;
};

export const getLoanHistory = async () => {
  const res = await api.get(`/api/reservations/history`);
  return res.data;
};

export const cancelLoan = async (emprestimoId, token) => {
  const res = await api.delete(`/emprestimos/${emprestimoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 