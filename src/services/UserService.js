import api from "./api";

// Autenticação
export const login = async (email, password) => {
	const res = await api.post("/usuarios/login", { email, password });
	const result = res.data;
	if (result.success && result.data.token)
		localStorage.setItem("authToken", result.data.token);
	if (result.success) {
		return result.data;
	} else {
		throw new Error(result.error || "Erro no login");
	}
};

export const logout = () => {
	localStorage.removeItem("authToken");
};

export const isAuthenticated = () => !!localStorage.getItem("authToken");
export const getAuthToken = () => localStorage.getItem("authToken");

// Usuário CRUD
export const register = async (dados) => {
	const res = await api.post("/usuarios/register", dados);
	const result = res.data;
	if (result.success) {
		return result.data;
	} else {
		throw new Error(result.error || "Erro no cadastro");
	}
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
	const blob = new Blob([JSON.stringify(data, null, 2)], {
		type: "application/json",
	});
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = "front_req_res_log.json";
	a.click();
	URL.revokeObjectURL(url);
};

export const getAllUsers = async (token) => {
	const res = await api.get("/usuarios", {
		headers: { Authorization: `Bearer ${token}` },
	});
	return res.data;
};
