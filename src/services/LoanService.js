import api from "./api";

// Padronização de endpoints
const LOANS_ENDPOINT = "/api/loans";

export const createLoan = async (loanData, token) => {
  try {
    const res = await api.post(LOANS_ENDPOINT, {
      ...loanData,
      status: 'ativo',
      dataEmprestimo: new Date().toISOString(),
      dataPrevistaDevolucao: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // +15 dias
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(`Erro ao criar empréstimo: ${error.response?.data?.message || error.message}`);
  }
};

export const returnLoan = async (loanId, token) => {
  try {
    const res = await api.patch(`${LOANS_ENDPOINT}/${loanId}/return`, {
      status: 'devolvido',
      dataDevolucao: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } catch (error) {
    throw new Error(`Erro ao devolver livro: ${error.response?.data?.message || error.message}`);
  }
};

export const renewLoan = async (loanId, token) => {
  try {
    const res = await api.patch(`${LOANS_ENDPOINT}/${loanId}/renew`, {
      dataPrevistaDevolucao: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString() // +15 dias
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
    const res = await api.get(`${LOANS_ENDPOINT}/history`, {
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