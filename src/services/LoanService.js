import api from "./api";

export const createLoan = async (dados, token) => {
  const res = await api.post("/emprestimos", dados, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return {
    livroId: res.data.livroId || null,
    itens: res.data.itens || [],
    dataEmprestimo: res.data.dataEmprestimo || '',
    dataPrevistaDevolucao: res.data.dataPrevistaDevolucao || '',
    ...res.data
  };
};

export const returnLoan = async (emprestimoId, token) => {
  const res = await api.put(`/emprestimos/${emprestimoId}/devolucao`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getActiveLoans = async (token) => {
  const res = await api.get(`/emprestimos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return (res.data || []).map(e => ({
    livroId: e.livroId || null,
    itens: e.itens || [],
    dataEmprestimo: e.dataEmprestimo || '',
    dataPrevistaDevolucao: e.dataPrevistaDevolucao || '',
    ...e
  }));
};

export const getLoanHistory = async (userId, userType, token) => {
  if (userType === 'aluno') {
    const res = await api.get(`/alunos/${userId}/historico-emprestimos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } else if (userType === 'professor') {
    const res = await api.get(`/professores/${userId}/historico-emprestimos`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  } else {
    return [];
  }
};

export const cancelLoan = async (emprestimoId, token) => {
  const res = await api.delete(`/emprestimos/${emprestimoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 