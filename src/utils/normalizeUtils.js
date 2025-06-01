// src/utils/normalizeUtils.js
import { formatTimeAgo } from "./dateUtils";

export function normalizeActivityData(activity) {
	return {
		id: activity.id,
		action: activity.descricao || activity.action,
		details: activity.detalhes || activity.details,
		time: activity.dataHora
			? formatTimeAgo(new Date(activity.dataHora))
			: "Recente",
		icon: activity.icon || "Activity",
		color: activity.cor || "blue",
		userId: activity.usuarioId,
	};
}
