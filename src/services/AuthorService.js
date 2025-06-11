import api from "./api";

const AuthorService = {
  async searchAuthors(query) {
    const res = await api.get(`/api/authors/search?query=${encodeURIComponent(query)}`);
    return res.data;
  },

  async createAuthor(nome) {
    const res = await api.post(`/api/authors`, { nome });
    return res.data;
  },

  async getAuthorById(id) {
    const res = await api.get(`/api/authors/${id}`);
    return res.data;
  },

  async getAllAuthors() {
    const res = await api.get(`/api/authors`);
    return res.data;
  },
};

export default AuthorService; 