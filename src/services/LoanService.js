import api from "./api";

export const createLoan = async (dados, token) => {
  const res = await api.post("/emprestimos", dados, {
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

export const getActiveLoans = async (userId, token) => {
  const res = await api.get(`/emprestimos`, {
    params: { userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getLoanHistory = async (userId, token) => {
  const res = await api.get(`/emprestimos/historico`, {
    params: { userId },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const cancelLoan = async (emprestimoId, token) => {
  const res = await api.delete(`/emprestimos/${emprestimoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 