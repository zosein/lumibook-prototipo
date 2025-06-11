import api from "./api";

const PublisherService = {
  async searchPublishers(query) {
    const res = await api.get(`/api/publishers/search?query=${encodeURIComponent(query)}`);
    return res.data;
  },

  async createPublisher(nome) {
    const res = await api.post(`/api/publishers`, { nome });
    return res.data;
  },

  async getPublisherById(id) {
    const res = await api.get(`/api/publishers/${id}`);
    return res.data;
  },

  async getAllPublishers() {
    const res = await api.get(`/api/publishers`);
    return res.data;
  },
};

export default PublisherService; 