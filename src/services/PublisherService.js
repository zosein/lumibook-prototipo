import api from "./api";

export const searchPublishers = async (q, token) => {
  const res = await api.get(`/publishers/search`, {
    params: { q },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createPublisher = async (dados, token) => {
  // Mapeamento para compatibilidade com a API
  const dadosAPI = {
    name: dados.nome,
    city: dados.cidade || dados.endereco || '',
    country: dados.pais || dados.contato || ''
  };
  const res = await api.post(`/publishers`, dadosAPI, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updatePublisher = async (id, dados, token) => {
  const res = await api.patch(`/publishers/${id}`, dados, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deletePublisher = async (id, token) => {
  const res = await api.delete(`/publishers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 