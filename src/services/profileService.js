import api from "./api";

// Busca o perfil do usuário autenticado (aluno, professor ou admin)
export const getProfile = async (token) => {
  const res = await api.get("/usuarios/perfil", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Atualiza o perfil do usuário autenticado
export const updateProfile = async (dados, token) => {
  const res = await api.patch("/usuarios/perfil", dados, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 