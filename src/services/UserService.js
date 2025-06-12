import api from "./api";
import { normalizeUser } from '../utils/normalizeUtils';

// Autenticação
export const login = async (usuario, senha) => {
	let payload;
	if (usuario.includes('@')) {
		payload = { email: usuario, senha };
	} else if (/^\d+$/.test(usuario)) {
		payload = { matricula: usuario, senha };
	} else {
		throw new Error("Digite um e-mail válido ou uma matrícula numérica.");
	}
	try {
		const res = await api.post("/api/users/login", payload);
		const result = res.data;
		if (result.success) {
			const data = result.data;
			return normalizeUser(data);
		} else {
			throw new Error(result.error || "Erro no login");
		}
	} catch (error) {
		if (error.response && error.response.status === 403) {
			throw new Error(error.response.data.error || "Acesso não permitido para este tipo de usuário.");
		}
		throw new Error(error.response?.data?.error || error.message || "Erro no login");
	}
};

export const logout = () => {
	localStorage.removeItem("authToken");
};

export const isAuthenticated = () => !!localStorage.getItem("authToken");
export const getAuthToken = () => localStorage.getItem("authToken");

// Usuário CRUD
export const register = async (dados) => {
	const payload = {
		nome: dados.nome,
		email: dados.email,
		senha: dados.senha,
		papel: dados.papel === 'aluno' ? 'aluno' : dados.papel
	};
	if (dados.matricula && dados.papel === 'aluno') {
		payload.matricula = dados.matricula;
	}
	const res = await api.post("/api/users/register", payload);
	return res.data;
};

export const getUserById = async (id) => {
	const res = await api.get(`/api/users/${id}`);
	return normalizeUser(res.data);
};

export const updateUser = async (id, dados) => {
	// Não há rota PATCH/PUT para update de usuário no JSON, então manter como está ou remover se não for usado
	const res = await api.patch(`/api/users/${id}`, dados);
	return res.data;
};

export const deleteUser = async (id) => {
	// Não há rota DELETE para usuário no JSON, então manter como está ou remover se não for usado
	const res = await api.delete(`/api/users/${id}`);
	return res.data;
};

export const getUserProfile = async (token) => {
	const res = await api.get("/api/users/profile", {
		headers: { Authorization: `Bearer ${token}` },
	});
	return normalizeUser(res.data);
};

export const getSystemActivities = async () => {
	const res = await api.get("/api/audit/logs");
	return res.data;
};

export const registerBibliotecario = async (dados, token) => {
	const payload = {
		nome: dados.nome,
		email: dados.email,
		senha: dados.senha
	};
	const res = await api.post("/api/librarians", payload, {
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
	const res = await api.get("/api/users");
	return Array.isArray(res.data) ? res.data.map(normalizeUser) : [];
};

// Atualiza status do usuário (ativa/desativa)
export const updateUserStatus = async (id, statusConta) => {
	const res = await api.patch(`/api/users/${id}`, { statusConta });
	return res.data;
};
