import api from "./api";

// Padronização de endpoints
const LOANS_ENDPOINT = "/api/loans";

export const createLoan = async (loanData, token) => {
  try {
    const res = await api.post(LOANS_ENDPOINT, loanData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(`Erro ao criar empréstimo: ${error.response?.data?.message || error.message}`);
  }
};

export const returnLoan = async (loanId, condition, token) => {
  try {
    const res = await api.put(
      `${LOANS_ENDPOINT}/${loanId}/devolucao`,
      { condition }, // Adicionado estado do livro
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    throw new Error(`Erro ao devolver empréstimo: ${error.response?.data?.message || error.message}`);
  }
};

export const renewLoan = async (loanId, token) => {
  try {
    const res = await api.post(
      `${LOANS_ENDPOINT}/${loanId}/renovacao`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
  } catch (error) {
    throw new Error(`Erro ao renovar empréstimo: ${error.response?.data?.message || error.message}`);
  }
};

export const getActiveLoans = async (token) => {
  try {
    const res = await api.get(`${LOANS_ENDPOINT}/ativos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(`Erro ao buscar empréstimos ativos: ${error.response?.data?.message || error.message}`);
  }
};

export const getLoanById = async (id, token) => {
  try {
    const res = await api.get(`${LOANS_ENDPOINT}/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(`Erro ao buscar empréstimo: ${error.response?.data?.message || error.message}`);
  }
};

export const getLoanHistory = async (userId, token) => {
  try {
    const res = await api.get(`/api/reservations/history`, {
      params: { userId },
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(`Erro ao buscar histórico: ${error.response?.data?.message || error.message}`);
  }
};

export const cancelLoan = async (emprestimoId, token) => {
  try {
    const res = await api.delete(`/emprestimos/${emprestimoId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(`Erro ao cancelar empréstimo: ${error.response?.data?.message || error.message}`);
  }
};