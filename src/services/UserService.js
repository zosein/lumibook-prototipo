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

export const registerBibliotecario = async (dados, token) => {
	const res = await api.post("/bibliotecarios", dados, {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
};

export const exportFrontReqResLog = () => {
	const data = window._frontReqResLog || [];
	const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = 'front_req_res_log.json';
	a.click();
	URL.revokeObjectURL(url);
};
