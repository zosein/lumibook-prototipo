import api from "./api";

// Serviço responsável por operações de exemplares
const ExemplarService = {
  // Listar todos os exemplares
  async getAll(token) {
    const res = await api.get("/copies", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Buscar exemplar por ID
  async getById(id, token) {
    const res = await api.get(`/copies/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Cadastrar exemplar
  async create(data, token) {
    const res = await api.post("/copies", data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Atualizar exemplar (PATCH)
  async update(id, data, token) {
    const res = await api.patch(`/copies/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  // Deletar exemplar
  async remove(id, token) {
    const res = await api.delete(`/copies/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

export default ExemplarService; 