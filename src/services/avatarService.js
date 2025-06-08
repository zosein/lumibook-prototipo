// src/services/avatarService.js
import api from "./api";

// Busca o avatar do usuário pelo ID
export const getUserAvatar = async (userId, token) => {
	try {
		const res = await api.get(`/users/${userId}/avatar`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data;
	} catch (error) {
		console.error("Erro ao buscar o avatar do usuário:", error);
		return null;
	}
};