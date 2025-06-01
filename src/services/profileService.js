import api from "./api";

// Buscar perfil do usuário/admin
export const getProfile = async (token) => {
  const res = await api.get("/usuarios/perfil", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Atualizar perfil do usuário/admin
export const updateProfile = async (dados, token) => {
  const res = await api.patch("/usuarios/perfil", dados, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}; 