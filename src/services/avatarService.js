// src/services/avatarService.js
import api from "./api";

// Busca o avatar do usuário pelo ID
export const getUserAvatar = async (userId, token) => {
	try {
		const res = await api.get(`/usuarios/${userId}/avatar`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		return res.data.avatarUrl;
	} catch {
		// Retorna um avatar padrão se houver erro na busca
		// Retorne um avatar padrão se der erro
		return "https://ui-avatars.com/api/?name=Usuário&background=3B82F6&color=fff&size=128";
	}
};
