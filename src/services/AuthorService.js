import api from "./api";

export const searchAuthors = async (q, token) => {
  const res = await api.get(`/autores/buscar`, {
    params: { q },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createAuthor = async (dados, token) => {
  // Mapeamento para compatibilidade com a API
  const dadosAPI = {
    nome: dados.nome,
    biografia: dados.bio || '',
    nacionalidade: dados.nacionalidade || dados.nascimento || ''
  };
  const res = await api.post(`/autores`, dadosAPI, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateAuthor = async (id, dados, token) => {
  const res = await api.patch(`/autores/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteAuthor = async (id, token) => {
  const res = await api.delete(`/autores/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 