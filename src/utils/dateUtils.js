// src/utils/dateUtils.js
// Função utilitária para formatar datas em formato "tempo atrás" (ex: 2h atrás, 3d atrás)
export function formatTimeAgo(date) {
	const now = new Date();
	const diffInMs = now - date;
	const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
	const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
	const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

	if (diffInMinutes < 1) {
		return "Agora";
	} else if (diffInMinutes < 60) {
		return `${diffInMinutes} min atrás`;
	} else if (diffInHours < 24) {
		return `${diffInHours}h atrás`;
	} else if (diffInDays < 7) {
		return `${diffInDays}d atrás`;
	} else {
		return date.toLocaleDateString("pt-BR");
	}
}
