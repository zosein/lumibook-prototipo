import api from "./api";

export const searchPublishers = async (q, token) => {
  const res = await api.get(`/editoras/buscar`, {
    params: { q },
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createPublisher = async (dados, token) => {
  const res = await api.post(`/editoras`, dados, {
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