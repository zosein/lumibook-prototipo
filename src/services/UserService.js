import api from "./api";

// Autenticação
export const login = async (identificador, senha) => {
	const res = await api.post("/usuarios/login", { identificador, senha });
	if (res.data.token) localStorage.setItem("authToken", res.data.token);
	return res.data;
};

export const logout = () => {
	localStorage.removeItem("authToken");
};

export const isAuthenticated = () => !!localStorage.getItem("authToken");
export const getAuthToken = () => localStorage.getItem("authToken");

// Usuário CRUD
export const register = async (dados) => {
	const res = await api.post("/usuarios/register", dados);
	return res.data;
};

export const getUserById = async (id, token) => {
	const res = await api.get(`/usuarios/${id}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
};

export const updateUser = async (id, dados, token) => {
	const res = await api.patch(`/usuarios/${id}`, dados, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
};

export const deleteUser = async (id, token) => {
	const res = await api.delete(`/usuarios/${id}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
};

export const getUserProfile = async (id, userType = "aluno", token) => {
	const res = await api.get(`/usuarios/${id}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
};

export const getSystemActivities = async () => {
	const token = getAuthToken();
	const res = await api.get("/auditoria/logs", {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
};
