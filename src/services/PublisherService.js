import api from "./api";

export const searchPublishers = async (q, token) => {
  const res = await api.get(`/editoras/buscar`, {
    params: { q },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createPublisher = async (dados, token) => {
  // Mapeamento para compatibilidade com a API
  const dadosAPI = {
    nome: dados.nome,
    cidade: dados.cidade || dados.endereco || '',
    pais: dados.pais || dados.contato || ''
  };
  const res = await api.post(`/editoras`, dadosAPI, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updatePublisher = async (id, dados, token) => {
  const res = await api.patch(`/editoras/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deletePublisher = async (id, token) => {
  const res = await api.delete(`/editoras/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 