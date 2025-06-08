import api from "./api";

export const searchAuthors = async (q, token) => {
  const res = await api.get(`/authors/search`, {
    params: { q },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createAuthor = async (dados, token) => {
  // Mapeamento para compatibilidade com a API
  const dadosAPI = {
    name: dados.nome,
    biography: dados.bio || '',
    nationality: dados.nacionalidade || dados.nascimento || ''
  };
  const res = await api.post(`/authors`, dadosAPI, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateAuthor = async (id, dados, token) => {
  const res = await api.patch(`/authors/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deleteAuthor = async (id, token) => {
  const res = await api.delete(`/authors/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 