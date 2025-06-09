import api from "./api";
import { normalizeUser } from '../utils/normalizeUtils';

// Autenticação
export const login = async (usuario, password) => {
	let payload;
	if (usuario.includes('@')) {
		payload = { email: usuario, password };
	} else {
		payload = { matricula: usuario, password };
	}
	const res = await api.post("/users/login", payload);
	const result = res.data;
	if (result.success) {
		const data = result.data;
		// Garante que o campo 'token' exista, mesmo que venha como 'accessToken'
		if (!data.token && data.accessToken) {
			data.token = data.accessToken;
		}
		return data;
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
	const payload = { ...dados };
	if (payload.senha) {
		payload.password = payload.senha;
		delete payload.senha;
	}
	const res = await api.post("/users/register", payload);
	const result = res.data;
	if (result.success) {
		return result.data;
	} else {
		throw new Error(result.error || "Erro no cadastro");
	}
};

export const getUserById = async (id) => {
	const res = await api.get(`/users/${id}`);
	return normalizeUser(res.data);
};

export const updateUser = async (id, dados) => {
	const res = await api.patch(`/users/${id}`, dados);
	return res.data;
};

export const deleteUser = async (id) => {
	const res = await api.delete(`/users/${id}`);
	return res.data;
};

export const getUserProfile = async (id, userType = "student") => {
	const res = await api.get(`/users/${id}`);
	return normalizeUser(res.data);
};

export const getSystemActivities = async () => {
	const res = await api.get("/audit");
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

export const getAllUsers = async () => {
	const res = await api.get("/users");
	return Array.isArray(res.data) ? res.data.map(normalizeUser) : [];
};
